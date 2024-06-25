import { JSX, createSignal, onMount, useContext, Show, Switch, Match } from "solid-js";
import { LoaderNew } from "~/components/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";
import { GraphContext } from "~/lib/graph/graph";

export function GetInitialData(props: { children: JSX.Element; }) {
  const graph = useContext(GraphContext)!;
  const [initialDataLoading, setInitialDataLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  onMount(async () => {
    try {
      await getInitialDataAndSetToGraph(graph);
    } catch (error) {
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
      <Match when={!initialDataLoading() && !error()}>
        {props.children}
      </Match>
    </Switch>
  );
}
