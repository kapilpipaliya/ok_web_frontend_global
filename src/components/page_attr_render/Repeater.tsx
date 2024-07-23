import { For, Show, createEffect, createSignal } from "solid-js";

import {
  PageRenderVertexContext,
  RepeaterVertexContext,
  usePageRenderVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/PageAttrContext";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { getCollection } from "~/components/page_attr_render/utils/getCollection";
import { getSelectionOptionsMGCall } from "~/cypher/get/getSelectionOptionsMGCall";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";

export const Repeater = (props: Readonly<{ data: Vertex; meta: Vertex }>) => {
  const [graph, setGraph] = useGraph();
  const [options, setOptions] = createSignal([] as Vertex[]);
  const [isFetching, setIsFetching] = createSignal(false);
  const repeaterContext = useRepeaterVertexContext();

  const setInitialState = async (expression?: string, collection?: string) => {
    setIsFetching(true);

    const result = await getSelectionOptionsMGCall(
      [props.data],
      expression ?? `g:'${collection}'`,
    );

    if (result) {
      setGraphData(graph, setGraph, result.graph!, true);
      setOptions(
        // props.data ||
        getSelectionOptions(
          graph,
          setGraph,
          expression ?? `g:'${collection}'`,
          repeaterContext,
        ).vertexes,
      );
    }

    setIsFetching(false);
  };
  createEffect(() => {
    const expression = props.meta.P.data;
    if (expression) {
      setInitialState(expression);
      return;
    }
    const data = getSelectionOptions(graph, setGraph, "->$0Data", [
      props.meta,
    ]).vertexes;
    if (data) {
      setOptions(data);
    } else {
      const collection = getCollection(graph, props.meta);
      if (collection) {
        setInitialState(undefined, collection);
      }
    }
  });

  return (
    <Show when={!isFetching()}>
      <For each={options()}>
        {(vertex) => (
          <RepeaterVertexContext.Provider
            value={[vertex, ...useRepeaterVertexContext()]}
          >
            <PageRenderVertexContext.Provider
              value={[...usePageRenderVertexContext(), props.meta]}
            >
              <PageAttrRender data={vertex} metaVertex={props.meta} />
            </PageRenderVertexContext.Provider>
          </RepeaterVertexContext.Provider>
        )}
      </For>
    </Show>
  );
};
