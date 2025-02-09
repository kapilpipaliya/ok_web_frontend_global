import { createEffect, createSignal, For, Match, Switch } from "solid-js";

import { useRepeaterVertexContext } from "~/components/page_attr_render/context/PageAttrContext";
import { getCollection } from "~/components/page_attr_render/utils/getCollection";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { usePageRenderContext } from "../../page_attr_render/context/PageRenderContext";
import { RepeaterInternal } from "./RepeaterInternal";

export const DataField = (props: {
  data: (() => any[]) | any[];
  expression: string;
}) => {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;

  const [options, setOptions] = createSignal([] as Vertex[]);
  const [isFetching, setIsFetching] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const dataContext = useRepeaterVertexContext();

  const setInitialState = async (expression: string) => {
    setIsFetching(true);
    setErrorMessage("");

    const result = await getSelectionOptionsMGCall([data()], expression);

    if (isValidResponse(result)) {
      setGraphData(graph, setGraph, result.graph!, true);
      setOptions(
        evalExpression(expression, {
          graph,
          setGraph,
          vertexes: dataContext,
        }) || [],
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
      if (typeof props.data === "function") {
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
    const data = evalExpression("->$0Data", {
      graph,
      setGraph,
      vertexes: [meta()!],
    });
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
            return (
              <RepeaterInternal
                data={data()}
                index={index()}
                meta={meta()}
                name={props.name}
                repeaterValue={value}
              />
            );
          }}
        </For>
      </Match>
      <Match when={options()}>
        <RepeaterInternal
          data={data()}
          index={0}
          meta={meta()}
          name={props.name}
          repeaterValue={options()}
        />
      </Match>
    </Switch>
  );
};
