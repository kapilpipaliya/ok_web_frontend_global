import { Icon } from "@iconify-icon/solid";
import {
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
  useContext,
} from "solid-js";
import { useToast } from "~/components/Toast";
import { Checkbox } from "~/components/solid_blocks";
import {
  DraggedVertexContext,
  PageConfigContext,
  SelectedIdContext,
} from "~/lib/contexts";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Vertex, type Id } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/ws_events";
import { onClickAddComponent } from "../CommonCompUtils";
import { LoaderNew } from "~/components/LoaderSimple";
import { iconMap } from "~/lib/constants";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import {getTreeDataMGCall} from "~/cypher/get/getTreeDataMGCall";

export function ComponentPart() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext) || [];
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal([] as any[]); // Initialize filteredData with the same type as
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const { showErrorToast } = useToast();
  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );
  let defaultData = [] as any[];
  const handleCheckboxChange = (event: Event, id: Id) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      setSelectedComponents((prev) => new Set(prev).add(graph.vertexes[id]));
    } else {
      setSelectedComponents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(graph.vertexes[id]);
        return newSet;
      });
    }
  };
  const componentTreeMetaData = {
    collection: paginationExpression({ coll: "CompCategory" }),
    child: { collection: "->CompCategoryComp" },
  };
  // Fetch data function
  async function fetchData(): Promise<{
    graph?: any;
    data?: any;
    error?: string;
  }> {
    try {
      const data = await getTreeDataMGCall(componentTreeMetaData);
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
          getTreeDataAndSetState();
        }
      }
    }
  });

  function getTreeDataAndSetState() {
    const data2 = getTreeData(graph, setGraph, componentTreeMetaData);
    defaultData = data2;
    setFilteredData(data2);
    setIsFetchingData(false);
  }

  const titleStyle = {
    "font-size": "17px",
    "font-weight": "600",
    "margin-bottom": "8px",
    "margin-top": "8px",
  };

  const listStyle = {
    "list-style-type": "none",
  };

  const listBoxStyle = {
    display: "grid",
    "grid-template-columns": "repeat(2, 1fr)",
    gap: "5px",
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
            const filteredChildren = category.children?.filter((child: any) => {
              return child.name
                ?.toLowerCase()
                .includes(searchQuery().toLowerCase());
            });

            // Return a new object with the filtered children
            return {
              ...item,
              children: filteredChildren,
            };
          }
          return item;
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
      "justify-content": "space-between",
      "background-color": "white",
      display: "flex",
      "flex-direction": "row",
      "align-items": "center",
      position: "relative",
      gap: "5px",
      padding: "10px 0px",
      "place-content": "center",
      "box-shadow": "rgba(0, 0, 0, 0.2) 0px 0px 5px 0px",
    };

    const hoverStyle = {
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
          setDraggedVertex([]);
          const dataTransfer =
            selectedComponents().size > 0
              ? Array.from(selectedComponents())
              : [graph.vertexes[props.child.id]];
          setDraggedVertex((prev) => [...prev, ...dataTransfer]);
          setSelectedComponents(new Set());
        }}
        ondblclick={(e) => {
          setDraggedVertex([graph.vertexes[props.child.id]]);
          onClickAddComponent(
            graph,
            setGraph,
            pageConfig.formData.txnId,
            draggedVertex()[0],
            pageConfig.formData || {},
            selectedId() !== -1
              ? selectedId()
              : pageConfig.formData.formData.id,
          );
          setDraggedVertex([]);
        }}
      >
        <Show when={isHovered()}>
          <Icon
            onClick={() => {
              const currentURL = window.location.href;
              const navigateUrl = `${currentURL
                .split("/")
                .slice(0, -2)
                .join("/")}/Comp/${props.child.id}`;
              window.open(navigateUrl, "_blank");
            }}
            style={{
              cursor: "pointer",
              position: "absolute",
              right: "3px",
              top: "3px",
            }}
            icon={"solar:settings-linear"}
            width={21}
            height={21}
          />
        </Show>
        {/* @ts-ignore  */}
        <Show
          when={
            isHovered() ||
            selectedComponents().has(graph.vertexes[props.child.id])
          }
        >
          <Checkbox
            wrapperStyle={{ height: "19px", width: "19px" }}
            type="checkbox"
            style={{ position: "absolute", top: "-2px", left: "7px" }}
            onChange={(e) => handleCheckboxChange(e, props.child.id)}
            // @ts-ignore
            checked={selectedComponents().has(graph.vertexes[props.child.id])}
          />
        </Show>
        <div
          class="pt:5px flex gap:5px ai:center"
          style={{ "flex-flow": "column" }}
        >
          <Icon
            icon={
              iconMap[props.child?.P.name] ??
              "material-symbols:widgets-outline-rounded"
            }
            width={24}
            height={24}
          />
          <span style={{ "font-size": "14px" }}>{props.child?.P.name}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav class="bg:white p:5 position:sticky abs">
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
        <Show when={!isFetchingData()} fallback={<LoaderNew loaderHeight="55vh" />}>
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
        </Show>

      </div>
    </>
  );
}
