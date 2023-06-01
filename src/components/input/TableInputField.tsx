import {
  JSX,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
  useContext
} from "solid-js";
// import { closestCenter, createSortable, DragDropProvider, DragDropSensors, DragEventHandler, SortableProvider, } from "@thisbeyond/solid-dnd";
import { css } from "solid-styled-components";
import { toTitle } from "case-switcher-js";
import {
  findVertexByLabelAndUniqueId,
  replaceVertexProperties
} from "../../lib/Vertex";
import {
  getNewTxnId,
  graph,
  IdAttr,
  revertTransaction,
  Vertex
} from "../../lib/graph";
import { WsContext } from "../ws_events_dispatcher";
import { klona } from "klona";
import { DynamicComponent } from "../dynamicForm";
import {
  addMeta,
  addMetaVertexes,
  addNewRow,
  componentProps,
  deleteRow,
  FieldAttribute,
  FormContext,
  getCollAttrs,
  rowMetaInitialize
} from "../../lib/Record";
import {
  getChildVertexes,
  getOptionLabel,
  getSelectionOptions
} from "../../lib/Traverse";
import ScrollView from "devextreme/ui/scroll_view";
import Sortable from "devextreme/ui/sortable";
import { ComponentProps } from "../core/Form";
import { Icon } from "@iconify-icon/solid";
import { GenericField } from "./GenaricField";
// import SortableKanban from "../core/SortableField";
// import "../assets/styles/sortable.css";


export function TableInputField(props: Omit<ComponentProps, "setValue">) {
  const { Ws } = useContext(WsContext);
  let { record, cleanUpConfig } = useContext(FormContext);
  if (!record) {
    // on hot reload record is not available.
    return;
  }

  const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);
  const [sourceVertexes, setSourceVertexes] = createSignal([] as Vertex[]);

  // columns
  const tableColumnsTemplate = record.getMetaAttributes(props.meta);
  if (tableColumnsTemplate.length === 0) {
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

  // add dynamic meta from separate collection.
  // If props.meta.properties.attributes are not present and props.meta.props.collection is present then get attributes from the collection
  if (!props.meta.properties.attributes && props.meta.properties.meta) {
    const metaData = componentProps(props.meta, props.data);
    if (metaData.collection) {
      const collVertex = findVertexByLabelAndUniqueId("Coll", IdAttr, metaData.collection);
      if (collVertex) {
        const vertexCollAttrResult = getChildVertexes(["$0Attr"], [collVertex]);
        if (!vertexCollAttrResult.error) {
          const vertexCollAttr = vertexCollAttrResult.vertexes!;
          const attrs = [] as FieldAttribute[];
          for (const attr of vertexCollAttr) {
            const props = getCollAttrs(attr, { labels: ["Empty"], properties: {}, out_edges: {} } as unknown as Vertex);
            if (!props.error) attrs.push(props.attr!);
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
    const vertexes = record.getSublistRows(props.meta, props.data);
    setSortedVertexes(vertexes);
  });


  const KanbanCardRow = (p: { joinVertex: Vertex }) => {
    rowMetaInitialize(p.joinVertex, props.meta, tableColumnsTemplate);

    const attributesResult = getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]);
    if (attributesResult.error) alert("Error getting attributes");
    const rowColumnsMetaAttrs = attributesResult.vertexes!;

    const DisplayCardProperties = () => {
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

            const DefaultValue = () => <>{metaVertex.properties.props?.defaultValue &&
             getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}</>;
            const Content = () => <>
              <DynamicComponent
               id={""}
               component={component()}
               // When we have a Table we pass original Table Meta Vertex
               meta={component() === "Table" ? graph.vertexes[metaVertex.properties.templateId] : metaVertex}
               data={p.joinVertex}
               setValue={record.setValue}
              />
            </>;

            return (
             <Switch>
               <Match when={metaVertex.properties.props?.hidden}>
                 <div class="">
                   <DefaultValue />
                 </div>
               </Match>
               <Match when={component() === "Table"}>
                 <div class="">
                   <DefaultValue />
                   <Content />
                 </div>
               </Match>
               <Match when={true}>
                 <div class="flex align-items:center">
                   <DefaultValue />
                   <Content />
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
          <GenericField
           component={"ButtonGroup"}
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
            onClick={() => deleteRow(p.joinVertex, record.isRealTime, record.txnId, Ws)}
          />
        </div>
      </>
    );
  };

  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { joinVertex: Vertex; index: number }) => {
    // const sortable = createSortable(p.joinVertex.id);
    const metaTxnId = rowMetaInitialize(p.joinVertex, props.meta, tableColumnsTemplate);

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
      return (
        <For each={rowColumnsMetaAttrs}>
          {(metaVertex) => {
            const component = createMemo(() => {
              if (metaVertex.properties.component.includes("-")) {
                // Todo Fix: why this prints two times:
                console.log("refreshing");
                return getOptionLabel(p.joinVertex, metaVertex.properties.component);
              } else {
                return metaVertex.properties.component;
              }
            });
            // if mergeProps not keep reactivity use memo
            createEffect(() => {
              addMeta(metaVertex, p.joinVertex);
            });
            const DefaultValue = () => <>{metaVertex.properties.props?.defaultValue &&
             getOptionLabel(p.joinVertex, metaVertex.properties.props.defaultValue)}</>;
            const Content = () => <>
              <DynamicComponent
               id={""}
               component={component()}
               // When we have a Table we pass original Table Meta Vertex
               meta={component() === "Table" ? graph.vertexes[metaVertex.properties.templateId] : metaVertex}
               data={p.joinVertex}
               setValue={record.setValue}
               disabled={disabled()}
              />
            </>;

            return (
              <Switch>
                <Match when={metaVertex.properties.props?.hidden}>
                  <td>
                    <div class="">
                      <DefaultValue/>
                    </div>
                  </td>
                </Match>
                <Match when={component() === "Table"}>
                  <td>
                    <Show when={!props.disabled}>
                      <div class="">
                        <DefaultValue/>
                        <Content/>
                      </div>
                    </Show>
                  </td>
                </Match>
                <Match when={true}>
                  <td>
                    <div class="flex align-items:center">
                      <DefaultValue/>
                      <Content/>
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
              onClick={() => deleteRow(p.joinVertex, record.isRealTime, record.txnId, Ws)}
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
  //     if (isRealTime) commitTxn(txnId, Ws);
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
          {/*  <FormGroup form={{title: '', label: props.meta.properties.props.title || props.meta.properties[IdAttr], attributes: props.meta.properties.attributes}} vertex={props.vertex}/>*/}
          {/*</Show>*/}

          <GenericField
           component={"ButtonGroup"}
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
           onClick={() => addNewRow(record.txnId, props.meta, props.data!, record.isRealTime, Ws)}
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
