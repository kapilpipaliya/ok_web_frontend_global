import { Icon } from "@iconify-icon/solid";
import {
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
  useContext
} from "solid-js";
import { useToast } from "~/components/Toast";
import { getTreeData } from "~/lib/graph/get/sync/traverse";
import { GraphContext } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";
import { LoaderNew } from "~/components/LoaderSimple";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { getTreeDataMGCall } from "~/cypher/get/getTreeDataMGCall";
import { ComonentItem } from "./ComonentItem";

export function ComponentList() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal([] as any[]); // Initialize filteredData with the same type as
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const { showErrorToast } = useToast();

  let defaultData = [] as any[];
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
                <div style={titleStyle}>{item.P.label || item.P.name}</div>
                <ul style={{ ...listBoxStyle, ...listStyle }}>
                  <For each={item.children}>
                    {(child) => <ComonentItem child={child} />}
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
