import { createAsync, query, useNavigate } from "@solidjs/router";
import { Match, type ParentProps, Show, Switch } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { UserData } from "~/lib/graph/mutate/user/loadUser";
import { handleUserNavigation } from "~/lib/graph/mutate/user/loadUser";

import { setUserData } from "~/lib/graph/mutate/user/setUserData";

import { getInitialData } from "./cypher/get/getInitialData";
import { getGlobalStore } from "./lib/graph/get/sync/store/getGlobalStore";
import { setGraphData } from "./lib/graph/mutate/core/setGraphData";
import { getUserRPC } from "./routes/api/auth/(user)/getUserRPC";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { SimpleErrorMessage } from "~/components/SimpleErrorMessage";
import { loadWebsiteSchemasForSubdomain } from "~/createAppState";
import type { APIErrorResponse } from "~/lib/api/server/apiErrorHandler";

interface GetInitialDataProps extends ParentProps {
  dontRedirectToLogin?: boolean;
}

const fetchData = query(async () => {
  "use server";
  const [initialData, userData] = await Promise.all([
    getInitialData().catch(
      (error): ServerResult => ({
        error: error.message || "Failed to connect to database",
        graph: undefined,
      }),
    ),
    // authenticate ?
    getUserRPC().catch(() => null),
    // : Promise.resolve(null),
  ]);
  return { initialData, userData };
}, "initialData");

export function GetInitialData(props: GetInitialDataProps) {
  const graph = useGraph();
  const navigate = useNavigate();

  const setData = (
    initialData: ServerResult,
    userData?: UserData | APIErrorResponse | null,
  ) => {
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
      return;
    }

    setGraphData(graph[0], graph[1], initialData.graph!);

    // Store subdomain and domain in global store and load website schemas
    if (initialData.subdomain) {
      mergeVertexProperties<GlobalProperties>(
        0,
        "globalStoreId",
        graph[0],
        graph[1],
        {
          subdomain: initialData.subdomain,
          domain: initialData.domain || undefined,
        },
      );

      // In Development Remove comment
      // Load website schemas based on subdomain
      // loadWebsiteSchemasForSubdomain(
      //   graph[0],
      //   graph[1],
      //   initialData.subdomain,
      //   initialData.domain || undefined,
      // );
    }

    if (userData) {
      // Check if userData is an error response
      if ("error" in userData) {
        // Handle API error - log it or store in global state if needed
        console.error("Failed to load user data:", userData.error);
        return;
      }

      // First, set the graph with IN/OUT relationships
      if (userData.graph) {
        setGraphData(graph[0], graph[1], userData.graph);
      }

      // Then, set user IDs in global store
      setUserData(graph[0], graph[1], userData);

      handleUserNavigation(
        userData,
        props.dontRedirectToLogin ? undefined : navigate,
      );
    }
  };

  const reSetData = async (
    count: number | undefined,
    freshData: ReturnType<typeof fetchData>,
  ) => {
    // Only refetch if count is greater than 0 (skip initial load)
    if (count && count > 0) {
      setData(freshData.initialData, freshData.userData);
    }
  };

  const data = createAsync(
    async () => {
      const trackedCountBeforeFetch = getGlobalStore(graph[0]).P
        .initialDataRefreshCount;
      const result = await fetchData();
      reSetData(trackedCountBeforeFetch, result);
      return result;
    },
    { deferStream: true },
  );

  const RenderContent = () => {
    setData(data()!.initialData, data()!.userData);
    return (
      <Switch>
        <Match when={getGlobalStore(graph[0]).P.initialDataFetchError}>
          <SimpleErrorMessage
            message={getGlobalStore(graph[0]).P.initialDataFetchError}
          />
        </Match>
        <Match when={!getGlobalStore(graph[0]).P.initialDataFetchError}>
          {props.children}
        </Match>
      </Switch>
    );
  };

  return (
    <Show when={data()}>
      <RenderContent />
    </Show>
  );
}
