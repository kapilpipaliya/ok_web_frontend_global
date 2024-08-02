import { For, Show, batch, createEffect, createSignal, onMount } from "solid-js";

import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useFileManagerStore } from "../FileManagerContext";
import { getRootLevelData } from "../sidebar/getRootLevelData";

export function FileManagerMainArea(props: { item: Vertex }) {
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const [graph, setGraph] = useGraph();
  const [children, setChildren] = createSignal<Vertex[]>([]);

  const fetchChildren = async (item: Vertex) => {
    const data = await getRootLevelData(graph, setGraph, item);
    // @ts-expect-error ignore
    if (!data.error && data.result) {
      // @ts-expect-error ignore
      setChildren(data.result);
    }
  }
  createEffect(() => fetchChildren(props.item));
  return (
    <div class="">
      {props.item.P.name}
      <div>
        <For each={children()}>
          {(child) => <div>{child.P.name}</div>}
        </For>
      </div>
    </div>
  );
}

export function MainContent() {
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const [graph, setGraph] = useGraph();

  onMount(async () => {
    const data = await getRootLevelData(graph, setGraph);
    // @ts-expect-error ignore
    if (!data.error && data.result.length > 0) {
      batch(() => {
        // @ts-expect-error ignore
        setFileManagerStore('selectedItem', data.result[0]);
        // @ts-expect-error ignore
        setFileManagerStore('expandedKeys', [data.result[0].id]);
      })
    }
  });

  return (
    <div>
      <div>
        <Show keyed when={fileManagerStore.selectedItem}>
          <FileManagerMainArea item={fileManagerStore.selectedItem!} />
        </Show>
      </div>
    </div>
  );
}
