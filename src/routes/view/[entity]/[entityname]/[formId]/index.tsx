import { useParams } from "@solidjs/router";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import {
  ServerEventsDispatcher,
  WS_PATH,
} from "~/lib/websocket/ws_events_dispatcher";
import { GetInitialData } from "../../../../../GetInitialData";

export default function PageShareView() {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const params = useParams();

  return (
    <GetInitialData>
      <PageViewWrapper pageVertexLabel={params.entity} pageVertexName={params.entityname} pageId={params.formId} />
    </GetInitialData>
  );
}

