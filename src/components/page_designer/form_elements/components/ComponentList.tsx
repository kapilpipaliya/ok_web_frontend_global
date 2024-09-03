import { createMemo, createSignal, For, onMount, Show } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { SearchBar } from "~/components/css_properties/SearchBar";
import { LoaderNew } from "~/components/LoaderSimple";
import { useToast } from "~/components/Toast";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { ComonentItem } from "./ComonentItem";
import { getCompChildren } from "./getCompChildren";

export function ComponentList() {
  const [graph, setGraph] = useGraph();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const { showErrorToast } = useToast();
  const [rootCompVertex, setRootCompVertex] = createSignal<Vertex>();
  const [expandedComponent, setExpandedComponent] = createSignal<Vertex>();

  // Fetch data function
  async function fetchData() {
    try {
      const expression = `g:'Comp[Root]'<-'ParentComp*'`;
      return await fetchAndSetGraphData(graph, setGraph, expression);
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
  // Create effect to handle data changes
  onMount(async () => {
    setIsFetchingData(true);
    const result = await fetchData();
    if ((result as { error: string })?.error) {
      showErrorToast((result as { error: string }).error);
    } else if ((result as ServerResult)?.result) {
      setGraphData(graph, setGraph, (result as ServerResult).graph);
      const rootVertex = findVertexByLabelAndUniqueId(
        graph,
        "Comp",
        "key",
        "Root",
      );
      if (rootVertex) {
        setRootCompVertex(rootVertex);
      } else {
        console.warn("No root vertex found in the result");
      }
    }
    setIsFetchingData(false);
  });

  // Filter children based on search query
  const filteredChildren = createMemo(() => {
    const children = getCompChildren(rootCompVertex()!, graph);
    const query = searchQuery().toLowerCase();
    return children.filter((child) =>
      ((child.P.label as string) || (child.P.key as string))
        .toLowerCase()
        .includes(query),
    );
  });

  return (
    <>
      <SearchBar
        handleChange={(value) => {
          setSearchQuery(value);
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
            each={filteredChildren()}
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
                    "font-weight:600 my:8px"
                  }
                >
                  <ComonentItem
                    child={item}
                    expandedComponent={expandedComponent()}
                    setExpandedComponent={setExpandedComponent}
                  />
                </div>
              </>
            )}
          </For>
        </Show>
      </div>
    </>
  );
}
