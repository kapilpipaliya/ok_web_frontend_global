import { createSignal, onMount, Show } from "solid-js";

import {
  dialogCancelButtonClass,
  DialogFooter,
  dialogOkButtonClass,
} from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { useToast } from "~/components/styled/Toast";
import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { parentCompAttribute } from "~/lib/meta/base/Comp";

import { useFileManagerStore } from "../FileManagerContext";

export function SaveNewComp(
  props: Readonly<{
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
  }>,
) {
  let nameInputRef: HTMLInputElement;
  const [graph, setGraph] = useGraph();
  const [fileManagerStore] = useFileManagerStore();

  const [componentName, setComponentName] = createSignal("");
  const [error, setError] = createSignal("");
  const { showErrorToast, showSuccessToast } = useToast();

  const saveComponent = async () => {
    const currentItem = fileManagerStore.selectedItem;

    const newFormTxnId = graph.newTxnId();

    const createResult = createFormVertex(graph, setGraph, newFormTxnId, "Comp", {
      key: componentName(),
    });
    const dataVertex = createResult.vertex!;

    const parentFolderMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: parentCompAttribute,
    } as Vertex;

    setSelectionValue(
      newFormTxnId,
      dataVertex,
      graph,
      setGraph,
      parentFolderMetaVertex,
      currentItem!.id,
    );

    const commitData = commitTxn(newFormTxnId, graph);

    if (!commitData) {
      showErrorToast("Failed to upload file");
      return;
    }

    try {
      await submitDataCall({ ...commitData }, graph, setGraph, newFormTxnId);
    } catch (_error: any) {
      showErrorToast("An error occurred while uploading the file");
      return;
    }
    showSuccessToast("File uploaded successfully");
  };

  const saveAsTemplate = async (key: string) => {
    const res = await checkUniqueConstrains({
      L: ["TemplatePage"],
      P: { key },
    } as unknown as Vertex);
    if (res.error) {
      setError(res.message);
      return;
    }
    saveComponent();
  };

  onMount(() => {
    nameInputRef.focus();
  });

  return (
    <DropdownMenu
      class="padding:0.50rem"
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <DialogHeader title="New Component" />
      <DialogSubTitle>
        Component key must be unique. If the key already exists, you will be
        prompted to change it.
      </DialogSubTitle>

      <div>
        <label
          class="lh:1.25rem  color:gray-90 display:block f:0.875rem font-weight:500 leading:1.5rem"
          for="templateName"
        >
          Component Name
        </label>
        <div class="mt:2">
          <input
            class="lh:1.25rem@sm border-radius:0.375rem  border-width:0  box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus  color:gray-90 color:gray-40::placeholder display:block f:0.875rem leading:1.5rem@sm px:0.75rem py:0.375rem width:100%"
            id="templateName"
            onChange={(e) => setComponentName(e.target.value)}
            placeholder="New Component Name"
            ref={nameInputRef!}
            type="text"
            value={componentName()}
          />
        </div>
      </div>
      <Show when={error()}>
        <div style={{ color: "red" }}>{error()}</div>
      </Show>

      <DialogFooter>
        <button
          class={dialogOkButtonClass}
          disabled={!componentName()}
          onClick={() => saveAsTemplate(componentName())}
          type="button"
        >
          Save
        </button>
        <button
          class={dialogCancelButtonClass}
          onClick={props.onClose}
          type="button"
        >
          Cancel
        </button>
      </DialogFooter>
    </DropdownMenu>
  );
}
