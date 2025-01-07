import {
  createEffect,
  createResource,
  createSignal,
  For,
  Match,
  Switch,
} from "solid-js";

import { SearchBar } from "~/components/css_properties/StyleEditor/SearchBar";
import { LoaderNew } from "~/components/styled/LoaderSimple";
import { useToast } from "~/components/styled/Toast";
import { getTreeDataMGCall } from "~/cypher/get/client/getTreeDataMGCall";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { PageLayoutObject } from "../../context/LayoutContext";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { getTreeData, type NavItem } from "../getTreeData";
import { PageItem } from "./PageItem";

export function PagesList(props: Readonly<{ coll: string }>) {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const { showErrorToast } = useToast();
  let originalData: any[] = [];
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal<NavItem[]>([]);
  const [previewPageId, setPreviewPageId] = createSignal<Id | null>(null);

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  // Fetch data function
  async function fetchData(): Promise<{
    data?: any;
    error?: string;
    graph?: any;
  }> {
    try {
      const data = await getTreeDataMGCall({
        collection: `g:'${props.coll}'`,
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
        if (result.graph.vertexes[formStoreVertex().P.formDataId!]) {
          delete result.graph.vertexes[formStoreVertex().P.formDataId!];
        }
        setGraphData(graph, setGraph, result.graph);

        const data2 = getTreeData(graph, setGraph, {
          collection: `g:'${props.coll}'`,
        }).filter((item) => item.id !== formStoreVertex().P.formDataId!);
        originalData = data2;
        setFilteredData(data2);
        setIsFetchingData(false);
      }
    }
  });

  // Update filtered data based on search query
  const updateFilteredData = () => {
    if (searchQuery()) {
      const filtered = originalData.filter((item) =>
        item.key?.toLowerCase().includes(searchQuery().toLowerCase()),
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(originalData);
    }
  };

  return (
    <Switch fallback={<LoaderNew loaderHeight="55vh" />}>
      <Match when={data.error}>Error: {data.error}</Match>
      <Match when={!isFetchingData()}>
        <>
          <SearchBar
            handleChange={(value) => {
              setSearchQuery(value);
              updateFilteredData();
            }}
            placeholder={`Search ${props.coll}...`}
            value={searchQuery()}
          />
          <div class="scrollbar-color:lightgrey grid {scrollbar-width:thin} overflow:auto">
            <For
              each={filteredData()}
              fallback={
                <div class="font-weight:bold m:20px|0px p:3 text-align:center">
                  No {props.coll} Found!
                </div>
              }
            >
              {(item) => (
                <PageItem
                  child={item}
                  previewPageId={previewPageId()}
                  setPreviewPageId={setPreviewPageId}
                />
              )}
            </For>
          </div>
        </>
      </Match>
    </Switch>
  );
}
