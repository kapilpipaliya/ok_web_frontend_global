import { createEffect, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";

import {
  RepeaterVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/PageAttrContext";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { getCollection } from "~/components/page_attr_render/utils/getCollection";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { getInitialPageRenderStore } from "./PageRenderContext";


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

  const _repeterStore = createStore(getInitialPageRenderStore());

  return (
    <Show when={!isFetching()}>
      <For each={options()}>
        {(vertex) => (
          <RepeaterVertexContext.Provider
            value={[vertex, ...useRepeaterVertexContext()]}
          >
              <PageAttrRender data={vertex} metaVertex={props.meta} />
          </RepeaterVertexContext.Provider>
        )}
      </For>
    </Show>
  );
};
