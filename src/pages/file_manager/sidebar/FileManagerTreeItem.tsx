

import { For, Show, createSelector, createSignal, onMount } from "solid-js";

import { TreeItemContainer } from "~/components/page_designer/settings/layout/TreeItemContainer";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useFileManagerStore } from "../FileManagerContext";
import { FileManagerConfigIcons } from "./FileManagerConfigIcons";
import { FileManagerTreeItemContent } from "./FileManagerTreeItemContent";
import { getFilesData } from './getFilesData';


export function FileManagerTreeItem(props: Readonly<{ item: Vertex; }>) {
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
  const getChildrenItems = async () => {
    const data = await getFilesData(graph, setGraph, props.item.id);
    // @ts-expect-error ignore
    if (!data.error && data.result) {
      // @ts-expect-error ignore
      setChildren(data.result);
    }
  }

  onMount(getChildrenItems);

  // const children = createMemo(() =>
  //   sortVertexesByPosition(evaluate(jsep("<-ParentFolder"), { graph, setGraph, vertexes: [props.item] }) || [])
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
        <FileManagerConfigIcons getChildrenItems={getChildrenItems} metaVertex={props.item} />
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


