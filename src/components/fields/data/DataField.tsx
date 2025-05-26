import { createAsync } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Switch } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { useDataContext } from "~/features/page_attr_render/context/DataContext";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { evalExpression } from "~/lib/expression_eval";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";

import { DataInternal } from "./DataInternal";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const DataField = (props: {
  data: (() => any[]) | any[];
  expression: string;
  loop: boolean;
  name: string;
}) => {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta;
  const data = () => parentRenderContext()?.context.data;

  const [options, setOptions] = createSignal([] as Vertex[]);
  const [isFetching, setIsFetching] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal("");
  const contextData = useDataContext() || {};

  const selectionOptionsData = createAsync<null | ServerResult>(
    async () => {
      if (!props.expression) {
        return null;
      }
      if (props.data) {
        return null;
      }
      return fetchDataFromDB(
        { expression: props.expression },
        {
          nodes: {},
          relationships: {},
          vertexes: [data()!],
        },
      );
    },
    { deferStream: true },
  );

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
      setGraphData(graph, setGraph, selectionOptionsData()!.graph!, {
        skipExisting: true,
      });
      setOptions(
        evalExpression(props.expression, {
          graph,
          setGraph,
          vertexes: contextData || [],
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
        <As
          as="div"
          css={`return \`._id {
  background-color: \${args.theme.var.color.error};
}\`;`}
        >
          {errorMessage()}
        </As>
      </Match>
      <Match when={Array.isArray(options()) && props.loop}>
        <For each={options()}>
          {(value, index) => {
            return (
              <DataInternal
                data={data()}
                index={index()}
                meta={meta()!}
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
          meta={meta()!}
          name={props.name}
          repeaterValue={options()}
        />
      </Match>
    </Switch>
  );
};
