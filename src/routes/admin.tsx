import type { RouteSectionProps } from "@solidjs/router";
import { Show, createSignal, onMount, useContext } from "solid-js";
import { LoaderNew } from "~/components/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";
import { GraphContext } from "~/lib/graph/graph";
import {
  ServerEventsDispatcher,
  WS_PATH,
  WsContext,
} from "~/lib/websocket/ws_events_dispatcher";
import { MainDashboard } from "~/pages/dashboard/MainDashboard";

export default function AdminLayout(props: RouteSectionProps) {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const graph = useContext(GraphContext)!;

  const [initialDataLoading, setInitialDataLoading] = createSignal(true);

  onMount(async () => {
    const data = await getInitialDataAndSetToGraph(graph);
    if (data) {
      setInitialDataLoading(false);
    }
  });
  return (
    // <CSSRuntimeProvider config={config}>
    <WsContext.Provider value={{ Ws }}>
      {/* In DataFetch fetch only side bar data*/}
      <Show when={!initialDataLoading()} fallback={<LoaderNew />}>
        <MainDashboard children={props.children} />
      </Show>
      {/*{props.children}*/}
    </WsContext.Provider>
    // </CSSRuntimeProvider>
  );
}
