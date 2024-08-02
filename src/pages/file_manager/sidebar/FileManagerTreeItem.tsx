

import { For, Show, createSelector, createSignal, onMount } from "solid-js";

import { TreeItemContainer } from "~/components/page_designer/settings/layout/TreeItemContainer";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useFileManagerStore } from "../FileManagerContext";
import { FileManagerConfigIcons } from "./FileManagerConfigIcons";
import { FileManagerTreeItemContent } from "./FileManagerTreeItemContent";
import { getRootLevelData } from './getRootLevelData';


export function FileManagerTreeItem(props: { item: Vertex; }) {
  const [children, setChildren] = createSignal<Vertex[]>([]);
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();

  const toggleExpand = () => {
    setFileManagerStore('expandedKeys', keys => {
      const newKeys = [...keys];
      const index = newKeys.indexOf(props.item.id);
      if (index >= 0) {
        newKeys.splice(index, 1);
      } else {
        newKeys.push(props.item.id);
      }
      return newKeys;
    });
  };

  onMount(async () => {
    const data = await getRootLevelData(graph, setGraph, props.item);
    // @ts-expect-error ignore
    if (!data.error && data.result) {
      // @ts-expect-error ignore
      setChildren(data.result);
    }
  });
  // const children = createMemo(() =>
  //   sortVertexesByPosition(evaluate(jsep("->FileDirectory"), { graph, setGraph, vertexes: [props.item] }) || [])
  // );
  const isSelectedHoverId = createSelector(() => fileManagerStore.treeItemHoverId);
  const handleMouseOver = (e: MouseEvent) => {
    e.stopPropagation();
    setFileManagerStore("treeItemHoverId", props.item.id);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    e.stopPropagation();
    setFileManagerStore("treeItemHoverId", null);
  };
  return (
    <>
      <TreeItemContainer
        // draggable={true}
        hasChildren={!!children().length}
        isHovered={isSelectedHoverId(props.item.id)}
        onMouseEnter={handleMouseOver}
        onmouseleave={handleMouseLeave}
      >
        <FileManagerTreeItemContent
          hasChildren={!!children().length}
          item={props.item}
          toggleExpand={toggleExpand}
        />
        <Show when={fileManagerStore.root?.id !== props.item.id}>
          <FileManagerConfigIcons metaVertex={props.item} />
        </Show>
      </TreeItemContainer>
      <Show when={fileManagerStore.expandedKeys.includes(props.item.id)}>
        <ul class="pb:5 pl:8 pt:3">
          <For each={children()}>
            {(child) => <FileManagerTreeItem item={child} />}
          </For>
        </ul>
      </Show>
    </>
  );
}


