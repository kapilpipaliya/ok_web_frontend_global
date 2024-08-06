import type { SetStoreFunction } from "solid-js/store";

import { useNavigate } from "@solidjs/router";
import { type JSX, Match, onMount, Switch } from "solid-js";

import { useToast } from "~/components/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { updateVertex } from "~/lib/graph/mutate/setGraphData";

export function AuthenticateUser(props: Readonly<{ children: JSX.Element; }>) {
  const [graph, setGraph] = useGraph();

  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  setGraph('isLoadingPage', true);
  const loadUser = async (graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) => {
    try {
      const data = await getAPI(API.getUserUrl);
      if (data) {
        if (data.user) {
          setGraph("member", data.user);
        }
        if (data.userSetting) {
          setGraph("userSettingId", data.userSetting.id);
          updateVertex(data.userSetting.id, data.userSetting, graph, setGraph, false);
        }
        if (data.roles) {
          setGraph("userRoles", data.roles.map((role: Vertex) => role.id));
          for (const role of data.roles) {
            updateVertex(role.id, role, graph, setGraph, false);
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        showErrorToast(err.message);
        navigate("/auth/login");
      }
    } finally {
      setGraph('isLoadingPage', false);
    }
  };

  onMount(() => {
    loadUser(graph, setGraph);
  });

  return (
    <Switch>
      <Match when={graph.isLoadingPage}>
        Loading
      </Match>
      <Match when={!graph.isLoadingPage}>
        {props.children}
      </Match>
    </Switch>
  );
}
