import {
  For,
  Show,
  createEffect,
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
import { getSelectionOptionsMGCall } from "~/cypher/get/getSelectionOptionsMGCall";
import { getChildVertex, getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { GraphContext, Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";

export const Repeater = (props: Readonly<{ data: any; meta: any }>) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [options, setOptions] = createSignal([] as Vertex[]);
  const [isFetching, setIsFetching] = createSignal(false);
  const repeaterContext = useContext(RepeaterVertexContext);

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
  }
  createEffect(() => {
    const expression = props.meta.P.data;
    if (expression) {
      setInitialState(expression);
      return;
    }
    const data = getChildVertex(graph, ["$0Data"], props.meta).vertex
    if (data) {
      setOptions([data]);
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
