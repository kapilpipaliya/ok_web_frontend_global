import {
  Match,
  createEffect,
  createResource,
  createSignal,
  useContext,
  For,
  Switch,
} from "solid-js";
import { useToast } from "~/components/Toast";
import { PageConfigContext } from "~/lib/contexts";
import { GraphContext, type Id } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/setGraphData";
import { getTreeData, type NavItem } from "~/lib/graph/get/sync/traverse";
import { Icon } from "@iconify-icon/solid";
import { LoaderNew } from "~/components/LoaderSimple";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { getTreeDataMGCall } from "~/cypher/get/getTreeDataMGCall";
import { PageItemComponent } from "./PageItemComponent";

export function PagesPart(props: Readonly<{ coll: string }>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [pageConfig] = useContext(PageConfigContext) || [];
  const { showErrorToast } = useToast();
  let originalData: any[] = [];
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [filteredData, setFilteredData] = createSignal<NavItem[]>([]);
  const [previewPageId, setPreviewPageId] = createSignal<Id | null>(null);
  
  // Fetch data function
  async function fetchData(): Promise<{
    graph?: any;
    data?: any;
    error?: string;
  }> {
    try {
      const data = await getTreeDataMGCall({
        collection: paginationExpression({ coll: props.coll }),
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
      } else if (result?.graph) {
          if (result.graph.vertexes[pageConfig.formData.formData.id]) {
            delete result.graph.vertexes[pageConfig.formData.formData.id];
          }
          setGraphData(graph, setGraph, result.graph);

          const data2 = getTreeData(graph, setGraph, {
            collection: paginationExpression({ coll: props.coll }),
          }).filter((item) => item.id !== pageConfig.formData.formData.id);
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
          <nav class="bg:white p:5 position:sticky abs z:10">
            <div class="group">
              <Icon
                class="icon"
                icon="iconamoon:search"
                style={{ color: "#9e9ea7" }}
              />
              <input
                placeholder={`Search ${props.coll}...`}
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
            class="overflow:auto h:full grid"
            style={{
              "scrollbar-width": "thin",
              "scrollbar-color": "lightgrey",
            }}
          >
            <For
              each={filteredData()}
              fallback={
                <div class="p:3 m:20px|0px font-weight:bold text-align:center">
                  No {props.coll} Found!
                </div>
              }
            >
              {(item) => <PageItemComponent child={item} previewPageId={previewPageId()} setPreviewPageId={setPreviewPageId} />}
            </For>
          </div>
        </>
      </Match>
    </Switch>
  );
}

