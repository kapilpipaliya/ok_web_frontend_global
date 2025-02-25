import { useNavigate } from "@solidjs/router";
import {
  createSignal,
  Match,
  onMount,
  type ParentProps,
  Switch,
} from "solid-js";

import type { UserData } from "~/lib/graph/mutate/loadUser";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { ServerResult } from "~/cypher/types/ServerResult";
import { fetchInitialData } from "~/lib/graph/mutate/getInitialDataAndSetToGraph";
import { fetchUserData, handleUserNavigation } from "~/lib/graph/mutate/loadUser";
import { setUserData } from "~/lib/graph/mutate/setUserData";

import { getGlobalStore } from "./lib/graph/get/sync/getGlobalStore";
import { type GlobalProperties, useGraph } from "./lib/graph/graph";
import { setGraphData } from "./lib/graph/mutate/setGraphData";
import { mergeVertexProperties } from "./lib/graph/mutate/vertex";

interface GetInitialDataProps extends ParentProps {
  authenticate?: boolean;
  dontRedirectToLogin?: boolean;
}

export function GetInitialData(props: GetInitialDataProps) {
  const graph = useGraph();
  const [initialDataLoading, setInitialDataLoading] = createSignal(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    const [initialData, userData] = await Promise.all([
      fetchInitialData(graph[0]),
      props.authenticate ? fetchUserData().catch(() => {
        handleUserNavigation(null, navigate);
        return null; // Return null to avoid further processing
      }) : Promise.resolve(null),
    ]);
    return { initialData, userData };
  };

  const setData = (initialData: ServerResult, userData: null | UserData) => {
    setGraphData(graph[0], graph[1], initialData.graph!);
    
    if (userData) {
      setUserData(graph[0], graph[1], userData);
      handleUserNavigation(
        userData,
        props.dontRedirectToLogin ? undefined : navigate,
      );
    }
  };

  onMount(async () => {
    try {
      const { initialData, userData } = await fetchData();
      setData(initialData, userData);
    } catch (error) {
      if (error instanceof Error) {
        mergeVertexProperties<GlobalProperties>(
          0,
          "globalStoreId",
          graph[0],
          graph[1],
          {
            initialDataFetchError: `Failed to load initial data: ${error.message}`,
          },
        );
      }
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
        <div class="bg:error p:1">
          {getGlobalStore(graph[0]).P.initialDataFetchError}
        </div>
      </Match>
      <Match
        when={
          !(
            initialDataLoading() ||
            getGlobalStore(graph[0]).P.initialDataFetchError
          )
        }
      >
        {props.children}
      </Match>
    </Switch>
  );
}
