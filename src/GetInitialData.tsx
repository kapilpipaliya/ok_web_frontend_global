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
    getUserRPC().catch(() => {
      return null; // Return null to avoid further processing
    }),
    // : Promise.resolve(null),
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
      return await fetchData(props.authenticate);
    },
    { deferStream: true },
  );

  const Content = () => {
    setData(data()!.initialData, data()!.userData as UserData);
    return props.children;
  };

  return (
    <Show when={data()}>
      <Switch>
        {/* <Match when={!data()}>
          <LoaderNew />
        </Match> */}
        <Match
          when={props.authenticate && !(data()?.userData as UserData)?.user}
        >
          <As
            as={"div"}
            css={css`
  background-color: red;
  padding: 1px;
`}
          >
            Not Authorized
          </As>
        </Match>
        <Match when={getGlobalStore(graph[0]).P.initialDataFetchError}>
          <As
            as="div"
            css={css`
  background-color: red;
  padding: 1px;
`}
          >
            {getGlobalStore(graph[0]).P.initialDataFetchError}
          </As>
        </Match>
        <Match when={!getGlobalStore(graph[0]).P.initialDataFetchError}>
          <Content />
        </Match>
      </Switch>
    </Show>
  );
}
