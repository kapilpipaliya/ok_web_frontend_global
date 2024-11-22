import { createEffect, createSignal, For, Show } from "solid-js";

import {
  RepeaterVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/context/PageAttrContext";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { getCollection } from "~/components/page_attr_render/utils/getCollection";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { isVertex } from "~/lib/graph/mutate/vertex";

import {
  usePageRenderContext,
} from "./context/PageRenderContext";

export const Repeater = (props: { data: any[] | string }) => {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;

  const [options, setOptions] = createSignal([] as Vertex[]);
  const [isFetching, setIsFetching] = createSignal(false);
  const repeaterContext = useRepeaterVertexContext();

  const setInitialState = async (expression: string) => {
    setIsFetching(true);

    const result = await getSelectionOptionsMGCall([data()], expression);

    if (result) {
      setGraphData(graph, setGraph, result.graph!, true);
      setOptions(
        // data() ||
        getSelectionOptions(graph, setGraph, expression, repeaterContext)
          .vertexes,
      );
    }

    setIsFetching(false);
  };
  createEffect(() => {
    const expression = props.data;
    if (typeof expression === "string") {
      setInitialState(expression);
      return;
    }
    if (Array.isArray(expression)) {
      setOptions(expression);
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
        setInitialState(`g:'${collection}'`);
      }
    }
  });

  const RepterInternal = (props: { repeaterValue: Vertex }) => {
    const context = useRepeaterVertexContext();
    const repeaterStore = new Proxy(context, {
      get(target, key) {
        if (key === meta().P.name) {
          return props.repeaterValue;
        }
        return target[key];
      },
    });
    return (
      <RepeaterVertexContext.Provider value={repeaterStore}>
        <PageAttrRender
          data={isVertex(props.repeaterValue) ? props.repeaterValue : data()}
          metaVertex={meta()}
        />
      </RepeaterVertexContext.Provider>
    );
  };
  return (
    <Show when={!isFetching()}>
      <For each={options()}>
        {(vertex) => {
          return <RepterInternal repeaterValue={vertex} />;
        }}
      </For>
    </Show>
  );
};
