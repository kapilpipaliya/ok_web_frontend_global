import { toTitle } from "case-switcher-js";
import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { AddNewButton } from "~/components/grid/AddNew";
import {
  PageRenderVertexContext, RepeaterVertexContext
} from "~/components/page_attr_render/Context";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import {
  getChildVertexes,
} from "~/lib/graph/get/sync/traverse";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import {
  getSublistRows} from "~/lib/graph/mutate/form/rowFunction";
import {
  mergeVertexProperties,
} from "~/lib/graph/mutate/vertex";

import { SortableRow } from "./SortableRow";
import { insertNewRow } from "./insertNewRow";

export function TableInputField(
  props: {
    isRealTime?: boolean;
    isTableInside?: boolean;
    txnId?: number;
  } & ComponentProps,
) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [sortedVertexes, setSortedVertexes] = createSignal([] as Vertex[]);

  const tableColumnsTemplate = createMemo(() =>
    getChildVertexes(graph, ["MetaAttr"], [props.meta]).vertexes || []
  );

  const parentItems = useContext(PageRenderVertexContext);
  const parentData = createMemo(() => getDataVertex(graph, getLastItem(parentItems, 1)));

  // load data:
  // add row vertexes data to store
  createEffect(() => {
    // if a parent has data vertex use it,
    // TODO: else if it has a parent Form Container(Record) use it.
    const vertexes = getSublistRows(graph, props.meta, props.data || parentData());
    setSortedVertexes(vertexes);
  });

  const [dragToIndex, setDragToIndex] = createSignal<null | number>(null);
  const [dragFromIndex, setDragFromIndex] = createSignal<null | number>(null);

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
    setDragToIndex(null);
  };

  return (
    <Switch>
      <Match when={tableColumnsTemplate().length === 0}>
        Please Define table columns
      </Match>
      <Match when={true}>
        {/*<Show when={props.meta.P.attributes}>*/}
        {/*  <FormGroup form={{title: '', label: props.meta.P.title || props.meta.P[IdAttr], attributes: props.meta.P.attributes}} vertex={vertex}/>*/}
        {/*</Show>*/}
        {/* <Show when={props.isTableInside}> */}
        <AddNewButton onClick={() => insertNewRow(props.txnId || 0, props.meta, props.data!, props.isRealTime ?? false, graph, setGraph)} />
        {/* </Show> */}
        {/*<DataTable rows={sortedVertexes()} headers={tableColumnsTemplate()}/>*/}
        <div class={"m:2 overflow:auto r:10"} style={{ 'border': sortedVertexes().length ? '1px solid #37c' : '', "scrollbar-width": "thin" }}>
          <table class="b:none border-collapse:collapse border-radius:0.4rem box-shadow:0|0|20px|rgba(0,0,0,0.15) font-size:0.9em" style={{ width: props.isTableInside ? '-webkit-fill-available' : '' }}>
            <Show when={sortedVertexes().length}>
              <thead>
                <tr class="background-color:#37c   color:#ffffff height:35px text-align:center " style={{ width: "max-content" }}>
                  <td class={"align-content:center align-items:center color:#ffffff font-weight:medium p:0px|10px text-align:left"} style={{ "text-align-last": "center" }}>&nbsp;Actions</td>
                  <For each={tableColumnsTemplate()}>
                    {(attribute) => (
                      <Switch>
                        {/*<Match when={attribute.P.skip}></Match>*/}
                        <Match when={attribute.P.tab === "expand"}>
                          <span />
                        </Match>
                        <Match when={!attribute.P.hidden || attribute.P.defaultValue}>
                          <th class={"font-weight:medium p:0px|10px"} style={{ "justify-content": "center" }}>
                            {toTitle(attribute.P.displayName || attribute.P[IdAttr] || "")}
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
                  <RepeaterVertexContext.Provider value={[vertex, ...useContext(RepeaterVertexContext)]}>
                    <SortableRow
                      dragFromIndex={dragFromIndex}
                      dragToIndex={dragToIndex}
                      handleDrop={handleDrop}
                      isRealTime={props.isRealTime ?? false}
                      joinVertex={vertex}
                      meta={props.meta}
                      rowIndex={index()}
                      setDragFromIndex={setDragFromIndex}
                      setDragToIndex={setDragToIndex}
                      setValue={props.setValue}
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
