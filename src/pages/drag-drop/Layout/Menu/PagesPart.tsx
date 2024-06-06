import { toTitle } from "case-switcher-js";
import {
  Match,
  createEffect,
  createResource,
  createSignal,
  useContext,
  For,
  Switch,
  Show,
} from "solid-js";
import { useToast } from "~/components/custom/Toast";
import { getTreeDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { DraggedVertexContext } from "~/lib/contexts";
import { GraphContext } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/ws_events";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { Icon } from "@iconify-icon/solid";
import { expressionString } from "~/lib/Utils";
import { LoaderNew } from "~/components/custom/LoaderSimple";

export function PagesPart() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [draggedVertex, setDraggedVertex] = useContext(DraggedVertexContext);
  const { showErrorToast } = useToast();
  let originalData: any[] = [];
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal<any[]>([]);

  // Fetch data function
  async function fetchData(): Promise<{
    graph?: any;
    data?: any;
    error?: string;
  }> {
    try {
      const data = await getTreeDataMGCall({
        collection: expressionString({ coll: "Page" }),
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
            collection: expressionString({ coll: "Page" }),
          });
          originalData = data2;
          setFilteredData(data2);
          setIsFetchingData(false);
        }
      }
    }
  });

  // Update filtered data based on search query
  const updateFilteredData = () => {
    if (!searchQuery()) {
      setFilteredData(originalData);
    } else {
      const filtered = originalData.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery().toLowerCase()),
      );
      setFilteredData(filtered);
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
      <Show when={props.child.name}>
        <div
          style={itemStyle()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          draggable={true}
          onDragStart={(e) => {
            e.stopPropagation();

            setDraggedVertex((prev) => [
              ...prev,
              graph.vertexes[props.child.id],
            ]);
          }}
        >
          <Icon icon={"iconoir:multiple-pages"} height={22} width={22} />
          <div style={{ "font-size": "14px" }}>{toTitle(props.child.name)}</div>
        </div>
      </Show>
    );
  }

  return (
    <Switch fallback={<LoaderNew loaderHeight="55vh" />}>
      <Match when={data.error}>Error: {data.error}</Match>
      <Match when={!isFetchingData()}>
        <>
          <nav class="bg:white p:5 position:sticky abs z:10">
            <div class="group">
              <Icon
                class="icon"
                icon="iconamoon:search"
                style={{ color: "#9e9ea7" }}
              />
              <input
                placeholder="Search Page..."
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
                <div class="p:3 m:20px|0px font-weight:bold text-align:center">
                  No Page Found!
                </div>
              }
            >
              {(item, index) => <ListItemComponent child={item} />}
            </For>
          </div>
        </>
      </Match>
    </Switch>
  );
}
