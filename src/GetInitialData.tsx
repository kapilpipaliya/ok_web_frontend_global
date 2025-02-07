import { useNavigate } from "@solidjs/router";
import { createSignal, Match, onMount, type ParentProps, Switch } from "solid-js";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/lib/graph/mutate/getInitialDataAndSetToGraph";
import { loadUser } from "~/lib/graph/mutate/loadUser";

import { useToast } from "./components/styled/Toast";
import { getGlobalStore } from "./lib/graph/get/sync/getGlobalStore";
import { type GlobalProperties, useGraph } from "./lib/graph/graph";
import { mergeVertexProperties } from "./lib/graph/mutate/vertex";

interface GetInitialDataProps extends ParentProps {
  authenticate?: boolean;
  dontRedirectToLogin?: boolean;
}

export function GetInitialData(props: GetInitialDataProps) {
  const graph = useGraph();
  const [initialDataLoading, setInitialDataLoading] = createSignal(true);
  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  onMount(async () => {
    try {
      // Run both operations in parallel if authentication is needed
      await Promise.all([
        getInitialDataAndSetToGraph(graph),
        props.authenticate 
          ? loadUser(
              graph[0],
              graph[1],
              props.dontRedirectToLogin ? undefined : navigate,
              showErrorToast
            )
          : Promise.resolve()
      ]);
    } catch (error: any) {
      const globalStoreId = "globalStoreId";
      mergeVertexProperties<GlobalProperties>(0, globalStoreId, graph[0], graph[1], { 
        initialDataFetchError: `Failed to load initial data: ${error.message}` 
      });
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
      <Match when={!(initialDataLoading() || getGlobalStore(graph[0]).P.initialDataFetchError)}>
        {props.children}
      </Match>
    </Switch>
  );
}
