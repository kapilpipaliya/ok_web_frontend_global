
import {
  For,
  Match,
  Switch,
  createEffect,
  createResource,
  createSignal,
  
} from "solid-js";

import type { NavItem } from "~/lib/graph/get/sync/traverse";

import { LoaderNew } from "~/components/LoaderSimple";
import { useToast } from "~/components/Toast";
import { SearchBar } from "~/components/css_properties/SearchBar";
import { getTreeDataMGCall } from "~/cypher/get/getTreeDataMGCall";
import { getTreeData } from "~/lib/graph/get/sync/getTreeData";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { type Id, useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { PageItem } from "./PageItem";

export function PagesList(props: Readonly<{ coll: string }>) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore() || [];
  const { showErrorToast } = useToast();
  let originalData: any[] = [];
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal<NavItem[]>([]);
  const [previewPageId, setPreviewPageId] = createSignal<Id | null>(null);
  
  // Fetch data function
  async function fetchData(): Promise<{
    data?: any;
    error?: string;
    graph?: any;
  }> {
    try {
      const data = await getTreeDataMGCall({
        collection: paginationExpression({ coll: props.coll }),
      });
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
          if (result.graph.vertexes[layoutStore.formData.formData.id]) {
            delete result.graph.vertexes[layoutStore.formData.formData.id];
          }
          setGraphData(graph, setGraph, result.graph);

          const data2 = getTreeData(graph, setGraph, {
            collection: paginationExpression({ coll: props.coll }),
          }).filter((item) => item.id !== layoutStore.formData.formData.id);
          originalData = data2;
          setFilteredData(data2);
          setIsFetchingData(false);
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

  return (
    <Switch fallback={<LoaderNew loaderHeight="55vh" />}>
      <Match when={data.error}>Error: {data.error}</Match>
      <Match when={!isFetchingData()}>
        <>
          <SearchBar handleChange={(value) => {
            setSearchQuery(value);
            updateFilteredData();
          }} placeholder={`Search ${props.coll}...`} value={searchQuery()}/>
          <div
            class="scrollbar-color:lightgrey scrollbar-width:thin grid h:full overflow:auto"
          >
            <For
              each={filteredData()}
              fallback={
                <div class="font-weight:bold m:20px|0px p:3 text-align:center">
                  No {props.coll} Found!
                </div>
              }
            >
              {(item) => <PageItem child={item} previewPageId={previewPageId()} setPreviewPageId={setPreviewPageId} />}
            </For>
          </div>
        </>
      </Match>
    </Switch>
  );
}

