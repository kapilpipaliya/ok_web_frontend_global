import { createAsync } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Switch } from "solid-js";

import { getSelectionOptionsAPICall } from "~/cypher/client/getSelectionOptionsAPICall";
import { ServerResult } from "~/cypher/types/ServerResult";
import { useRepeaterVertexContext } from "~/features/page_attr_render/context/PageAttrContext";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getCollection } from "~/features/page_attr_render/utils/getCollection";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";

import { DataInternal } from "./DataInternal";

export const DataField = (props: {
  data: (() => any[]) | any[];
  expression: string;
  loop: boolean;
}) => {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;

  const [options, setOptions] = createSignal([] as Vertex[]);
  const [isFetching, setIsFetching] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const dataContext = useRepeaterVertexContext() || {};

  const selectionOptionsData = createAsync<null | ServerResult>(async () => {
    if (!props.expression) {
      return null;
    }
    if (props.data) {
      return null;
    }
    return getSelectionOptionsAPICall([data()], props.expression);
  });


  createEffect(() => {
    if (!props.expression) {
      return;
    }
    setErrorMessage("");
    if (!selectionOptionsData()) {
      setOptions([]);
      setErrorMessage("Failed to fetch data");
      setIsFetching(false);
      return;
    }

    if (isValidResponse(selectionOptionsData()!)) {
      setGraphData(graph, setGraph, selectionOptionsData()!.graph!, {skipExisting: true});
      setOptions(
        evalExpression(props.expression, {
          graph,
          setGraph,
          vertexes: dataContext || [],
        }) || [],
      );
    } else {
      setOptions([]);
      setErrorMessage(getErrorMessage(selectionOptionsData()!));
    }
  });

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

    // we dont use ->0Data Expression now.
    // const data = evalExpression("->$0Data", {
    //   graph,
    //   setGraph,
    //   vertexes: [meta()!],
    // });
    // if (data) {
    //   setOptions(data);
    //   return;
    // }
    // we dont use collection now.
    // const collection = getCollection(graph, meta());
    // if (collection) {
    //   setInitialState(`g:'${collection}'`);
    //   return;
    // }

    // setOptions([]);
  });

  return (
    <Switch>
      <Match when={isFetching()}>
        <div>...</div>
      </Match>
      <Match when={errorMessage()}>
        <div class="bg-red-500">{errorMessage()}</div>
      </Match>
      <Match when={Array.isArray(options()) && props.loop}>
        <For each={options()}>
          {(value, index) => {
            return (
              <DataInternal
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
        <DataInternal
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
