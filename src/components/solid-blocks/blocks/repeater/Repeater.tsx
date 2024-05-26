import {
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
  useContext,
} from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import {
  PageRenderUtils,
  RepeaterContext,
  PageRenderContext,
  PageItemRender,
} from "~/components/dynamic/fields/static/GenaricField";
import { getSelectionOptionsMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { GraphContext, GraphInterface } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/ws_events";

export const Repeater = (props: { data: any; meta: any }) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [options, setOptions] = createSignal([]);
  const [isFetching, setIsFetching] = createSignal(false);
  const [hasFetched, setHasFetched] = createSignal(false);

  const fetchOptions = async () => {
    const mgData = await getSelectionOptionsMGCall(
      [props.data],
      `g:'${PageRenderUtils.getCollection(graph, props.meta)!}'`,
    );
    return { mgData };
  };

  const [data] = createResource(fetchOptions);

  createEffect(() => {
    setIsFetching(true);
    if (!hasFetched() && data.state === "ready") {
      const result = data();

      if (result?.mgData) {
        setGraphData(graph, setGraph, result.mgData.graph);
        setOptions(
          props.data ||
            getSelectionOptions(
              graph,
              setGraph,
              [props.meta],
              `g:'${PageRenderUtils.getCollection(graph, props.meta)!}'`,
            ).vertexes,
        );

        setHasFetched(true);
      }
    }
    setIsFetching(false);
  });

  return (
    <Show when={!isFetching()}>
      <For each={options()}>
        {(vertex) => (
          <RepeaterContext.Provider
            value={[vertex, ...useContext(RepeaterContext)]}
          >
            <PageRenderContext.Provider
              value={[...useContext(PageRenderContext), props.meta]}
            >
              <PageItemRender metaVertex={props.meta} data={vertex} />
            </PageRenderContext.Provider>
          </RepeaterContext.Provider>
        )}
      </For>
    </Show>
  );
};
