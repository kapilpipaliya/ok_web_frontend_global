/* @refresh reload */
import "./index.css";
import "@master/css";
import { render } from "solid-js/web";
import { DebugProvider } from "./components/core/SolidDebug";
import { FullDashboard } from "./components/Dashboard";
import { Router } from "solid-app-router";
import "./webcomponents";
import {
 ServerEventsDispatcher,
 WS_PATH,
 WsContext
} from "./components/ws_events_dispatcher";
import { batch, createSignal, For } from "solid-js";
import { addNewVertex, deleteVertex, newVertex } from "./lib/Vertex";
import {
 Edge,
 Vertex
} from "../../ok_web_components/src/components/input/Form";
import { addNewEdge, deleteEdge, newEdge } from "./lib/Edge";
import { AlertMessage } from "./Type";
import { AlertMessageContext } from "./appState";
import { createStore } from "solid-js/store";

render(() => {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const [alerts, setAlert] = createStore([] as AlertMessage[]);

  const setGraphData = (args: { vertexes: Vertex[], edges: Edge[], deleted_vertexes: string[], deleted_edges: string[] }) => {
   batch(() => {
    args.vertexes?.map(v => addNewVertex(0, newVertex(v.id, v.labels, v.properties)));
    args.edges?.map(e => addNewEdge(0, newEdge(e.id, e.type, e.properties, e.start, e.end)));
    args.deleted_edges?.map(edgeId => deleteEdge(0, edgeId));
    args.deleted_vertexes?.map(vertexId => deleteVertex(0, vertexId));
   });
  };
  Ws.bind(["get", "sync", 0], setGraphData);
  return <WsContext.Provider value={{ Ws }}>
   <AlertMessageContext.Provider value={{ alerts, setAlert }}>
    <For each={alerts}>{alert => <ui5-message-strip design={alert.state} hideIcon={alert.hideIcon} hideCloseButton={alert.hideCloseButton} >{alert.message}</ui5-message-strip>}</For>
    <DebugProvider>
     <Router>
      <FullDashboard />
     </Router>
    </DebugProvider>
   </AlertMessageContext.Provider>
  </WsContext.Provider>;
 },
 document.getElementById("root") as HTMLElement);
