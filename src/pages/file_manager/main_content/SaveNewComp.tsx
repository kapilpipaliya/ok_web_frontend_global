import { createSignal, onMount, Show } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { useToast } from "~/components/Toast";
import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { createForm } from "~/lib/graph/mutate/form/createForm";
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

    const newFormTxnId = graph.newTxnId;

    const createResult = createForm(graph, setGraph, newFormTxnId, "Comp", {
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
      <h3 class="lh:1.5rem color:gray-90 f:1rem  font:bold leading:1.5rem">
        New Component
      </h3>

      <div class="lh:1.25rem color:gray-50  f:0.875rem max-width:36rem mt:0.5rem ">
        <p>
          Component key must be unique. If the key already exists, you will be
          prompted to change it.
        </p>
      </div>

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

      <div class="mt:0.25rem">
        <button
          class="lh:1.25rem  align-items:center  bg:indigo-60  bg:indigo-50:hover  border-radius:0.375rem box-shadow:0|1px|2px|0|rgba(0,0,0,0.05) color:white display:inline-flex f:0.875rem  font:semibold  outline-color:indigo-50:focus-visible  outline-offset:2px:focus-visible outline-style:solid:focus-visible outline-width:2px:focus-visible px:0.75rem py:0.5rem"
          disabled={!componentName()}
          onClick={() => saveAsTemplate(componentName())}
          type="button"
        >
          Save
        </button>
      </div>
    </DropdownMenu>
  );
}
