import { toTitle } from "case-switcher-js";
import { For, createSignal, useContext } from "solid-js";
import { TextField } from "~/components/solid-blocks/blocks";
import { DraggedVertexContext } from "~/lib/contexts";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { GraphContext } from "~/lib/graph/graph";

export const PagesPart = () => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const data = getTreeData(graph, setGraph, {
    collection: "g:'Page'",
  });

  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal(data); // Initialize filteredData with the same type as ICon

  const updateFilteredData = () => {
    if (!searchQuery()) {
      setFilteredData(data);
    } else {
      const filteredData = data.filter((item) => {
        return item.name.toLowerCase().includes(searchQuery().toLowerCase());
      }); // Filter out items with no matching children

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
    );
  }

  return (
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
  );
};
