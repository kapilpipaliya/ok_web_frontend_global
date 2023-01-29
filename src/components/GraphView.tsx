// import { Orb } from '@memgraph/orb';

import { createSignal, onCleanup } from "solid-js";

interface GraphViewProps {
  nodes: any[];
  edges: any[];
}

export const GraphView = (props: GraphViewProps) => {
  const [json, setJson] = createSignal({});
  const mount = (container: HTMLDivElement) => {
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

    const orb = new Orb.Orb(container);

    // Initialize nodes and edges
    orb.data.setup({ nodes: props.nodes, edges: props.edges });
    // orb.data.setup({ nodes, edges });

    // Render and recenter the view
    orb.view.render(() => {
      orb.view.recenter();
    });

    orb.events.on(Orb.OrbEventType.NODE_CLICK, (event) => {
      console.log("Event: node-click", event);
      setJson({ ...event.node.data });
    });
    orb.events.on(Orb.OrbEventType.EDGE_CLICK, (event) => {
      console.log("Event: edge-click", event);
      setJson({ ...event.edge.data });
    });
  };

  return (
    <>
      <div style="border: 1px solid #e0e0e0; width: 1200px; height: 600px;" ref={(el) => {
        setTimeout(() => mount(el), 0);
        onCleanup(() => {
          el.replaceChildren();
        });
      }}></div>
      <pre>{JSON.stringify(json())}</pre>
    </>
  );
};
