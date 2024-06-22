import type { RouteSectionProps, } from "@solidjs/router";
import { Show, createSignal, onMount, useContext } from "solid-js";
import { LoaderNew } from "~/components/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";
import { GraphContext } from "~/lib/graph/graph";

export default function AuthLayout(props: RouteSectionProps) {
  // const navigate = useNavigate();

  const [initialDataLoading, setInitialDataLoading] = createSignal(true);

  onMount(async () => {
    const data = await getInitialDataAndSetToGraph(useContext(GraphContext)!);
    if (data) {
      setInitialDataLoading(false);
    }
  });


  // getAPI(API.getUserUrl).then((user) => {
  //   if (user?.id) {
  //     navigate(`${APP_BASE_URL}`);
  //   }
  // });


  return <Show when={!initialDataLoading()} fallback={<LoaderNew />}>
    {props.children}
    </Show>;
}
