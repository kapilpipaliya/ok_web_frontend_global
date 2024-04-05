import {createEffect, createSignal, Show, useContext} from "solid-js";

import { GraphView } from "../components/GraphView";
import {GraphContext} from "../lib/graph";

export const GraphViewPage = () => {
    const [graph,setGraph] = useContext(GraphContext)!;
 const [load, setLoad] = createSignal(false);
 createEffect(() => {
  if (graph.vertexes && graph.edges) {
   setLoad(false);
   setTimeout(() => setLoad(true), 0);
   console.log("reloading");
  }
 });
 return <Show when={load()}>
  <GraphView
   edges={Object.entries(graph.edges)
    .filter(([_, edge]) => edge.T !== "MetaAttr")
    .map(([key, value]) => ({
     ...value,
     type: value.T,
     start: value.S,
     end: value.E
    }))}
   nodes={Object.entries(graph.vertexes)
    .filter(([_, vertex]) => vertex.L[0] !== "MetaAttr")
    .map(([key, value]) => ({
     ...value,
     label: value.L[0]
    }))}
  />
 </Show>;
};