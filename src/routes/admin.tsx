import type { RouteSectionProps } from "@solidjs/router";
import { WsContext, ServerEventsDispatcher, WS_PATH } from "~/lib/websocket/ws_events_dispatcher";
import { MainDashboard } from "~/pages/dashboard/MainDashboard";
import { GetInitialData } from "~/GetInitialData";

export default function AdminLayout(props: RouteSectionProps) {
  const Ws = new ServerEventsDispatcher(WS_PATH);

  return (
    // <CSSRuntimeProvider config={config}>
    <WsContext.Provider value={{ Ws }}>
      {/* In DataFetch fetch only side bar data*/}
      <GetInitialData>
        <MainDashboard children={props.children} />
      </GetInitialData>
      {/*{props.children}*/}
    </WsContext.Provider>
    // </CSSRuntimeProvider>
  );
}
