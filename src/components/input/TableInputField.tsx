import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
  untrack,
  useContext,
} from "solid-js";

import {
  closestCenter,
  createSortable,
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
  SortableProvider,
} from "@thisbeyond/solid-dnd";
import { css } from "solid-styled-components";
import { toTitle } from "case-switcher-js";
import {
  addNewVertex,
  deleteVertex,
  findVertexByLabelAndUniqueId,
  mergeVertexProperties,
  newVertex,
  replaceVertexProperties,
} from "../../lib/Vertex";
import { capitalizeFirstLetter } from "../../utils/utils";
import { addNewEdge, deleteEdge, newEdge } from "../../lib/Edge";
import {
  commitTxn,
  getNewGraphId,
  getNewTxnId,
  graph,
  Id,
  IdAttr,
  revertTransaction,
  Vertex
} from "../../lib/graph";
import { bindOwner } from "solid-forms";
import { ServerEventsDispatcher, WsContext } from "../ws_events_dispatcher";
import { klona } from "klona";
import { DynamicComponent, FormContext } from "../dynamicForm";
import { addMetaVertexes, getCollAttrs } from "../Form";
import { getChildVertex, getChildVertexes, getOptionLabel, getSelectionOptions, getToEdge } from "../../lib/Traverse";
import { removeUndefinedProperties } from "../../utils/functions";
import { ButtonGroupField } from "../core/ButtonGroup";
import ScrollView from "devextreme/ui/scroll_view";
import Sortable from "devextreme/ui/sortable";
import { ComponentProps } from "../core/Form";
import { Icon } from "@iconify-icon/solid";
// import SortableKanban from "../core/SortableField";
// import "../assets/styles/sortable.css";

// import { onChangeHandler } from "../core/dynamicForm";

export function newRow(
  txnId: number,
  parentVertex: Vertex,
  edgeType: string,
  label?: string,
): { error: boolean; vertexId?: Id; edgeId?: Id } {
  const vertexNew = newVertex(getNewGraphId(), [label || edgeType], {});
  const insertVertex = addNewVertex(txnId, vertexNew);
  if (insertVertex.error) {
    alert(insertVertex.error);
    return {
      error: true,
    };
  }

  const edgeNew = newEdge(getNewGraphId(), edgeType, {}, parentVertex.id, vertexNew.id);
  const insertEdgeResult = addNewEdge(txnId, edgeNew);
  if (insertEdgeResult.error) {
    alert(insertEdgeResult.error);
    return {
      error: true,
      vertexId: vertexNew.id,
    };
  }
  return {
    error: false,
    vertexId: vertexNew.id,
    edgeId: edgeNew.id,
  };
}

function getComponentProperties(metaRows: Vertex[]) {
  const metaData = metaRows.reduce((acc, curr) => {
    const key = getOptionLabel(curr, "->$0Key:properties.key||:properties.key");
    if (key) {
      acc[key] = curr.properties.value;
    }
    return acc;
  }, {} as { [key: string]: any });
  return metaData;
}

// TODO: when meta changed realtime its not updating.
function componentProps(metaVertex: Vertex, data: Vertex) {
  const meta = metaVertex.properties.meta.split("+");
  const results = [] as { [key: string]: any }[];
  for (const metaPart of meta) {
    const metaRows = getSelectionOptions(data, metaPart).vertexes || [];
    const metaData = getComponentProperties(metaRows);
    results.push(metaData);
  }
  return results.reduce((acc, curr) => {
    Object.assign(acc, curr);
    return acc;
  }, {} as { [key: string]: any });
}

// add meta from vertex value:
function addMeta(metaVertex: Vertex, data: Vertex) {
  if (metaVertex.properties.meta) {
    const metaData = componentProps(metaVertex, data);
    const metaDataVal = removeUndefinedProperties(metaData, false, 10);
    untrack(() => {
      const newMetaData = Object.assign(
        {},
        // when component is rendered dynamically graph.vertexes[metaVertex.properties.templateId] value is undefined
        graph.vertexes[metaVertex.properties.templateId]?.properties?.props || {},
        metaDataVal,
      );
      mergeVertexProperties(getNewTxnId(), metaVertex.id, {
        props: newMetaData,
      });
    });
  }
}

