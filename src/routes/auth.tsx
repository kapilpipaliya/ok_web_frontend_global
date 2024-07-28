import type { RouteSectionProps } from "@solidjs/router";

import { Show, createSignal, onMount } from "solid-js";

import { LoaderNew } from "~/components/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";
import { useGraph } from "~/lib/graph/graph";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  // const navigate = useNavigate();

  const [initialDataLoading, setInitialDataLoading] = createSignal(true);
  const graph = useGraph();

  onMount(async () => {
    const data = await getInitialDataAndSetToGraph(graph);
    if (data) {
      setInitialDataLoading(false);
    }
  });

  // getAPI(API.getUserUrl).then((data) => {
  //   const user = data.user;
  //   if (user?.id) {
  //     navigate(`${graph.APP_BASE_URL}`);
  //   }
  // });

  return (
    <Show fallback={<LoaderNew />} when={!initialDataLoading()}>
      {props.children}
    </Show>
  );
}
