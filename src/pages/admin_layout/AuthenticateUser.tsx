import type { SetStoreFunction } from "solid-js/store";

import { useNavigate } from "@solidjs/router";
import { type JSX, Match, onMount, Switch } from "solid-js";

import { useToast } from "~/components/styled/Toast";
import { useGraph } from "~/lib/graph/graph";
import { loadUser } from "../../lib/graph/mutate/loadUser";

interface AuthenticateUserProps {
  children: JSX.Element;
  dontRedirectToLogin?: boolean;
}

export function AuthenticateUser(props: Readonly<AuthenticateUserProps>) {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  onMount(() => loadUser(graph, setGraph, props.dontRedirectToLogin ? undefined : navigate, showErrorToast));

  return (
    <Switch>
      <Match when={graph.isLoadingPage}>Loading</Match>
      <Match when={!graph.isLoadingPage}>{props.children}</Match>
    </Switch>
  );
}