export function deleteRow(
  vertex: Vertex,
  local: boolean,
  isRealTime: boolean,
  txnId: number,
  Ws: ServerEventsDispatcher,
) {
  batch(() => {
    if (isRealTime) {
      txnId = getNewTxnId();
    }
    // delete all vertex in edges
    const inEdges = vertex.in_edges;
    for (const type in inEdges) {
      for (const edgeId of inEdges[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId);
        if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
      }
    }
    // delete all outEdges of vertex
    const outEdge = vertex.out_edges;
    for (const type in outEdge) {
      for (const edgeId of outEdge[type]) {
        const deleteEdgeResult = deleteEdge(txnId, edgeId);
        if (deleteEdgeResult?.error) alert(deleteEdgeResult.error);
      }
    }

    // delete vertex:
    const deleteResult = deleteVertex(txnId, vertex.id);
    if (deleteResult.error) alert(deleteResult.error);
    if (!local && isRealTime) commitTxn(txnId, Ws);
  });
}

export function TableInputField(props: Omit<ComponentProps, "setValue">) {
  const { Ws } = useContext(WsContext);
  let { local, cleanUpConfig, isRealTime, txnId } = useContext(FormContext);

  // const owner = getOwner();

  // todo check bindOwner and fix it
  const addNew = bindOwner(() => {
    batch(function () {
      if (isRealTime) {
        txnId = getNewTxnId();
      }
      const type = getToEdge(props.meta, props.data);
      const label = props.meta.properties.props?.label;

      newRow(txnId, props.data, type, label);
      if (!local && isRealTime) commitTxn(txnId, Ws);
    });
  });

  const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);
  const [sourceVertexes, setSourceVertexes] = createSignal([] as Vertex[]);

  // columns
  const tableColumnsTemplate = getChildVertexes(["MetaAttr"], [props.meta]); //.sort((a, b) => a.properties.pos - b.properties.pos);
  if (tableColumnsTemplate.error) {
    return "Cant find table columns";
  }

  const uniqueAttr = () => props.meta.properties.props?.unique;
  const isKanban = () => uniqueAttr() && props.meta.properties.props?.kanban && props.meta.properties.props.collection;
  // add source vertexes data to store
  if (isKanban()) {
    createEffect(() => {
      const vertexes = getSelectionOptions(props.data, props.meta.properties.props.collection).vertexes || [];
      setSourceVertexes(vertexes);
    });
  }

  // If props.meta.properties.attributes are not present and props.meta.props.collection is present then get attributes from the collection
  if (!props.meta.properties.attributes && props.meta.properties.meta) {
    const metaData = componentProps(props.meta, props.data);
    if (metaData.collection) {
      const collVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, metaData.collection);
      if (collVertex) {
        const vertexCollAttrResult = getChildVertexes(["$0Attr"], [collVertex]);
        if (!vertexCollAttrResult.error) {
          const vertexCollAttr = vertexCollAttrResult.vertexes!;
          const attrs = [];
          for (const attr of vertexCollAttr) {
            const props = getCollAttrs(attr, { labels: ["Empty"], properties: {}, out_edges: {} } as unknown as Vertex);
            if (!props.error) attrs.push(props.attr);
          }
          const newProperties = klona(props.meta.properties);
          newProperties.attributes = attrs;
          replaceVertexProperties(getNewTxnId(), props.meta.id, newProperties);

          const txnId = getNewTxnId();
          addMetaVertexes(txnId, props.meta, attrs);
          onCleanup(() => {
            revertTransaction(txnId);
          });
        }
      }
    }
  }

  // add row vertexes data to store
  createEffect(() => {
    const type = getToEdge(props.meta, props.data);
    const vertexes = (getChildVertexes([`${type}`], [props.data]).vertexes || []).sort(
      (a, b) => a.properties.pos - b.properties.pos,
    );
    setSortedVertexes(vertexes);
  });

  function rowMetaInitialize(joinVertex: Vertex) {
    const rowMetaAttrInst = getChildVertex(["AttrInst"], joinVertex);
    if (rowMetaAttrInst.error) {
      const metaTxnId = getNewTxnId();
      batch(() => {
        const metaInstanceResult = newRow(metaTxnId, joinVertex, "AttrInst");
        if (metaInstanceResult.error) {
          alert("Error creating a row for attribute instance");
        }
        mergeVertexProperties(metaTxnId, metaInstanceResult.vertexId!, {
          templateId: props.meta.id,
        });

        for (const attrColumn of tableColumnsTemplate.vertexes!) {
          const AttrInstResult = newRow(metaTxnId, graph.vertexes[metaInstanceResult.vertexId!], "MetaAttr");
          if (AttrInstResult.error) {
            alert(AttrInstResult.error);
          }
          mergeVertexProperties(metaTxnId, AttrInstResult.vertexId!, klona(attrColumn.properties));
          mergeVertexProperties(metaTxnId, AttrInstResult.vertexId!, {
            templateId: attrColumn.id,
          });
        }
      });
      onCleanup(() => {
        // remove all AttrInst vertex.
        // TODO: This is breaking when new row is added, its interesting to fix this.
        // console.log('called', metaTxnId)
        // revertTransaction(metaTxnId);
      });
      return metaTxnId;
    }
    return "";
  }
  const KanbanCardRow = (p: { joinVertex: Vertex }) => {
    rowMetaInitialize(p.joinVertex);

    const attributesResult = getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]);
    if (attributesResult.error) alert("Error getting attributes");
    const rowColumnsMetaAttrs = attributesResult.vertexes!;

    const DisplayCardProperties = () => {
      const setValue = (attribute: Vertex, value: any) => {
        if (isRealTime) {
          txnId = getNewTxnId();
        }
        mergeVertexProperties(txnId, p.joinVertex.id, {
          [attribute.properties[IdAttr]]: value,
        });
        if (!local && isRealTime) commitTxn(txnId, Ws);
      };

      return (
        <For each={rowColumnsMetaAttrs}>
          {(metaVertex) => {
            const component = createMemo(() => {
              if (metaVertex.properties.component.includes("-")) {
                // return getOptionLabel(metaVertex, metaVertex.properties.component);
                return getOptionLabel(p.joinVertex, metaVertex.properties.component);
              } else {
                return metaVertex.properties.component;
              }
            });
            // if mergeProps not keep reactivity use memo
            createEffect(() => {
              addMeta(metaVertex, p.joinVertex);
            });

            return (
              <Switch>
                <Match when={metaVertex.properties.props?.hidden}>
                  <div class="flex">
                    {metaVertex.properties.props?.defaultValue &&
                      getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                  </div>
                </Match>
                <Match when={component() === "Table"}>
                  <div class="flex">
                    {metaVertex.properties.props?.defaultValue &&
                      getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                    <DynamicComponent
                      id={""}
                      component={component()}
                      // When we have a Table we pass original Table Meta Vertex
                      meta={graph.vertexes[metaVertex.properties.templateId]}
                      data={p.joinVertex}
                      setValue={setValue}
                    />
                  </div>
                </Match>
                <Match when={true}>
                  <div class="flex align-items:center">
                    {metaVertex.properties.props?.defaultValue &&
                      getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                    <DynamicComponent
                      id={""}
                      component={component()}
                      meta={metaVertex}
                      data={p.joinVertex}
                      setValue={setValue}
                    />
                  </div>
                </Match>
              </Switch>
            );
          }}
        </For>
      );
    };

    return (
      <>
        <DisplayCardProperties />
        <div>
          <ButtonGroupField
            meta={
              {
                properties: {
                  [IdAttr]: "meta",
                  props: {
                    keyExpr: "id",
                    items: [
                      {
                        icon: "trash",
                        id: "delete",
                        hint: "Delete Row",
                      },
                    ],
                  },
                },
              } as unknown as Vertex
            }
            data={{ properties: { meta: [] } } as unknown as Vertex}
            onClick={() => deleteRow(p.joinVertex, local, isRealTime, txnId, Ws)}
          />
        </div>
      </>
    );
  };

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { joinVertex: Vertex; index: number }) => {
    // const sortable = createSortable(p.joinVertex.id);
    const metaTxnId = rowMetaInitialize(p.joinVertex);

    if (metaTxnId) {
      if (!cleanUpConfig.rowMetaTxnIds) {
        cleanUpConfig.rowMetaTxnIds = [];
      }
      // currently when we delete row and unmount form it is not giving error, but it should, because revertTransaction is not strict.
      cleanUpConfig.rowMetaTxnIds.push(metaTxnId);
    }

    const attributesResult = getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]);
    if (attributesResult.error) alert("Error getting attributes");
    const rowColumnsMetaAttrs = attributesResult.vertexes!;
    const [disabled, setDisabled] = createSignal(true);

    const DisplayProperties = () => {
      const setValue = (attribute: Vertex, value: any) => {
        if (isRealTime) {
          txnId = getNewTxnId();
        }
        mergeVertexProperties(txnId, p.joinVertex.id, {
          [attribute.properties[IdAttr]]: value,
        });
        if (!local && isRealTime) commitTxn(txnId, Ws);
      };

      return (
        <For each={rowColumnsMetaAttrs}>
          {(metaVertex) => {
            const component = createMemo(() => {
              if (metaVertex.properties.component.includes("-")) {
                // Todo Fix: why this prints two times:
                console.log("refreshing");
                // return getOptionLabel(metaVertex, metaVertex.properties.component);
                return getOptionLabel(p.joinVertex, metaVertex.properties.component);
              } else {
                return metaVertex.properties.component;
              }
            });
            // if mergeProps not keep reactivity use memo
            createEffect(() => {
              addMeta(metaVertex, p.joinVertex);
            });

            return (
              <Switch>
                <Match when={metaVertex.properties.props?.hidden}>
                  <td>
                    <div class="flex">
                      {metaVertex.properties.props?.defaultValue &&
                        getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                    </div>
                  </td>
                </Match>
                <Match when={component() === "Table"}>
                  <td>
                    <Show when={!props.disabled}>
                      <div class="flex">
                        {metaVertex.properties.props?.defaultValue &&
                          getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                        <DynamicComponent
                          id={""}
                          component={component()}
                          // When we have a Table we pass original Table Meta Vertex
                          meta={graph.vertexes[metaVertex.properties.templateId]}
                          data={p.joinVertex}
                          setValue={setValue}
                          disabled={disabled()}
                        />
                      </div>
                    </Show>
                  </td>
                </Match>
                <Match when={true}>
                  <td>
                    <div class="flex align-items:center">
                      {metaVertex.properties.props?.defaultValue &&
                        getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}
                      <DynamicComponent
                        id={""}
                        component={component()}
                        meta={metaVertex}
                        data={p.joinVertex}
                        setValue={setValue}
                        disabled={disabled()}
                      />
                    </div>
                  </td>
                </Match>
              </Switch>
            );
          }}
        </For>
      );
    };

    return (
      <tr
        // use:sortable
        // classList={{ "opacity-25": sortable.isActiveDraggable }}
        class=""
      >
        <td>
          <div class="flex align-items:center">
            {/*<Icon icon="material-symbols:drag-indicator" width={25} height={25} />*/}
            <Icon icon="material-symbols:keyboard-arrow-up" width={25} height={25} />
            <Icon icon="material-symbols:keyboard-arrow-down" width={25} height={25} />
            <Icon icon="material-symbols:add-box" width={25} height={25} />
            <Icon
              icon="material-symbols:restore-from-trash-outline"
              width={25}
              height={25}
              onClick={() => deleteRow(p.joinVertex, local, isRealTime, txnId, Ws)}
            />
            <Show when={!props.disabled}>
              <Icon icon="material-symbols:edit" width={25} height={25} onClick={() => setDisabled((v) => !v)} />
            </Show>
            {p.index + 1}
          </div>
        </td>
        <DisplayProperties />
      </tr>
    );
  };

  // @commented drag and drop related code.
  // const [activeDragItem, setActiveDragItem] = createSignal<number | string | null>(null);
  // const ids = () => sortedVertexes().map((vertex) => vertex.id);
  // const onDragStart: DragEventHandler = ({ draggable }) => {
  //   setActiveDragItem(draggable.id);
  // };
  // const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
  //   if (draggable && droppable) {
  //     const currentItems = ids();
  //     const fromIndex = currentItems.indexOf(draggable.id as number);
  //     const toIndex = currentItems.indexOf(droppable.id as number);
  //     if (isRealTime) {
  //       txnId = getNewTxnId();
  //     }
  //     if (fromIndex !== toIndex) {
  //       const updatedItems = currentItems.slice();
  //       updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
  //       // runWithOwner(owner, () => {
  //       batch(() => {
  //         updatedItems.forEach((vertexId, index) => {
  //           const { error } = mergeVertexProperties(txnId, vertexId, {
  //             pos: index + 1,
  //           });
  //           if (error) alert(error);
  //         });
  //       });
  //     }
  //     if (!local && isRealTime) commitTxn(txnId, Ws);
  //   }
  //   setActiveDragItem(null);
  // };

  // @ts-ignore
  const Kanban = () => {
    return (
      <div
        class="sortable-board sortable-lists"
        ref={(containerEl) => {
          new ScrollView(containerEl, {
            direction: "horizontal",
            showScrollbar: "always",
          });
        }}
      >
        <div class="list">
          <div class="list-title dx-theme-text-color">Sources</div>
          <div
            class="scrollable-list"
            ref={(scrollEl) => {
              new ScrollView(scrollEl, {
                direction: "vertical",
                showScrollbar: "always",
              });
            }}
          >
            <div
              class="sortable-cards"
              ref={(itemsEl) => {
                new Sortable(itemsEl, {
                  group: "tasksGroup",
                  moveItemOnDrop: true,
                });
              }}
            >
              <For each={sourceVertexes()}>
                {(source) => (
                  <div class="card dx-card dx-theme-text-color dx-theme-background-color">
                    {/*<div class="card-priority priority-1"/>*/}

                    <div class="card-subject">{source.properties[IdAttr]}</div>
                    <div class="card-assignee">String</div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        <div class="list">
          <div class="list-title dx-theme-text-color">Target</div>
          <div
            // class="scrollable-list"
            ref={(scrollEl) => {
              new ScrollView(scrollEl, {
                direction: "vertical",
                showScrollbar: "always",
              });
            }}
          >
            <div
              class="sortable-cards"
              ref={(itemsEl) => {
                new Sortable(itemsEl, {
                  group: "tasksGroup",
                  moveItemOnDrop: true,
                });
              }}
            >
              <For each={sourceVertexes()}>
                {(vertex) => (
                  <div style="width: auto;" class="card dx-card dx-theme-text-color dx-theme-background-color">
                    {/*<div class="card-priority priority-1"/>*/}
                    <div class="card-subject">
                      <KanbanCardRow joinVertex={vertex} />
                    </div>
                    <div class="card-assignee"></div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <Switch>
      {/*<Match when={isKanban()}>*/}
      {/*  <Kanban/>*/}
      {/*  <SortableKanban/>*/}
      {/*</Match>*/}
      <Match when={true}>
        <div>
          {/*<Show when={props.meta.properties.attributes}>*/}
          {/*  <DynamicForm form={{title: '', label: props.meta.properties.props.title || props.meta.properties[IdAttr], attributes: props.meta.properties.attributes}} vertex={props.vertex}/>*/}
          {/*</Show>*/}

          <ButtonGroupField
            meta={
              {
                properties: {
                  [IdAttr]: "meta",
                  props: {
                    keyExpr: "id",
                    items: [
                      {
                        icon: "add",
                        id: "add",
                        hint: "Add New",
                      },
                    ],
                  },
                },
              } as unknown as Vertex
            }
            data={{ properties: { meta: [] } } as unknown as Vertex}
            onClick={addNew}
          />

          <div
            class={css`
             table,
             th,
             td {
               border: 1px solid rgba(0, 0, 0, 0.1);
               border-collapse: collapse;
             }
           `}
          >
            <table>
              <thead>
                <tr>
                  <th></th>
                  <For each={props.meta.properties.attributes}>
                    {(attribute) => {
                      return (
                        <Switch>
                          {/*<Match when={attribute.props?.skip}></Match>*/}
                          <Match when={!attribute.props?.hidden || attribute.props?.defaultValue}>
                            <th title={attribute.props?.hint}>{toTitle(attribute.displayName || attribute[IdAttr])}</th>
                          </Match>
                          <Match when={true}>
                            <th></th>
                          </Match>
                        </Switch>
                      );
                    }}
                  </For>
                </tr>
              </thead>
              <tbody>
                {/*<DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetector={closestCenter}>*/}
                {/*  <DragDropSensors />*/}
                {/*  <SortableProvider ids={ids()}>*/}
                <For each={sortedVertexes()} fallback={<div>No Columns</div>}>
                  {(vertex, index) => <SortableRow joinVertex={vertex} index={index()} />}
                </For>
                {/*  </SortableProvider>*/}
                {/*</DragDropProvider>*/}
              </tbody>
            </table>
          </div>
        </div>

        {/*<Show when={props.page}>*/}
        {/*  <For each={Object.values(props.page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
        {/*</Show>*/}
      </Match>
    </Switch>
  );
}
