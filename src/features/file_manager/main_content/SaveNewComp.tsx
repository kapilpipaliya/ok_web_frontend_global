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
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { parentCompAttribute, parentPermAttribute } from "~/lib/meta/base/Comp";

import { useFileManagerStore } from "../FileManagerContext";

export function SaveNewComp(
  props: Readonly<{
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
    saveAsLabel?: "Comp" | "Perm";
  }>,
) {
  let nameInputRef!: HTMLInputElement;
  let descriptionInputRef!: HTMLInputElement;
  const [graph, setGraph] = useGraph();
  const [fileManagerStore] = useFileManagerStore();

  const [componentName, setComponentName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [error, setError] = createSignal("");
  const { showErrorToast, showSuccessToast } = useToast();

  const label = () => props.saveAsLabel === "Perm" ? "Permission" : "Component";

  const saveComponent = async () => {
    const currentItem = fileManagerStore.selectedItem;

    const newFormTxnId = generateNewTxnId(graph, setGraph);

    const createResult = createFormVertex(
      graph,
      setGraph,
      newFormTxnId,
      props.saveAsLabel || "Comp",
      {
        key: componentName(),
        ...(props.saveAsLabel === "Perm" ? { description: description() } : {}),
      },
    );
    const dataVertex = createResult.vertex!;

    const parentFolderMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: props.saveAsLabel === "Perm" ? parentPermAttribute : parentCompAttribute,
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
      showErrorToast(`Failed to upload ${label()}`);
      return;
    }

    try {
      const result = await submitDataCall({ ...commitData }, graph, setGraph, newFormTxnId);
      if (!result.error) {
        fileManagerStore.gridStore?.[0].fetchTableData();
      }
    } catch (error) {
      showErrorToast(`An error occurred while uploading the ${label()}`);
      return;
    }
    showSuccessToast(`${label()} uploaded successfully`);
  };

  const saveAsTemplate = async (key: string) => {
    if (!componentName()) {
      setError("Please enter a name");
      return;
    }
    const res = await checkUniqueConstrains({
      L: [props.saveAsLabel || "Comp"],
      P: { key },
    } as unknown as Vertex);
    if (res.error) {
      setError(res.error);
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
      <DialogHeader title={`New ${label()}`} />
      <DialogSubTitle>
        {label()} key must be unique. If the key already exists, you will be
        prompted to change it.
      </DialogSubTitle>

      <div class="flex flex:column gap:.5rem">
        <div>
          <label
            class="lh:1.25rem color:gray-90 display:block f:0.875rem font-weight:500 leading:1.5rem"
            for="templateName"
          >
            {label()} Name
          </label>
          <div class="mt:2">
            <input
              class="lh:1.25rem@sm border-radius:0.375rem border-width:0 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:gray-90 color:gray-40::placeholder display:block f:0.875rem leading:1.5rem@sm px:0.75rem py:0.375rem width:100%"
              id="templateName"
              onChange={(e) => setComponentName(e.target.value)}
              placeholder={`New ${label()} Name`}
              ref={nameInputRef}
              type="text"
              value={componentName()}
            />
          </div>
        </div>
        <div>
          <label
            class="lh:1.25rem color:gray-90 display:block f:0.875rem font-weight:500 leading:1.5rem"
            for="description"
          >
            Description
          </label>
          <div class="mt:2">
            <input
              class="lh:1.25rem@sm border-radius:0.375rem border-width:0 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:gray-90 color:gray-40::placeholder display:block f:0.875rem leading:1.5rem@sm px:0.75rem py:0.375rem width:100%"
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Permission description"
              ref={descriptionInputRef}
              type="text"
              value={description()}
            />
          </div>
        </div>
      </div>

      <Show when={error()}>
        <div class="fg:error">{error()}</div>
      </Show>

      <DialogFooter>
        <button
          class={dialogOkButtonClass}
          // disabled={!componentName()}
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
