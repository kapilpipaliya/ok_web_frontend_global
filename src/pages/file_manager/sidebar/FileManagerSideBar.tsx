import { batch, onMount, Show } from "solid-js";

import { useGraph } from "~/lib/graph/graph";

import { useFileManagerStore } from "../FileManagerContext";
import { FileManagerTreeItem } from "./FileManagerTreeItem";
import { getFilesData } from "./getFilesData";

export function Sidebar() {
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const [graph, setGraph] = useGraph();

  onMount(async () => {
    const data = await getFilesData(graph, setGraph);
    // @ts-expect-error ignore
    if (!data.error && data.result.length > 0) {
      batch(() => {
        // @ts-expect-error ignore
        setFileManagerStore("root", data.result[0]);
        // @ts-expect-error ignore
        setFileManagerStore("expandedKeys", [data.result[0].id]);
      });
    }
  });

  return (
    <div class="">
      <div>
        <Show when={fileManagerStore.root}>
          <FileManagerTreeItem item={fileManagerStore.root!} />
        </Show>
      </div>
    </div>
  );
}
