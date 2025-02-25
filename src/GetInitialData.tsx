import { createAsync, useNavigate } from "@solidjs/router";
import { createEffect, Match, type ParentProps, Switch } from "solid-js";

import type { UserData } from "~/lib/graph/mutate/loadUser";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import type { ServerResult } from "~/cypher/types/ServerResult";
import { handleUserNavigation } from "~/lib/graph/mutate/loadUser";
import { setUserData } from "~/lib/graph/mutate/setUserData";

import { getInitialData } from "./cypher/get/getInitialData";
import { getGlobalStore } from "./lib/graph/get/sync/getGlobalStore";
import { useGraph } from "./lib/graph/graph";
import { setGraphData } from "./lib/graph/mutate/setGraphData";
import { getUserRPC } from "./routes/api/auth/(utils)/getUserRPC";

interface GetInitialDataProps extends ParentProps {
  authenticate?: boolean;
  dontRedirectToLogin?: boolean;
}
const fetchData = async (authenticate?: boolean) => {
  "use server";
  const [initialData, userData] = await Promise.all([
    getInitialData(),
    authenticate
      ? getUserRPC().catch(() => {
          // handleUserNavigation(null, navigate);
          return null; // Return null to avoid further processing
        })
      : Promise.resolve(null),
  ]);
  return { initialData, userData };
};

export function GetInitialData(props: GetInitialDataProps) {
  const graph = useGraph();
  const navigate = useNavigate();

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
  const data = createAsync(() => fetchData(props.authenticate));

  createEffect(() => {
    if (data()) {
      setData(data()!.initialData, data()!.userData as UserData);
    }
  });

  // onMount(async () => {
  //   try {
  //     const { initialData, userData } = await fetchData();
  //     setData(initialData, userData);
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       mergeVertexProperties<GlobalProperties>(
  //         0,
  //         "globalStoreId",
  //         graph[0],
  //         graph[1],
  //         {
  //           initialDataFetchError: `Failed to load initial data: ${error.message}`,
  //         },
  //       );
  //     }
  //   } finally {
  //     setInitialDataLoading(false);
  //   }
  // });

  return (
    <Switch>
      <Match when={!data()}>
        <LoaderNew />
      </Match>
      <Match when={getGlobalStore(graph[0]).P.initialDataFetchError}>
        <div class="bg:error p:1">
          {getGlobalStore(graph[0]).P.initialDataFetchError}
        </div>
      </Match>
      <Match when={!getGlobalStore(graph[0]).P.initialDataFetchError}>
        {props.children}
      </Match>
    </Switch>
  );
}
