import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  For,
  getOwner,
  Match,
  on,
  onCleanup,
  runWithOwner,
  Show,
  splitProps,
  Switch,
  useContext,
} from "solid-js";
import "~/css/table.css";
import { toTitle } from "case-switcher-js";
import { mergeVertexProperties, replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { getNewTxnId, revertTransaction } from "~/lib/graph/transaction";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { klona } from "klona";
import { DynamicComponent } from "~/components/dynamic/components/DynamicComponent";
import { FormContext } from "~/lib/Utils";
import {
  getChildVertex,
  getChildVertexes,
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import {
  addMetaVertexes,
  addNewRow,
  getSublistRows,
} from "~/lib/graph/mutate/form_functions";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";
import type { ComponentProps } from "~/components/ComponentType";
import { Icon } from "@iconify-icon/solid";
import {
  PageRenderContext,
  PageRenderUtils,
  RepeaterContext,
} from "~/components/dynamic/fields/static/GenaricField";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
import { getLastItem } from "~/lib/functions";
import type { FieldAttribute } from "~/lib/Type";
import "~/css/base.css";
import {
  componentProps,
  getCollAttrs,
  getStringComponent,
} from "~/lib/graph/get/sync/graph_functions";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { addMeta, rowMetaInitialize } from "~/lib/graph/mutate/form_functions";
import { useToast } from "~/components/custom/Toast";
import { NewTxnIdContext } from "~/lib/contexts";

export function TableInputField(
  props: ComponentProps & {
    txnId?: number;
    isRealTime?: boolean;
    isShowAdd?: boolean;
  },
) {
  const [field, others] = splitProps(props, [
    "meta",
    "data",
    "isRealTime",
    "disabled",
    "isShowAdd",
    "txnId",
    "setValue",
  ]);

  const { Ws } = useContext(WsContext);
  const { showErrorToast } = useToast();

  const [graph, setGraph] = useContext(GraphContext)!;
  // if there is no parent FormContext, it should still work.
  const { cleanUpConfig } = useContext(FormContext);
  const outerOwner = getOwner();
  const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);

  const getAttributes = () => {
    // If child vertexes, use it
    const childAttrVertex = getChildVertexes(
      graph,
      ["Attr", "$0Att"],
      [field.meta],
    ).vertexes;
    if (childAttrVertex?.length) {
      return childAttrVertex;
    }


    // else get attributes from a collection.
    const attrVertex = getChildVertex(graph, ["$0Att"], field.meta).vertex;
    if (!attrVertex) return;

    return getChildVertexes(graph, ["Attr"], [attrVertex]).vertexes;
  };

  const tableColumnsTemplate = createMemo(
    () =>
      getAttributes() ||
      getChildVertexes(graph, ["MetaAttr"], [field.meta]).vertexes ||
      [],
  );

  // add dynamic field.meta from separate collection.
  // If field.meta.P.attributes are not present and field.meta.props.collection is present then get attributes from the collection
  if (!field.meta.P.attributes && field.meta.P.meta) {
    const metaData = componentProps(graph, setGraph, field.meta, field.data!);
    if (metaData.collection) {
      // add metadata from separate collection.
      const collVertex = findVertexByLabelAndUniqueId(
        graph,
        "Coll",
        IdAttr,
        metaData.collection,
      );
      if (collVertex) {
        const vertexCollAttrResult = getChildVertexes(
          graph,
          ["Attr"],
          [collVertex],
        );
        if (!vertexCollAttrResult.error) {
          const vertexCollAttr = vertexCollAttrResult.vertexes!;
          const attrs = [] as FieldAttribute[];
          for (const attr of vertexCollAttr) {
            const props = getCollAttrs(graph, setGraph, attr);
            if (!props.error) attrs.push(attr!);
          }
          const newProperties = klona(field.meta.P);
          newProperties.attributes = attrs;
          replaceVertexProperties(
            useContext(NewTxnIdContext),
            field.meta.id,
            graph,
            setGraph,
            newProperties,
          );

          const txnId = getNewTxnId(graph, setGraph);
          addMetaVertexes(graph, setGraph, txnId, field.meta, attrs);
          onCleanup(() => {
            revertTransaction(txnId);
          });
        }
      }
    }
  }
  const parentItems = useContext(PageRenderContext);

  const parentData = createMemo(() => {
    return PageRenderUtils.getDataVertex(graph, getLastItem(parentItems, 1));
  });
  // load data:
  // add row vertexes data to store
  createEffect(() => {
    // if a parent has data vertex use it,
    // TODO: else if it has a parent Form Container(Record) use it.
    const vertexes = getSublistRows(
      graph,
      field.meta,
      field.data || parentData(),
    );
    setSortedVertexes(vertexes);
  });

  const [dragToIndex, setDragToIndex] = createSignal<number | null>(null);
  const [dragFromIndex, setDragFromIndex] = createSignal<number | null>(null);
  // Todo dont allow duplicate value in the select field
  const SortableRow = (p: { joinVertex: Vertex; index: number }) => {


    const handleDrop = () => {
      if (dragFromIndex() !== null && dragToIndex() !== null && dragFromIndex() !== dragToIndex()) {
        const updatedRows = [...sortedVertexes()];
        const [draggedRow] = updatedRows.splice(dragFromIndex()!, 1);
        updatedRows.splice(dragToIndex()!, 0, draggedRow);
        setSortedVertexes(updatedRows);
        updatedRows.forEach((vertex, index) => {
          mergeVertexProperties(props.txnId!, vertex.id, graph, setGraph, { pos: index + 1 });
        });
      }
      setDragFromIndex(null);
      setDragToIndex(null)
    };
    const metaVertices = new Map();

    const getMetaVertex = (columnId: any) => {
      if (!metaVertices.has(columnId)) {
        const instRes = instResult();
        const rowId = instRes?.P?.rows[columnId];
        if (rowId !== undefined && graph.vertexes[rowId]) {
          metaVertices.set(columnId, graph.vertexes[rowId]);
        } else {
          metaVertices.set(columnId, { P: { component: "Error" } });
        }
      }
      return metaVertices.get(columnId);
    };

    const components = new Map();
    const getComponent = (columnId: any) => {
      if (!components.has(columnId)) {
        const metaVertex = getMetaVertex(columnId);
        if (metaVertex.P.component.includes("-")) {
          const component =
            getSelectionOptions(
              graph,
              setGraph,
              [p.joinVertex],
              metaVertex.P.component,
            ).vertexes || getStringComponent(graph)?.P.name;
          components.set(columnId, component);
        } else {
          components.set(columnId, metaVertex.P.component);
        }
      }
      return components.get(columnId);
    };
    createComputed(
      on(tableColumnsTemplate, (columns) => {
        const metaTxnId = rowMetaInitialize(
          graph,
          setGraph,
          p.joinVertex,
          field.meta,
          columns,
        );

        if (metaTxnId) {
          if (cleanUpConfig) {
            if (!cleanUpConfig().rowMetaTxnIds) {
              cleanUpConfig().rowMetaTxnIds = [];
            }
            // currently, when we delete row and unmount form, it is not giving error, but it should, because revertTransaction is not strict.
            if (cleanUpConfig().rowMetaTxnIds.includes(metaTxnId))
              cleanUpConfig().rowMetaTxnIds.push(metaTxnId);
          }
        }
      }),
    );

    const instResult = createMemo(
      () => getChildVertex(graph, ["AttrInst"], p.joinVertex).vertex,
    );
    // const attributesResult = createMemo(() => getChildVertexes(["AttrInst", "MetaAttr"], [p.joinVertex]));
    const rowColumnsMetaAttrs = createMemo(() =>
      tableColumnsTemplate().filter((vertex) => vertex.P.tab !== "expand"),
    );
    const expandVertex = createMemo(() =>
      tableColumnsTemplate()?.find((vertex) => vertex.P.tab === "expand"),
    );
    const [expanded, setExpanded] = createSignal(false);

    const [disabled, _] = createSignal(false);

    const DisplayProperties = () => {
      return (
        <For each={rowColumnsMetaAttrs()}>
          {(column) => {

            const metaVertex = createMemo(() => getMetaVertex(column.id));

            const component = getComponent(column.id);


            // if mergeProps not keep reactivity use memo
            createEffect(() => {
              addMeta(graph, setGraph, metaVertex(), p.joinVertex);
            });
            const DefaultValue = () => (
              <>
                {metaVertex().P.props?.defaultValue &&
                  getSelectionOptions(
                    graph,
                    setGraph,
                    [p.joinVertex],
                    metaVertex().P.props.defaultValue,
                  ).vertexes}
              </>
            );
            const Content = () => {

              return (
                <>
                  <Show when={component == "Error"}>Error</Show>
                  <DynamicComponent
                    title={toTitle(
                      column.P.displayName || column.P[IdAttr] || ""
                    )}
                    isShowAdd={false}
                    component={component}
                    // When we have a Table we pass original Table Meta Vertex
                    meta={component === "Table2" || component === "Table"
                      ? graph.vertexes[metaVertex().P.templateId]
                      : metaVertex()}
                    data={p.joinVertex}
                    setValue={field.setValue}
                    disabled={disabled()}
                    txnId={field.txnId}
                    isRealTime={field.isRealTime} />
                </>
              );
            };

            return (
              <Switch>
                <Match when={metaVertex().P.props?.hidden}>
                  <td>


                    <div
                      class={`flex ai:center jc:center ${(() => {
                        const comp = component;
                        switch (comp) {
                          case "TextBox":
                            return "min-w:150px";
                          case "TextArea":
                            return "min-w:200px";
                          case "CheckBox":
                            return "min-w:50px";
                          case "SelectBox":
                            return "min-w:200px";
                          default:
                            return "";
                        }
                      })()}`}
                    >
                      <DefaultValue />
                    </div>
                  </td>
                </Match>
                <Match when={component === "Table2"}>
                  <td>
                    <Show when={!disabled()}>
                      <div
                        class={`flex ai:center jc:center ${(() => {
                          const comp = component;
                          switch (comp) {
                            case "TextBox":
                              return "min-w:150px";
                            case "TextArea":
                              return "min-w:200px";
                            case "CheckBox":
                              return "min-w:50px";
                            case "SelectBox":
                              return "min-w:200px";
                            default:
                              return "";
                          }
                        })()}`}
                      >
                        <DefaultValue />
                        <Content />
                      </div>
                    </Show>
                  </td>
                </Match>
                <Match when={true}>
                  <td
                    class={`padding:1px ${(() => {
                      const comp = component;
                      switch (comp) {
                        case "TextBox":
                          return "min-w:150px";
                        case "TextArea":
                          return "min-w:200px";
                        case "CheckBox":
                          return "min-w:50px";
                        case "SelectBox":
                          return "min-w:200px";
                        default:
                          return "";
                      }
                    })()}`}
                  >
                    <div class="align-items:center">
                      <DefaultValue />
                      <Content />
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
      <>
        <tr
          draggable={true}
          onDragStart={() => setDragFromIndex(p.index)}
          onDragOver={(event) => event.preventDefault()}
          onDragEnter={() => setDragToIndex(p.index)}
          onDrop={handleDrop}
          style={{
            "text-align": "center", width: "50px",
            'background-color': dragFromIndex() === p.index ? "#e0e0e0" : dragToIndex() === p.index ? "#f0f0f0" : "white",
            transition: "background-color 0.2s ease",
            'border': dragToIndex() === p.index ? "2px solid #007bff" : "1px solid #ddd",
          }}
        >
          <td>
            <div class={"flex ai:center jc:center"}>
              {/*<Icon icon="material-symbols:drag-indicator" width={25} height={25} />*/}

              {/*<Icon icon="mingcute:up-fill"  />*/}
              {/*<Icon icon="mingcute:down-fill"  />*/}
              {/*<Icon icon="material-symbols:add-box"  />*/}
              {/* <Show when={expandVertex() && getSelectionOptions(graph, setGraph, [p.joinVertex],
                 `->${expandVertex()?.P.props.type}`).vertexes
                 }> */}
              <button

                class="cursor: grab;"

              >
                <Icon
                  icon="material-symbols:drag-indicator"
                  class={"transform 2s ease-in-out"}
                />
              </button>
              <button
                class="cursor: pointer;"
                onClick={(e) => {
                  // console.log(getSelectionOptions(graph, setGraph, [p.joinVertex], expandVertex()?.P.collection).vertexes);
                  setExpanded(!expanded())
                }}
              >
                <Icon
                  icon="mingcute:down-fill"
                  class={"transform 2s ease-in-out"}
                  style={{
                    transition: "transform 0.2s linear",
                    "margin-top": "7px",
                    transform: `${!expanded()}
                        ? "rotate(0deg)"
                        : "rotate(180deg)"
                      }`,
                  }}
                />
              </button>
              {/* </Show> */}
              <Icon
                height={20}
                width={20}
                icon="mingcute:delete-line"
                class="cursor:pointer m:5px"
                style={{ color: "red" }}
                onClick={() =>
                  deleteRow(
                    p.joinVertex,
                    field.isRealTime!,
                    graph,
                    setGraph,
                    field.txnId!,
                    Ws,
                  )
                }
              />
              <Show when={expandVertex()}>
                <Icon
                  height={20}
                  width={20}
                  icon="icon-park-outline:plus"
                  class="cursor:pointer "
                  style={{ color: "green" }}
                  onClick={() => {
                    return addNewRow(
                      field.txnId || 0,
                      expandVertex()!,
                      graph,
                      setGraph,
                      p.joinVertex,
                      {},
                      field.isRealTime ?? false,
                      Ws,
                    );
                  }}
                />
              </Show>
            </div>
            {/*<Show when={!disabled}>*/}
            {/*  <Icon icon="material-symbols:edit"  onClick={() => setDisabled((v) => !v)} />*/}
            {/*</Show>*/}
          </td>
          <DisplayProperties />
        </tr>
        {/* Limitation: Cant Disable Expanded table if it has 0 rows */}
        {/*{getSelectionOptions([p.joinVertex], expandVertex.P.collection).vertexes?.length}*/}
        <Show when={expandVertex()}>
          <tr>
            <td class="pl:15" colspan={rowColumnsMetaAttrs().length + 2}>
              <DynamicComponent
                component={"Table2"}
                // When we have a Table we pass original Table Meta Vertex
                meta={expandVertex()!}
                isShowAdd={false}
                data={p.joinVertex}
                setValue={field.setValue}
                disabled={disabled()}
                txnId={field.txnId}
                isRealTime={field.isRealTime}
              />
            </td>
          </tr>
        </Show>
      </>
    );
  };

  const insertNewRow = () => {
    if (!field.data) {
      showErrorToast("Table data is not set");
      return;
    }

    return runWithOwner(outerOwner, () =>
      addNewRow(
        field.txnId || 0,
        field.meta,
        graph,
        setGraph,
        field.data!,
        {},
        field.isRealTime ?? false,
        Ws,
      ),
    );
  };
  const AddNewButton = (isInTableButton: any) => {
    return (
      <GenericField
        meta={
          {
            P: {
              component: "Button",
              props: {
                children: "Add",
                variant: "soft",
                onClick: () => insertNewRow(),
              },
            },
          } as unknown as Vertex
        }
      />
    );
  };

  return (
    <Switch>
      <Match when={tableColumnsTemplate().length === 0}>
        Please Define table columns
      </Match>
      <Match when={true}>
        {/*<Show when={field.meta.P.attributes}>*/}
        {/*  <FormGroup form={{title: '', label: field.meta.P.title || field.meta.P[IdAttr], attributes: field.meta.P.attributes}} vertex={vertex}/>*/}
        {/*</Show>*/}
        <Show when={field.isShowAdd || sortedVertexes().length > 0}>
          <AddNewButton />
        </Show>

        {/*<DataTable rows={sortedVertexes()} headers={tableColumnsTemplate()}/>*/}
        <Show when={sortedVertexes().length}>
          <div
            class={" w:80vw overflow:auto b:1px|solid|#37c r:10 m:2"}
            style={{ "scrollbar-width": "thin" }}
          >
            <table class="styled-table b:none w:-webkit-fill-available">
              <thead>
                <tr
                  style={{
                    width: "max-content",
                  }}
                >
                  <td></td>
                  <td>&nbsp;Actions</td>
                  <For each={tableColumnsTemplate()}>
                    {(attribute) => {
                      return (
                        <Switch>
                          {/*<Match when={attribute.props?.skip}></Match>*/}
                          <Match when={attribute.P.tab === "expand"}>
                            <span></span>
                          </Match>
                          <Match
                            when={
                              !attribute.P.hidden || attribute.P.defaultValue
                            }
                          >
                            <th
                              class={"font-weight:medium p:0px|10px"}
                              style={{
                                "justify-content": "center",
                              }}
                            >
                              {toTitle(
                                attribute.P.displayName ||
                                attribute.P[IdAttr] ||
                                "",
                              )}
                            </th>
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
                <For each={sortedVertexes()}>
                  {(vertex, index) => (
                    <RepeaterContext.Provider
                      value={[vertex, ...useContext(RepeaterContext)]}
                    >
                      <SortableRow joinVertex={vertex} index={index()} />
                    </RepeaterContext.Provider>
                  )}
                </For>
                {/*  </SortableProvider>*/}
                {/*</DragDropProvider>*/}
              </tbody>
            </table>
          </div>
        </Show>

        {/*<Show when={Page}>*/}
        {/*  <For each={Object.values(Page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
        {/*</Show>*/}
      </Match>
    </Switch>
  );
}
// const DragHandle = (): JSX.Element => {
//   return (
//     <span style={{ cursor: "grab" }}>
//       <svg width="16" height="16" fill="currentColor" class="bi bi-grip-horizontal" viewBox="0 0 16 16">
//         <path d="M2 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
//       </svg>
//     </span>
//   );
// };

// interface Row {
//   id: number;
//   firstName: string;
//   lastName: string;
//   age: number;
//   visits: number;
//   status: string;
//   progress: number;
// }

// const SortableTable = () => {
//   const [rows, setRows] = createSignal<Row[]>([
//     { id: 1, firstName: "request", lastName: "cellar", age: 15, visits: 7, status: "relationship", progress: 88 },
//     { id: 2, firstName: "sister", lastName: "lab", age: 23, visits: 95, status: "complicated", progress: 72 },
//     { id: 3, firstName: "cellar", lastName: "letter", age: 13, visits: 12, status: "single", progress: 34 },
//     { id: 4, firstName: "wish", lastName: "confusion", age: 26, visits: 67, status: "relationship", progress: 17 },
//   ]);


//   return (
//     <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
//       <thead>
//         <tr>
//           <th style="width: 50px; padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Drag</th>
//           <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">First Name</th>
//           <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Last Name</th>
//           <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Age</th>
//           <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Visits</th>
//           <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Status</th>
//           <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Progress</th>
//         </tr>
//       </thead>
//       <tbody>
//         <For each={rows()}>
//           {(row, index) => (
//             <tr
//               draggable={true}
//               onDragStart={() => handleDragStart(index())}
//               onDragOver={handleDragOver}
//               onDragEnter={() => handleDragEnter(index())}

//               onDrop={handleDrop}
//               style={{
//                 cursor: "grab",
//                 'background-color': draggingIndex() === index() ? "#e0e0e0" : targetIndex() === index() ? "#f0f0f0" : "white",
//                 transition: "background-color 0.2s ease",
//                 'border-bottom': targetIndex() === index() ? "2px solid #007bff" : "1px solid #ddd",
//               }}
//             >
//               <td style="padding: 8px; border: 1px solid #ddd;">
//                 <DragHandle />
//               </td>
//               <td style="padding: 8px; border: 1px solid #ddd;">{row.firstName}</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">{row.lastName}</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">{row.age}</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">{row.visits}</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">{row.status}</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">{row.progress}</td>
//             </tr>
//           )}
//         </For>
//       </tbody>
//     </table>
//   );
// };

// export default SortableTable;