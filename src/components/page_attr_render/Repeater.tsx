import {
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
  useContext,
} from "solid-js";

import {
  PageRenderVertexContext, RepeaterVertexContext
} from "~/components/page_attr_render/Context";
import {
  PageAttrRender,
} from "~/components/page_attr_render/PageAttrRender";
import {
  getCollection
} from "~/components/page_attr_render/utils/getCollection";
import {getSelectionOptionsMGCall} from "~/cypher/get/getSelectionOptionsMGCall";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { GraphContext } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";

export const Repeater = (props: Readonly<{ data: any; meta: any }>) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [options, setOptions] = createSignal([]);
  const [isFetching, setIsFetching] = createSignal(false);
  const [hasFetched, setHasFetched] = createSignal(false);

  const fetchOptions = async () => {
    const mgData = await getSelectionOptionsMGCall(
      [props.data],
      `g:'${getCollection(graph, props.meta)!}'`,
    );
    return { mgData };
  };

  const [data] = createResource(fetchOptions);

  createEffect(() => {
    setIsFetching(true);
    if (!hasFetched() && data.state === "ready") {
      const result = data();

      if (result?.mgData) {
        setGraphData(graph, setGraph, result.mgData.graph!);
        setOptions(
          props.data ||
            getSelectionOptions(
              graph,
              setGraph,
              [props.meta],
              `g:'${getCollection(graph, props.meta)!}'`,
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
          <RepeaterVertexContext.Provider
            value={[vertex, ...useContext(RepeaterVertexContext)]}
          >
            <PageRenderVertexContext.Provider
              value={[...useContext(PageRenderVertexContext), props.meta]}
            >
              <PageAttrRender data={vertex} metaVertex={props.meta} />
            </PageRenderVertexContext.Provider>
          </RepeaterVertexContext.Provider>
        )}
      </For>
    </Show>
  );
};
