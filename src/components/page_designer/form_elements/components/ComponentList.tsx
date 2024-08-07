import {
  createEffect,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";

import { SearchBar } from "~/components/css_properties/SearchBar";
import { LoaderNew } from "~/components/LoaderSimple";
import { useToast } from "~/components/Toast";
import { getTreeDataMGCall } from "~/cypher/get/client/getTreeDataMGCall";
import { getTreeData } from "~/lib/graph/get/sync/getTreeData";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { ComonentItem } from "./ComonentItem";

export function ComponentList() {
  const [graph, setGraph] = useGraph();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal([] as any[]); // Initialize filteredData with the same type as
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const { showErrorToast } = useToast();

  let defaultData = [] as any[];
  const componentTreeMetaData = {
    child: { collection: "->CompCategoryComp" },
    collection: paginationExpression({ coll: "CompCategory" }),
  };
  // Fetch data function
  async function fetchData(): Promise<{
    data?: any;
    error?: string;
    graph?: any;
  }> {
    try {
      const data = await getTreeDataMGCall(componentTreeMetaData);
      return { data: data, graph: data.graph };
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
      } else if (result?.graph) {
        setGraphData(graph, setGraph, result.graph);
        getTreeDataAndSetState();
      }
    }
  });

  function getTreeDataAndSetState() {
    const data2 = getTreeData(graph, setGraph, componentTreeMetaData);
    defaultData = data2;
    setFilteredData(data2);
    setIsFetchingData(false);
  }
  // Function to get icon by category
  const updateFilteredData = () => {
    if (searchQuery()) {
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
    } else {
      setFilteredData(defaultData);
    }
  };

  return (
    <>
      <SearchBar
        handleChange={(value) => {
          setSearchQuery(value);
          updateFilteredData(); // Update filteredData when searchQuery changes
        }}
        placeholder="Search Component..."
        value={searchQuery()}
      />
      <div class="scrollbar-color:lightgrey {scrollbar-width:thin} h:full overflow:auto">
        <Show
          fallback={<LoaderNew loaderHeight="55vh" />}
          when={!isFetchingData()}
        >
          <For
            each={filteredData()}
            fallback={
              <div class="font-weight:bold m:20px|0px p:3 text-align:center">
                No Component Found !
              </div>
            }
          >
            {(item) => (
              <>
                <div
                  class={
                    "font-size:17px font-weight:600 margin-bottom:8px margin-top:8px"
                  }
                >
                  {item.P.label || item.P.name}
                </div>
                <ul
                  class={
                    "display:grid gap:5px grid-template-columns:repeat(2,1fr) list-style-type:none"
                  }
                >
                  <For each={item.children}>
                    {(child) => <ComonentItem child={child} />}
                  </For>
                </ul>
              </>
            )}
          </For>
        </Show>
      </div>
    </>
  );
}
