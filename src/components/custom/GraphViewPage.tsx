import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
  useContext,
} from "solid-js";
import { GraphContext } from "~/lib/graph/graph";

interface GraphViewProps {
  nodes: any[];
  edges: any[];
}

export function GraphViewPage() {
  const GraphView = (props: GraphViewProps) => {
    const [json, setJson] = createSignal({});
    const mount = (container: HTMLDivElement) => {
      // TODO: Dynamically import library only when required.
      // const nodes = [
      //   { id: 1, label: "Orb" },
      //   { id: 2, label: "Graph" },
      //   { id: 3, label: "Canvas" },
      // ];
      // const edges = [
      //   { id: 1, start: 1, end: 2, label: "DRAWS" },
      //   { id: 2, start: 2, end: 3, label: "ON" },
      // ];
      // First `Orb` is just a namespace of the JS package
      // @ts-ignore
      const orb = new Orb.Orb(container);

      // Initialize nodes and edges
      orb.data.setup({ nodes: props.nodes, edges: props.edges });
      // orb.data.setup({ nodes, edges });
      // Render and recenter the view
      orb.view.render(() => {
        orb.view.recenter();
      });

      // @ts-ignore
      orb.events.on(Orb.OrbEventType.NODE_CLICK, (event) => {
        setJson({ ...event.node.data });
      });
      // @ts-ignore
      orb.events.on(Orb.OrbEventType.EDGE_CLICK, (event) => {
        setJson({ ...event.edge.data });
      });
    };

    return (
      <>
        <div
          style="border: 1px solid #e0e0e0; width: 1200px; height: 600px;"
          ref={(el) => {
            setTimeout(() => mount(el), 0);
            onCleanup(() => {
              el.replaceChildren();
            });
          } }
        ></div>
        <pre>{JSON.stringify(json())}</pre>
      </>
    );
  };

  const [graph, setGraph] = useContext(GraphContext)!;
  const [load, setLoad] = createSignal(false);
  createEffect(() => {
    if (graph.vertexes && graph.edges) {
      setLoad(false);
      setTimeout(() => setLoad(true), 0);
      console.log("reloading");
    }
  });
  return (
    <Show when={load()}>
      <GraphView
        edges={Object.entries(graph.edges)
          .filter(([_, edge]) => edge.T !== "MetaAttr")
          .map(([key, value]) => ({
            ...value,
            type: value.T,
            start: value.S,
            end: value.E,
          }))}
        nodes={Object.entries(graph.vertexes)
          .filter(([_, vertex]) => vertex.L[0] !== "MetaAttr")
          .map(([key, value]) => ({
            ...value,
            label: value.L[0],
          }))} />
    </Show>
  );
}
