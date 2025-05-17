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
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface GetInitialDataProps extends ParentProps {
  authenticate?: boolean;
  dontRedirectToLogin?: boolean;
}

const fetchData = query(async (authenticate?: boolean) => {
  "use server";
  const [initialData, userData] = await Promise.all([
    getInitialData(),
    // authenticate ?
    getUserRPC().catch(() => null),
    // : Promise.resolve(null),
  ]);
  return { initialData, userData };
}, "initialData");

const ErrorMessage = (props: { message: string }) => (
  <As
    as="div"
    css={(args) => css`
        background-color: ${args.theme.var.color.error_20};
        color: ${args.theme.var.color.error};
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        text-align: center;
        margin-bottom: 1rem;
    `}
  >
    {props.message}
  </As>
);

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
      return;
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
      return await fetchData(props.authenticate);
    },
    { deferStream: true },
  );

  const RenderContent = () => {
    setData(data()!.initialData, data()!.userData as UserData);
    return (
      <Switch>
        <Match
          when={props.authenticate && !(data()?.userData as UserData)?.user}
        >
          <ErrorMessage message="Not Authorized" />
        </Match>
        <Match when={getGlobalStore(graph[0]).P.initialDataFetchError}>
          <ErrorMessage
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
