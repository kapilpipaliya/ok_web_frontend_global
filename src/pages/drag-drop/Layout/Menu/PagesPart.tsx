import { toTitle } from "case-switcher-js";
import { Match, Show, createEffect } from "solid-js";
import { For, Switch, createResource, createSignal, useContext } from "solid-js";
import { TextField } from "~/components/solid-blocks/blocks";
import { getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { DraggedVertexContext } from "~/lib/contexts";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { GraphContext } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/ws_events";

export const PagesPart = () => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  
  let originalData: any[] = [];
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal([] as any[]); // Initialize filteredData with the same type as ICon
  async function fetchData() {
    try {
      const data = await getTreeDataMGCall({
        collection: "g:'Page'",
      });

      setGraphData(graph, setGraph, data.graph);
      const data2 = getTreeData(graph, setGraph, {
        collection: "g:'Page'",
      });
      originalData = data2;
      setFilteredData(data2);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const [data] = createResource(() => fetchData())
  const updateFilteredData = () => {
    if (!searchQuery()) {
      setFilteredData(originalData);
    } else {
      const filteredData = originalData.filter((item) => {
        return item.name && item.name.toLowerCase().includes(searchQuery().toLowerCase());
      });
      setFilteredData(filteredData);
    }
  };

  function ListItemComponent(props: { child: any }) {
    const [isHovered, setIsHovered] = createSignal(false);

    const baseStyle = {
      "border-radius": ".2rem",
      margin: "5px",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      padding: "10px",
      "background-color": "white",
      display: "flex",
      "flex-direction": "row",
      "align-items": "center",
      "justify-content": "space-between",
      height: "35px",
      "box-shadow": "rgba(0, 0, 0, 0.2) 1px 1px 1px 1px",
    };

    const hoverStyle = {
      "background-color": "#F2EDED",
      cursor: "move",
      boxShadow: "4px 4px 4px",
    };

    const itemStyle: any = () =>
      isHovered() ? { ...baseStyle, ...hoverStyle } : baseStyle;

    return (
      <Show when={props.child.name}>
        <div
          style={itemStyle()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          draggable={true}
          onDragStart={(e) => {
            e.stopPropagation();
            setDraggedVertex(graph.vertexes[props.child.id]);
          }}
        >
          <div style={{ "font-size": "14px" }}>{toTitle(props.child.name)}</div>
        </div>
      </Show> 
    );
  }

  return (
    <Switch>
      <Match when={data.loading}>Loading</Match>

      <Match when={data.error}>Error</Match>
      <Match when={true}>
        <div>
          <TextField
            label="Name"
            class="b:1|solid|blue-30 r:5|5|5|5 p:4"
            type="text"
            placeholder="Search Page..."
            value={searchQuery()}
            onInput={(e) => {
              setSearchQuery(e.target.value);
              updateFilteredData(); // Update filteredData when searchQuery changes
            }}
          />
          <div
            class="overflow-y:auto overflow-x:auto m:6px"
            style={{ display: "grid", "grid-template-columns": "repeat(2, 1fr)" }}
          >
            <For
              each={filteredData()}
              fallback={<div class="p:3 font-weight:bold">No Page Found !</div>}
            >
              {(item, index) => <ListItemComponent child={item} />}
            </For>
          </div>
        </div>
        </Match>
    </Switch>
  );
};
