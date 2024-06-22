import { useParams } from "@solidjs/router";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { Show, createSignal, onMount, useContext } from "solid-js";
import { LoaderNew } from "~/components/LoaderSimple";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";
import { GraphContext } from "~/lib/graph/graph";
import {
  ServerEventsDispatcher,
  WS_PATH,
} from "~/lib/websocket/ws_events_dispatcher";

export default function PageShareView() {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const graph = useContext(GraphContext)!;

  const [initialDataLoading, setInitialDataLoading] = createSignal(true);

  onMount(async () => {
    const data = await getInitialDataAndSetToGraph(graph);
    if (data) {
      setInitialDataLoading(false);
    }
  });

  const params = useParams();
  return <Show when={!initialDataLoading()} fallback={<LoaderNew />}>
    <PageViewWrapper pageVertexLabel={params.entity} pageVertexName={params.entityname} pageId={params.formId} />
  </Show>;
}
