import {
  createEffect,
  createResource,
  createSignal,
  For,
  Match,
  Switch,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { LoaderNew } from "~/components/styled/LoaderSimple";
import { useToast } from "~/components/styled/Toast";
import { createAppState } from "~/createAppState";
import { getTreeDataAPICall } from "~/cypher/get/getTreeDataAPICall";
import { SearchBar } from "~/features/css_editor/StyleEditor/SearchBar";
import { GetInitialData } from "~/GetInitialData";
import { GraphContext, useGraph } from "~/lib/graph/GraphContext";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { STYLES } from "~/pages/settings/constants";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { getTreeData, type NavItem } from "../getTreeData";
import { PageItem } from "./PageItem";

export function PagesList(props: Readonly<{ coll: string }>) {
  const [graph, setGraph] = useGraph();
  const { showErrorToast } = useToast();
  let originalData: any[] = [];
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal<NavItem[]>([]);
  const [previewPageId, setPreviewPageId] = createSignal<Id | null>(null);
  const [previewGraph, setPreviewGraph] = createAppState();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  // Fetch data function
  async function fetchData(): Promise<{
    data?: any;
    error?: string;
    graph?: any;
  }> {
    try {
      const data = await getTreeDataAPICall({
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
        if (result.graph.vertexes[formStoreVertex()?.P.formDataId!]) {
          delete result.graph.vertexes[formStoreVertex()?.P.formDataId!];
        }
        setGraphData(graph, setGraph, result.graph);

        const data2 = getTreeData(graph, setGraph, {
          collection: `g:'${props.coll}'`,
        }).filter((item) => item.id !== formStoreVertex()?.P.formDataId!);
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
    <>
      <Switch fallback={<LoaderNew loaderHeight="55vh" />}>
        <Match when={data.error}>Error: {data.error}</Match>
        <Match when={!isFetchingData()}>
          <>
            <GraphContext.Provider value={[previewGraph, setPreviewGraph]}>
              <GetInitialData />
            </GraphContext.Provider>

            <SearchBar
              handleChange={(value) => {
                setSearchQuery(value);
                updateFilteredData();
              }}
              placeholder={`Search ${props.coll}...`}
              value={searchQuery()}
            />
            <div class={`${STYLES.overflow} grid `}>
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
                    previewGraph={previewGraph}
                    previewPageId={previewPageId()}
                    setPreviewGraph={setPreviewGraph}
                    setPreviewPageId={setPreviewPageId}
                  />
                )}
              </For>
            </div>
          </>
        </Match>
      </Switch>
    </>
  );
}
