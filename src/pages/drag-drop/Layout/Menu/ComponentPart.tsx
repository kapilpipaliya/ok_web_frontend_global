import { Icon } from "@iconify-icon/solid";
import { Show, For, createSignal, useContext } from "solid-js";
import { Tooltip } from "~/components/solid-blocks/blocks";
import { getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { iconMap } from "~/lib/Utils";
import { DraggedVertexContext } from "~/lib/contexts";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { GraphContext, Vertex } from "~/lib/graph/graph";

export function ComponentPart() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);

  const data = getTreeData(graph, setGraph, {
    collection: "g:'CompCategory'",
    // TODO: Dont display "Form" Component
    child: { collection: "->CompCategoryComp" },
  });

  /* Code to get menu data from server
  const data2 = getTreeDataMGCall({
    collection: "g:'CompCategory'",
    // TODO: Dont display "Form" Component
    child: { collection: "->CompCategoryComp" },
  });
  data2.then((data) => console.log(data));*/


  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal(data); // Initialize filteredData with the same type as ICon

  const titleStyle = {
    "font-size": "17px",
    "font-weight": "bolder",
    "margin-bottom": "8px",
    "margin-top": "8px",
  };

  const listStyle = {
    "list-style-type": "none",
  };

  const listBoxStyle = {
    display: "grid",
    gap: "10px",
  };

  // Function to get icon by category
  const updateFilteredData = () => {
    if (!searchQuery()) {
      setFilteredData(data);
    } else {
      const filteredData = data
        .map((item) => {
          // Filter the children of each item based on the searchQuery
          const category = data.find((i) => i.name === item.name);

          if (category) {
            // Create a copy of the category's children array
            const filteredChildren = category.children.filter((child: any) => {
              return (
                child.name &&
                child.name.toLowerCase().includes(searchQuery().toLowerCase())
              );
            });

            // Return a new object with the filtered children
            return {
              ...item,
              children: filteredChildren,
            };
          } else {
            return item;
          }
        })
        .filter((item) => item.children.length > 0); // Filter out items with no matching children

      setFilteredData(filteredData);
    }
  };

  function ListItemComponent(props: { child: Vertex; }) {
    const [isHovered, setIsHovered] = createSignal(false);

    const baseStyle = {
      "border-radius": ".2rem",
      "margin-left": "3px",
      "margin-right": "3px",
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
      padding: "10px",
      "justify-content": "space-between",
      "background-color": "white",
      display: "flex",
      "flex-direction": "row",
      "align-items": "center",
      gap: "10px",
      height: "35px",
      "box-shadow": "rgba(0, 0, 0, 0.2) 0px 0px 5px 0px",
    };

    const hoverStyle = {
      "background-color": "#F2EDED",
      cursor: "move",
      boxShadow: "4px 4px 4px",
    };

    const itemStyle: any = () => isHovered() ? { ...baseStyle, ...hoverStyle } : baseStyle;

    return (
      <div
        style={itemStyle()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          setDraggedVertex(graph.vertexes[props.child.id]);
        } }
      >
        <div class="pt:5px flex gap:10px ai:center">
          <Icon
            icon={iconMap[props.child?.P.name] ??
              "material-symbols:widgets-outline-rounded"}
            width={20}
            height={20} />
          <span style={{ "font-size": "14px" }}>{props.child?.P.name}</span>
        </div>

        <Show when={isHovered()}>
          <Tooltip content={"Double click to Edit"}>
            {" "}
            <Icon
              ondblclick={() => {
                const currentURL = window.location.href;
                const navigateUrl = currentURL.split("/").slice(0, -2).join("/") +
                  "/Comp/" +
                  props.child.id;
                window.open(navigateUrl, "_blank");
              } }
              class={"cursor:pointer"}
              icon={"solar:settings-linear"} />
          </Tooltip>
        </Show>
      </div>
    );
  }

  return (
    <div>
      <nav class="bg:white 0px 0px 10px 10px w:full">
        <div class="group">
          <Icon
            class="icon"
            icon="iconamoon:search"
            style={{ color: "#9e9ea7" }} />
          <input
            placeholder="Search Component..."
            type="search"
            class="inputSearch f:14"
            value={searchQuery()}
            onInput={(e) => {
              setSearchQuery(e.target.value);
              updateFilteredData(); // Update filteredData when searchQuery changes
            } } />
        </div>
      </nav>
      <div>
        <For
          each={filteredData()}
          fallback={<div class="p:3 font-weight:bold">No Component Found !</div>}
        >
          {(item) => (
            <div class="m:20px|0px">
              <div style={titleStyle}>{item.name}</div>
              <ul style={{ ...listBoxStyle, ...listStyle }}>
                <For each={item.children}>
                  {(child) => <ListItemComponent child={child} />}
                </For>
              </ul>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
