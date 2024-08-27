import { createEffect, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";

import {
  RepeaterVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/PageAttrContext";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { getCollection } from "~/components/page_attr_render/utils/getCollection";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { getInitialPageRenderStore, usePageRenderContext } from "./PageRenderContext";

export const Repeater = () => {
  const [graph, setGraph] = useGraph();
  const [parentItems] = usePageRenderContext();
  const meta = () => getLastItem(parentItems!.vertexes)!;
  const data = () => getLastItem(parentItems!.data)!;

  const [options, setOptions] = createSignal([] as Vertex[]);
  const [isFetching, setIsFetching] = createSignal(false);
  const repeaterContext = useRepeaterVertexContext();

  const setInitialState = async (expression?: string, collection?: string) => {
    setIsFetching(true);

    const result = await getSelectionOptionsMGCall(
      [data()],
      expression ?? `g:'${collection}'`,
    );

    if (result) {
      setGraphData(graph, setGraph, result.graph!, true);
      setOptions(
        // data() ||
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
    const expression = meta().P.data;
    if (expression) {
      setInitialState(expression);
      return;
    }
    const data = getSelectionOptions(graph, setGraph, "->$0Data", [
      meta(),
    ]).vertexes;
    if (data) {
      setOptions(data);
    } else {
      const collection = getCollection(graph, meta());
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
            <PageAttrRender data={vertex} metaVertex={meta()} />
          </RepeaterVertexContext.Provider>
        )}
      </For>
    </Show>
  );
};
