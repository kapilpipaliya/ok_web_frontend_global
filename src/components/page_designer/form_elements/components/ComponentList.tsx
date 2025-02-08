import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";

import { SearchBar } from "~/components/css_properties/StyleEditor/SearchBar";
import { LoaderNew } from "~/components/styled/LoaderSimple";
import { useToast } from "~/components/styled/Toast";
import { createAppState } from "~/createAppState";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { fetchAndSetGraphData } from "~/lib/graph/mutate/fetchAndSetGraphData";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";

import { ComponentItem } from "./ComonentItem";
import { getCompChildren } from "./getCompChildren";
import { STYLES } from "~/components/styled/constants/styles";

export function ComponentList(props: {
  edgeName: string;
  isFetchData?: boolean;
  onDoubleClick?: (fromVertex: Vertex) => void;
  rootExpression?: string;
  rootVertexes?: Vertex[];
}) {
  const [graph, setGraph] = useGraph();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isFetchingData, setIsFetchingData] = createSignal(false);
  const { showErrorToast } = useToast();
  const [rootCompVertex, setRootCompVertex] = createSignal<Vertex>();
  const [expandedKeys, setExpandedKeys] = createStore<string[]>([]);
  const [previewPageId, setPreviewPageId] = createSignal<Id | null>(null);
  const [previewGraph, setPreviewGraph] = createAppState();

  function toggleExpand(itemId: Id) {
    setExpandedKeys((prev) =>
      prev.includes(itemId)
        ? prev.filter((item) => item !== itemId)
        : [...prev, itemId],
    );
  }

  // Fetch data function
  async function fetchData() {
    try {
      // * allows the traversal to match a path of one or more ParentComp relationships, i.e., a variable-length path.
      const expression = `${props.rootExpression}<-'${props.edgeName}*'`;
      return await fetchAndSetGraphData(graph, setGraph, expression, undefined, {skipExisting: true});
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
      ((child.P.label as string) || (child.P.key as string) || "")
        .toLowerCase()
        .includes(query),
    ).sort((a, b) => (a.P.key as string || "").localeCompare(b.P.key as string || ""));
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
      <div class={`${STYLES.overflow}`}>
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
                  <ComponentItem
                    child={item}
                    edgeName={props.edgeName}
                    expandedKeys={expandedKeys}
                    onDoubleClick={props.onDoubleClick}
                    previewGraph={previewGraph}
                    previewPageId={previewPageId()}
                    setPreviewGraph={setPreviewGraph}
                    setPreviewPageId={setPreviewPageId}
                    toggleExpand={toggleExpand}
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
