import { createAsync, query, useNavigate } from "@solidjs/router";
import { createEffect, Match, type ParentProps, Show, Switch } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { UserData } from "~/lib/graph/mutate/user/loadUser";

import { type GlobalProperties, useGraph } from "~/lib/graph/GraphContext";
import { handleUserNavigation } from "~/lib/graph/mutate/user/loadUser";
import { setUserData } from "~/lib/graph/mutate/user/setUserData";

import { getInitialData } from "./cypher/get/getInitialData";
import { getGlobalStore } from "./lib/graph/get/sync/store/getGlobalStore";
import { setGraphData } from "./lib/graph/mutate/core/setGraphData";
import { mergeVertexProperties } from "./lib/graph/mutate/core/vertex";
import { getUserRPC } from "./routes/api/auth/(user)/getUserRPC";

interface GetInitialDataProps extends ParentProps {
  authenticate?: boolean;
  dontRedirectToLogin?: boolean;
}

const fetchData = query(async (authenticate?: boolean) => {
  "use server";
  const [initialData, userData] = await Promise.all([
    getInitialData(),
    authenticate
      ? getUserRPC().catch(() => {
          return null; // Return null to avoid further processing
        })
      : Promise.resolve(null),
  ]);
  return { initialData, userData };
}, "initialData");

export function GetInitialData(props: GetInitialDataProps) {
  const graph = useGraph();
  const navigate = useNavigate();

  const setData = (initialData: ServerResult, userData: null | UserData) => {
    if (initialData.error) {
      mergeVertexProperties<GlobalProperties>(
        0,
        "globalStoreId",
        graph[0],
        graph[1],
        {
          initialDataFetchError: `Failed to load initial data: ${initialData.error}`,
        },
      );
      return; // Exit early if there's an error
    }

    setGraphData(graph[0], graph[1], initialData.graph!);

    if (userData) {
      setUserData(graph[0], graph[1], userData);
      handleUserNavigation(
        userData,
        props.dontRedirectToLogin ? undefined : navigate,
      );
    }
  };
  const data = createAsync(
    async () => {
      const result = await fetchData(props.authenticate);
      setData(result.initialData, result.userData as UserData);
      return result;
    },
    { deferStream: true },
  );
  createEffect(() => {
    if (data()) {
      setData(data()!.initialData, data()!.userData as UserData);
    }
  });

  return (
    <Show when={data()}>
      <Switch>
        {/* <Match when={!data()}>
          <LoaderNew />
        </Match> */}
        <Match
          when={props.authenticate && !(data()?.userData as UserData)?.user}
        >
          <div class="bg:error-20 p:1rem">Not Authorized</div>
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
    </Show>
  );
}
