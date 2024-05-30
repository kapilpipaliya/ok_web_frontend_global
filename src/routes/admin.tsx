import { RouteSectionProps, useNavigate } from "@solidjs/router";
import {
  EdgeMap,
  GraphContext,
  GraphInterface,
  Id,
  VertexMap,
} from "~/lib/graph/graph";
import {
  ServerEventsDispatcher,
  WS_PATH,
  WsContext,
} from "~/lib/websocket/ws_events_dispatcher";
import { createStore } from "solid-js/store";
import { API, DataFetcher } from "~/components/api/DataFetcher";
import { MainDashboard } from "~/pages/dashboard/MainDashboard";
import { createEffect, createResource, onMount } from "solid-js";
import { expressionString } from "~/lib/Utils";
import { getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { setGraphData } from "~/lib/websocket/ws_events";

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
