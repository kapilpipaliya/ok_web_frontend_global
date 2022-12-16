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
import { batch } from "solid-js";
import { addNewVertex, deleteVertex, newVertex } from "./lib/Vertex";
import {
 Edge,
 Vertex
} from "../../ok_web_components/src/components/input/Form";
import { addNewEdge, deleteEdge, newEdge } from "./lib/Edge";

render(() => {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const setGraphData = (args: { vertexes: Vertex[], edges: Edge[], deleted_vertexes: string[], deleted_edges: string[] }) => {
   console.log(args);
   batch(() => {
    args.vertexes?.map(v => addNewVertex(newVertex(v.id, v.labels, v.properties)));
    args.edges?.map(e => addNewEdge(newEdge(e.id, e.type, e.properties, e.start, e.end)));
    args.deleted_edges?.map(deleteEdge);
    args.deleted_vertexes?.map(deleteVertex);
   });
  };
  Ws.bind(['get', 'sync', 0], setGraphData)
  return <WsContext.Provider value={{ Ws }}>
   <DebugProvider>
    <Router>
     <FullDashboard />
    </Router>
   </DebugProvider>
  </WsContext.Provider>;
 },
 document.getElementById("root") as HTMLElement);
