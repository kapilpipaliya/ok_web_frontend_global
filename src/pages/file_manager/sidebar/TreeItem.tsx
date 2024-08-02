
import type { SetStoreFunction } from "solid-js/store";

import { For, Show, createSignal, onMount } from "solid-js";

import { TreeItemExpandButton } from "~/components/page_designer/settings/layout/TreeItemExpandButton";
import { type GraphInterface, type Vertex, useGraph } from "~/lib/graph/graph";

import { useFileManagerStore } from "../FileManagerContext";
import { getRootLevelData } from './getRootLevelData';

export const createNewDirectory = async (parent: Vertex, fileName: string, setGraph: SetStoreFunction<GraphInterface>) => {
  // Implementation of creating a new directory in the backend and updating the graph.
  // This is a placeholder function and needs to be implemented according to your backend logic.
  console.log(`Create new directory '${fileName}' under ${parent.id}`);
};

export function TreeItem(props: { item: Vertex; }) {
  const [children, setChildren] = createSignal<Vertex[]>([]);
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const [contextMenuVisible, setContextMenuVisible] = createSignal(false);
  const [newFileName, setNewFileName] = createSignal("");

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

  const handleDoubleClick = () => {
    setFileManagerStore('selectedItem', props.item);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenuVisible(true);
  };

  const handleContextMenuSubmit = async () => {
    await createNewDirectory(props.item, newFileName(), setGraph);
    setContextMenuVisible(false);
    setNewFileName("");
  };

  const handleContextMenuClose = () => {
    setContextMenuVisible(false);
    setNewFileName("");
  };

  onMount(async () => {
    if (fileManagerStore.expandedKeys.includes(props.item.id)) {
      const data = await getRootLevelData(graph, setGraph, props.item);
      // @ts-expect-error ignore
      if (!data.error && data.result.length > 0) {
        // @ts-expect-error ignore
        setChildren(data.result);
      }
    }
  });
  // const children = createMemo(() =>
  //   sortVertexesByPosition(evaluate(jsep("->FileDirectory"), { graph, setGraph, vertexes: [props.item] }) || [])
  // );

  return (
    <div class="position:relative">
      <div
        class="cursor:pointer p:2"
        onClick={toggleExpand}
        onContextMenu={handleContextMenu}
        onDblClick={handleDoubleClick}
      >
        <TreeItemExpandButton
          hasChildren={!!children().length}
          isCollapsed={!fileManagerStore.expandedKeys.includes(props.item.id)}
          metaVertexId={props.item.id}
          toggleExpand={toggleExpand}
        />
        {props.item.P.name}
      </div>
      <Show when={fileManagerStore.expandedKeys.includes(props.item.id)}>
        <div class="pl:4">
          <For each={children()}>
            {(child) => <TreeItem item={child} />}
          </For>
        </div>
      </Show>
      <Show when={contextMenuVisible()}>
        <div class="absolute border bg:white left:0 p:2 top:0 z:10">
          <input
            class="border mb:2 p:1"
            onInput={(e) => setNewFileName(e.currentTarget.value)}
            placeholder="New Directory Name"
            type="text"
            value={newFileName()} />
          <button class="bg:blue-50 color:white p:1" onClick={handleContextMenuSubmit}>
            Create
          </button>
          <button class="bg:gray-50 color:white ml:2 p:1" onClick={handleContextMenuClose}>
            Cancel
          </button>
        </div>
      </Show>
    </div>
  );
}
