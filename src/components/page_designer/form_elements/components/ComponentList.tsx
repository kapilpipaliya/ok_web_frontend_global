import { createMemo, createSignal, For, onMount, Show } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { SearchBar } from "~/components/css_properties/StyleEditor/SearchBar";
import { LoaderNew } from "~/components/styled/LoaderSimple";
import { useToast } from "~/components/styled/Toast";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { ComonentItem } from "./ComonentItem";
import { getCompChildren } from "./getCompChildren";

export function ComponentList(props: {
  onDoubleClick?: (fromVertex: Vertex) => void;
  rootExpression?: string;
  edgeName: string;
  rootVertexes?: Vertex[];
  isFetchData?: boolean;
}) {
  const [graph, setGraph] = useGraph();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isFetchingData, setIsFetchingData] = createSignal(false);
  const { showErrorToast } = useToast();
  const [rootCompVertex, setRootCompVertex] = createSignal<Vertex>();
  const [expandedComponent, setExpandedComponent] = createSignal<Vertex>();

  // Fetch data function
  async function fetchData() {
    try {
      // * allows the traversal to match a path of one or more ParentComp relationships, i.e., a variable-length path.
      const expression = `${props.rootExpression}<-'${props.edgeName}*'`;
      return await fetchAndSetGraphData(graph, setGraph, expression);
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
  // Create effect to handle data changes
  onMount(async () => {
    if (!(props.isFetchData ?? true)) {
      return;
    }
    setIsFetchingData(true);
    const result = await fetchData();
    if ((result as { error: string })?.error) {
      showErrorToast((result as { error: string }).error);
    } else if ((result as ServerResult)?.result) {
      if (props.rootExpression?.startsWith("g:")) {
        setGraphData(graph, setGraph, (result as ServerResult).graph!);
        const [label, key] = props.rootExpression!
          .match(/g:'(\w+)\[(\w+)\]'/)!
          .slice(1);
        const rootVertex = findVertexByLabelAndUniqueId(
          graph,
          label, // Comp
          "key",
          key, // Root
        );
        if (rootVertex) {
          setRootCompVertex(rootVertex);
        } else {
          console.warn("No root vertex found in the result");
        }
      }
    }
    setIsFetchingData(false);
  });

  // Filter children based on search query
  const filteredChildren = createMemo(() => {
    const children = props.rootVertexes || (rootCompVertex() ? getCompChildren([rootCompVertex()!], props.edgeName, graph) : []);
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
        ref={el => props.onDoubleClick && setTimeout(() => el?.focus(), 0)}
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
                <div class={"font-weight:600 my:8px"}>
                  <ComonentItem
                    child={item}
                    expandedComponent={expandedComponent()}
                    onDoubleClick={props.onDoubleClick}
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
