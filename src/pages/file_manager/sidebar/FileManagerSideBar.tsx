import { Show } from "solid-js";

import { useFileManagerStore } from "../FileManagerContext";
import { FileManagerTreeItem } from "./FileManagerTreeItem";

export function Sidebar() {
  const [fileManagerStore] = useFileManagerStore();
  return (
    <div>
      <Show when={fileManagerStore.root}>
        <FileManagerTreeItem item={fileManagerStore.root!} />
      </Show>
    </div>
  );
}
