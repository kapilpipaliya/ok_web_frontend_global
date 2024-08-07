import { useParams } from "@solidjs/router";
import { batch, onMount, Show } from "solid-js";

import { useGraph } from "~/lib/graph/graph";

import { useFileManagerStore } from "../FileManagerContext";
import { getFilesData } from "../sidebar/getFilesData";
import { FileManagerMainArea } from "./FileManagerMainArea";

export function FileManagerMainContent(props: Readonly<{ fileId?: string }>) {
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const [graph, setGraph] = useGraph();
  const params = useParams();

  onMount(async () => {
    const data = await getFilesData(
      graph,
      setGraph,
      params.folderId,
      props.fileId,
    );
    // @ts-expect-error ignore
    if (!data.error && data.result.length > 0) {
      batch(() => {
        // @ts-expect-error ignore
        setFileManagerStore("selectedItem", data.result[0]);
        // @ts-expect-error ignore
        setFileManagerStore("expandedKeys", [data.result[0].id]);
      });
    }
  });

  return (
    <div>
      <div>
        <Show keyed when={fileManagerStore.selectedItem?.id}>
          <FileManagerMainArea item={fileManagerStore.selectedItem!} />
        </Show>
      </div>
    </div>
  );
}
