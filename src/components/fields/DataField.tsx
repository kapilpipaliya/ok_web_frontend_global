import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";

import {
  RepeaterVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/context/PageAttrContext";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { getCollection } from "~/components/page_attr_render/utils/getCollection";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { isVertex } from "~/lib/graph/mutate/vertex";

import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";

export const DataField = (props: { data: any[], expression: string }) => {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;

  const [options, setOptions] = createSignal([] as Vertex[]);
  const [isFetching, setIsFetching] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const repeaterContext = useRepeaterVertexContext();

  const setInitialState = async (expression: string) => {
    setIsFetching(true);
    setErrorMessage("");

    const result = await getSelectionOptionsMGCall([data()], expression);

    if (isValidResponse(result)) {
      setGraphData(graph, setGraph, result.graph!, true);
      setOptions(
        getSelectionOptions(graph, setGraph, expression, repeaterContext)
          .vertexes,
      );
    } else {
      setOptions([]);
      setErrorMessage(getErrorMessage(result)); 
    }

    setIsFetching(false);
  };

  createEffect(() => {
    if (props.data) {
      // using function will clone the data
      if (typeof props.data === 'function') {
        setOptions(props.data());
      } else {
        setOptions(props.data);
      }
      return;
    }
    if (props.expression && typeof props.expression === "string") {
      setInitialState(props.expression);
      return;
    }
    const data = getSelectionOptions(graph, setGraph, "->$0Data", [
      meta(),
    ]).vertexes;
    if (data) {
      setOptions(data);
      return;
    }
    const collection = getCollection(graph, meta());
    if (collection) {
      setInitialState(`g:'${collection}'`);
      return;
    }
    setOptions([]);
  });

  const RepeaterInternal = (props: {
    index: number;
    repeaterValue: any;
  }) => {
    const context = useRepeaterVertexContext();
    const repeaterStore = new Proxy(context, {
      get(target, key) {
        if (key === meta().P.name) {
          return props.repeaterValue;
        }
        if (key === `${meta().P.name}index`) {
          return props.index;
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
    <Switch>
      <Match when={isFetching()}>
        <div>...</div>
      </Match>
      <Match when={errorMessage()}>
        <div class="bg-red-500">{errorMessage()}</div>
      </Match>
      <Match when={Array.isArray(options()) && !props.noRepeat}>
        <For each={options()}>
          {(value, index) => {
            return <RepeaterInternal index={index()} repeaterValue={value} />;
          }}
        </For>
      </Match>
      <Match when={options()}>
        <RepeaterInternal index={0} repeaterValue={options()} />
      </Match>
    </Switch>
  );
};
