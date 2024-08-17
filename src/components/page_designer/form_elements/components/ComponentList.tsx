import jsep from "jsep";
import {
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { SearchBar } from "~/components/css_properties/SearchBar";
import { LoaderNew } from "~/components/LoaderSimple";
import { useToast } from "~/components/Toast";
import { evaluate } from "~/lib/expression_eval";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { ComonentItem } from "./ComonentItem";

export function ComponentList() {
  const [graph, setGraph] = useGraph();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isFetchingData, setIsFetchingData] = createSignal(true);
  const { showErrorToast } = useToast();
  const [rootCompVertex, setRootCompVertex] = createSignal<Vertex>();

  // Fetch data function
  async function fetchData() {
    try {
      const expression = `g:'Comp[root]'<-'ParentComp*'`;
      return await fetchAndSetGraphData(graph, setGraph, expression);
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
  // Create effect to handle data changes
  onMount(async () => {
    setIsFetchingData(true);
    const result = await fetchData();
    if ((result as {error: string})?.error) {
      showErrorToast((result as {error: string}).error);
    } else if ((result as ServerResult)?.result) {
      setGraphData(graph, setGraph, (result as ServerResult).graph);
      const rootVertex = findVertexByLabelAndUniqueId(graph, 'Comp', 'name', 'root');
      if (rootVertex) {
        setRootCompVertex(rootVertex);
      } else {
        console.warn("No root vertex found in the result");
      }
    }
    setIsFetchingData(false);
  });


  const getChildren = (vertex: Vertex) => {
    if (!vertex) { return []; }
    const children: Vertex[] =
      evaluate(jsep("<-ParentComp"), { graph, setGraph, vertexes: [vertex] }) || [];
    return children;
  };

  // Filter children based on search query
  const filteredChildren = createMemo(() => {
    const children = getChildren(rootCompVertex()!);
    const query = searchQuery().toLowerCase();
    return children.filter(child => 
      (child.P.label as string || child.P.name as string).toLowerCase().includes(query)
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
                    "font-size:17px font-weight:600 margin-bottom:8px margin-top:8px"
                  }
                >
                  <ComonentItem child={item} />
                </div>
              </>
            )}
          </For>
        </Show>
      </div>
    </>
  );
}
