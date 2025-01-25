import { createSignal, type JSX, Match, onMount, ParentProps, Switch } from "solid-js";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/lib/graph/mutate/getInitialDataAndSetToGraph";

import { GlobalProperties, useGraph } from "./lib/graph/graph";
import { mergeVertexProperties } from "./lib/graph/mutate/vertex";
import { getGlobalStore } from "./lib/graph/get/sync/getGlobalStore";

export function GetInitialData(props: ParentProps) {
  const graph = useGraph();
  const [initialDataLoading, setInitialDataLoading] = createSignal(true);

  onMount(async () => {
    try {
      await getInitialDataAndSetToGraph(graph);
    } catch (error: any) {
      const globalStoreId = "globalStoreId";
      mergeVertexProperties<GlobalProperties>(0, globalStoreId, graph[0], graph[1], { initialDataFetchError: `Failed to load initial data: ${error.message}` });
    } finally {
      setInitialDataLoading(false);
    }
  });

  return (
    <Switch>
      <Match when={initialDataLoading()}>
        <LoaderNew />
      </Match>
      <Match when={getGlobalStore(graph[0]).P.initialDataFetchError}>
        <div class="bg:red-50 p:1">{getGlobalStore(graph[0]).P.initialDataFetchError}</div>
      </Match>
      <Match when={!(initialDataLoading() || getGlobalStore(graph[0]).P.initialDataFetchError)}>{props.children}</Match>
    </Switch>
  );
}
