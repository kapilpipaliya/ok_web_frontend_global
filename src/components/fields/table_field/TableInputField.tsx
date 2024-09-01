import { toTitle } from "case-switcher-js";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js";

import type { GenericComponentProps } from "~/components/fields/FieldType";

import { AddNewButton } from "~/components/grid/AddNew";
import {
  RepeaterVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/PageAttrContext";
import { usePageRenderContext } from "~/components/page_attr_render/PageRenderContext";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { sortVertexesByPosition } from "~/lib/graph/get/sync/sortVertexesByPosition";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";
import { getSublistRows } from "~/lib/graph/mutate/form/addNewRow";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { insertNewRow } from "./insertNewRow";
import { SortableRow } from "./SortableRow";

export function TableInputField(
  props: Readonly<
    {
      isNoPermissionCheck?: boolean;
      isRealTime?: boolean;
      isTableInside?: boolean;
      txnId?: number;
    } & GenericComponentProps
  >,
) {
  const [graph, setGraph] = useGraph();
  const [parentItems] = usePageRenderContext();
  const meta = () => getLastItem(parentItems!.vertexes)!;
  const data = () => getLastItem(parentItems!.data)!;

  const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);

  const tableColumnsTemplate = createMemo(() =>
    sortVertexesByPosition(
      getSelectionOptions(graph, setGraph, "->Attr", [meta()]).vertexes || [],
    ),
  );

  const parentData = createMemo(() =>
    getDataVertex(graph, getLastItem(parentItems?.vertexes || [], 1)),
  );

  // load data:
  // add row vertexes data to store
  createEffect(() => {
    // if a parent has data vertex use it,
    // TODO: else if it has a parent Form Container(Record) use it.
    const vertexes = getSublistRows(graph, meta(), data() || parentData());
    setSortedVertexes(vertexes);
  });

  const [dragToIndex, setDragToIndex] = createSignal<null | number>(null);
  const [dragFromIndex, setDragFromIndex] = createSignal<null | number>(null);

  const handleDrop = () => {
    if (
      dragFromIndex() !== null &&
      dragToIndex() !== null &&
      dragFromIndex() !== dragToIndex()
    ) {
      const updatedRows = [...sortedVertexes()];
      const [draggedRow] = updatedRows.splice(dragFromIndex()!, 1);
      updatedRows.splice(dragToIndex()!, 0, draggedRow);
      setSortedVertexes(updatedRows);
      updatedRows.forEach((vertex, index) => {
        mergeVertexProperties(props.txnId!, vertex.id, graph, setGraph, {
          pos: index + 1,
        });
      });
    }
    setDragFromIndex(null);
    setDragToIndex(null);
  };

  return (
    <Switch>
      <Match when={tableColumnsTemplate().length === 0}>
        Please Define table columns
      </Match>
      <Match when={true}>
        {/*<Show when={meta().P.attributes}>*/}
        {/*  <FormGroup form={{title: '', label: meta().P.title || meta().P[IdAttr], attributes: meta().P.attributes}} vertex={vertex}/>*/}
        {/*</Show>*/}
        {/* <Show when={props.isTableInside}> */}
        <AddNewButton
          onClick={() =>
            insertNewRow(
              props.txnId || 0,
              meta(),
              data()!,
              props.isRealTime ?? false,
              graph,
              setGraph,
            )
          }
        />
        {/* </Show> */}
        {/*<DataTable rows={sortedVertexes()} headers={tableColumnsTemplate()}/>*/}
        <div
          class="m:2 overflow:auto r:10"
          classList={{
            "{scrollbar-width:thin}": true,
            "border:1px|solid|#37c": sortedVertexes().length > 0, // slate-70
          }}
        >
          <table
            class="b:none border-collapse:collapse border-radius:0.4rem box-shadow:0|0|20px|rgba(0,0,0,0.15) font-size:0.9em"
            classList={{ "width:-webkit-fill-available": props.isTableInside }}
          >
            <Show when={sortedVertexes().length}>
              <thead>
                <tr class="background-color:#37c color:#ffffff height:35px text-align:center width:max-content">
                  <td class="text-align-last:center align-content:center align-items:center color:#ffffff font-weight:medium p:0px|10px text-align:left">
                    &nbsp;Actions
                  </td>
                  <For each={tableColumnsTemplate()}>
                    {(attribute) => (
                      <Switch>
                        {/*<Match when={attribute.P.skip}></Match>*/}
                        <Match when={attribute.P.tab === "expand"}>
                          <span />
                        </Match>
                        <Match
                          when={!attribute.P.hidden || attribute.P.defaultValue}
                        >
                          <th class="font-weight:medium jc:center p:0px|10px">
                            {toTitle(
                              attribute.P.label ||
                                attribute.P.displayName ||
                                attribute.P[IdAttr] ||
                                "",
                            )}
                            {/* Add Proper Validation check */}
                            {attribute.P.validation?.required && (
                              <span class="color:red"> *</span>
                            )}
                          </th>
                        </Match>
                        <Match when={true}>
                          <th />
                        </Match>
                      </Switch>
                    )}
                  </For>
                </tr>
              </thead>
            </Show>
            <tbody>
              <For each={sortedVertexes()}>
                {(vertex, index) => (
                  <RepeaterVertexContext.Provider
                    value={[vertex, ...useRepeaterVertexContext()]}
                  >
                    <SortableRow
                      dragFromIndex={dragFromIndex}
                      dragToIndex={dragToIndex}
                      handleDrop={handleDrop}
                      isNoPermissionCheck={props.isNoPermissionCheck}
                      isRealTime={props.isRealTime ?? false}
                      joinVertex={vertex}
                      meta={meta()}
                      onChange={props.onChange}
                      rowIndex={index()}
                      setDragFromIndex={setDragFromIndex}
                      setDragToIndex={setDragToIndex}
                      tableColumnsTemplate={tableColumnsTemplate}
                      txnId={props.txnId ?? 0}
                    />
                  </RepeaterVertexContext.Provider>
                )}
              </For>
            </tbody>
          </table>
        </div>
        {/*<Show when={Page}>*/}
        {/*  <For each={Object.values(Page!)}>{(errorMsg: string) => <small>{errorMsg}</small>}</For>*/}
        {/*</Show>*/}
      </Match>
    </Switch>
  );
}
