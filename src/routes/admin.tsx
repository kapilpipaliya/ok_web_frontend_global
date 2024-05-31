import { RouteSectionProps } from "@solidjs/router";
import {
  ServerEventsDispatcher,
  WS_PATH,
  WsContext,
} from "~/lib/websocket/ws_events_dispatcher";
import { MainDashboard } from "~/pages/dashboard/MainDashboard";

export default function UsersLayout(props: RouteSectionProps) {
  const Ws = new ServerEventsDispatcher(WS_PATH);
 
 

  return (
    // <CSSRuntimeProvider config={config}>
      <WsContext.Provider value={{ Ws }}>
        
        {/* In DataFetch fetch only side bar data*/}
        <MainDashboard children={props.children} />
        {/*{props.children}*/}
      </WsContext.Provider>
    // </CSSRuntimeProvider>
  );
}
