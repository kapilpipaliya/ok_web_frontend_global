import { createSignal, type JSX, Match, onMount, Switch } from "solid-js";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";

import { useGraph } from "./lib/graph/graph";

export function GetInitialData(props: Readonly<{ children: JSX.Element }>) {
  const graph = useGraph();
  const [initialDataLoading, setInitialDataLoading] = createSignal(true);
  const [error, setError] = createSignal<null | string>(null);

  onMount(async () => {
    try {
      await getInitialDataAndSetToGraph(graph);
    } catch (_error) {
      setError("Failed to load initial data. Please try again.");
    } finally {
      setInitialDataLoading(false);
    }
  });

  return (
    <Switch>
      <Match when={initialDataLoading()}>
        <LoaderNew />
      </Match>
      <Match when={error()}>
        <div>{error()}</div>
      </Match>
      <Match when={!(initialDataLoading() || error())}>{props.children}</Match>
    </Switch>
  );
}
