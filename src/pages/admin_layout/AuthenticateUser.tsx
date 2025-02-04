

import { useNavigate } from "@solidjs/router";
import { type JSX, Match, onMount, Switch } from "solid-js";

import { useToast } from "~/components/styled/Toast";
import { useGraph } from "~/lib/graph/graph";

import { loadUser } from "../../lib/graph/mutate/loadUser";
import { getMemberVertex } from "~/lib/graph/get/sync/getMemberVertex";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";

interface AuthenticateUserProps {
  children: JSX.Element;
  dontRedirectToLogin?: boolean;
}

export function AuthenticateUser(props: Readonly<AuthenticateUserProps>) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  onMount(() =>
    loadUser(
      graph,
      setGraph,
      props.dontRedirectToLogin ? undefined : navigate,
      showErrorToast,
    ),
  );

  return (
    <Switch>
      <Match when={props.dontRedirectToLogin && getGlobalStore(graph)?.P.userRoles}>{props.children}</Match>
      <Match when={!getMemberVertex(graph)?.id}>Loading</Match>
      <Match when={getMemberVertex(graph)?.id}>{props.children}</Match>
    </Switch>
  );
}
