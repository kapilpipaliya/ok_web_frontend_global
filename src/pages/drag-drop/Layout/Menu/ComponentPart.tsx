import { Icon } from "@iconify-icon/solid";
import { For, Show, createEffect, createResource, createSignal, useContext } from "solid-js";
import { useToast } from "~/components/custom/Toast";
import { Tooltip } from "~/components/solid-blocks/blocks";
import { getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { expressionString, iconMap } from "~/lib/Utils";
import { DraggedVertexContext } from "~/lib/contexts";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { GraphContext, Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/ws_events";

export function ComponentPart() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal([] as any[]); // Initialize filteredData with the same type as 
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const { showErrorToast } = useToast();
  let defaultData = [] as any[];

  // Fetch data function
  async function fetchData(): Promise<{
    graph?: any;
    data?: any;
    error?: string;
  }> {
    try {
      const data = await getTreeDataMGCall({
        collection: expressionString({ coll: "CompCategory" }),
        child: { collection: "->CompCategoryComp" },
      });
      return { graph: data.graph, data: data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // Create a resource for data fetching
  const [data] = createResource(fetchData);

  // Create effect to handle data changes
  createEffect(() => {
    setIsFetchingData(true);
    if (data()) {
      const result = data();
      if (result?.error) {
        showErrorToast(result.error);
      } else {
        if (result?.graph) {
          setGraphData(graph, setGraph, result.graph);
          const data2 = getTreeData(graph, setGraph, {
            collection: expressionString({ coll: "CompCategory" }),
            child: { collection: "->CompCategoryComp" },
          });
          defaultData = data2;
          console.log(data2);

          setFilteredData(data2);
          setIsFetchingData(false);
        }
      }
    }
  });
 

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
      setFilteredData(defaultData);
    } else {
      const filteredData = defaultData
        .map((item) => {
          // Filter the children of each item based on the searchQuery
          const category = defaultData.find((i) => i.name === item.name);

          if (category) {
            // Create a copy of the category's children array
            const filteredChildren = category.children && category.children.filter((child: any) => {
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
        .filter((item) => item.children && item.children.length > 0); // Filter out items with no matching children

      setFilteredData(filteredData);
    }
  };

  function ListItemComponent(props: { child: Vertex }) {
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
        <div class="pt:5px flex gap:10px ai:center">
          <Icon
            icon={
              iconMap[props.child?.P.name] ??
              "material-symbols:widgets-outline-rounded"
            }
            width={20}
            height={20}
          />
          <span style={{ "font-size": "14px" }}>{props.child?.P.name}</span>
        </div>

        <Show when={isHovered()}>
          <Tooltip content={"Double click to Edit"}>
            {" "}
            <Icon
              ondblclick={() => {
                const currentURL = window.location.href;
                const navigateUrl =
                  currentURL.split("/").slice(0, -2).join("/") +
                  "/Comp/" +
                  props.child.id;
                window.open(navigateUrl, "_blank");
              }}
              class={"cursor:pointer"}
              icon={"solar:settings-linear"}
            />
          </Tooltip>
        </Show>
      </div>
    );
  }

  return (
    <>
      <nav class="bg:white p:5 position:sticky abs z:10">
        <div class="group">
          <Icon
            class="icon"
            icon="iconamoon:search"
            style={{ color: "#9e9ea7" }}
          />
          <input
            placeholder="Search Component..."
            type="search"
            class="inputSearch f:14"
            value={searchQuery()}
            onInput={(e) => {
              setSearchQuery(e.target.value);
              updateFilteredData(); // Update filteredData when searchQuery changes
            }}
          />
        </div>
      </nav>
      <div
        class="overflow:auto h:full"
        style={{
          "scrollbar-width": "thin",
          "scrollbar-color": "lightgrey",
        }}
      >
        <For
          each={filteredData()}
          fallback={
            <div class="p:3 font-weight:bold m:20px|0px text-align:center">
              No Component Found !
            </div>
          }
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
    </>
  );
}
