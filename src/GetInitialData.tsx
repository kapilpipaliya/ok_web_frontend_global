import { JSX, createSignal, onMount, useContext, Show } from "solid-js";
import { LoaderNew } from "~/components/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";
import { GraphContext } from "~/lib/graph/graph";

export function GetInitialData(props: { children: JSX.Element; }) {
  const graph = useContext(GraphContext)!;
  const [initialDataLoading, setInitialDataLoading] = createSignal(true);

  onMount(async () => {
    const data = await getInitialDataAndSetToGraph(graph);
    if (data) {
      setInitialDataLoading(false);
    }
  });

  return <Show when={!initialDataLoading()} fallback={<LoaderNew />}>
    {props.children}
  </Show>;
}
