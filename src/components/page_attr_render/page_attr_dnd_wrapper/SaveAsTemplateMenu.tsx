import { Show, createSignal, onMount } from "solid-js";

import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { DropdownMenu } from "../../DropdownMenu";
import { useToast } from "../../Toast";
import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";

export function SaveAsTemplateMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
  }>,
) {
  let nameInputRef: HTMLInputElement;
  const [layoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const [templateName, setTemplateName] = createSignal("");
  const [error, setError] = createSignal("");
  const { showSuccessToast, showWarningToast } = useToast();

  const saveTemplate = async () => {
    const newFormTxnId = graph.newTxnId;
    const createResult = createForm(
      graph,
      setGraph,
      newFormTxnId,
      "TemplatePage",
      { name: templateName() },
    );
    const dataVertex = createResult.vertex!;
    cloneLayoutAndChildren(
      props.item,
      dataVertex,
      newFormTxnId,
      layoutStore.formData.txnId,
      graph,
      setGraph,
      layoutStore.formData.formData,
    );
    const data = commitTxn(newFormTxnId, graph);

    if (!data) {
      showWarningToast("Internal Server Error");
      return;
    }

    try {
      await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
      showSuccessToast("Template Saved Successfully");
      props.onClose();
    } catch (error) {
      setError("An unexpected error occurred");
    }
  };

  const saveAsTemplate = async (name: string) => {
    const res = await checkUniqueConstrains({ L: ["TemplatePage"], P: { name } } as unknown as Vertex);
    if (res.error) {
      setError(res.message);
      return;
    }
    saveTemplate();
  };

  onMount(() => {
    nameInputRef.focus();
  });

  return (
    <DropdownMenu class="padding:0.50rem" onMouseLeave={props.onMouseLeave} parentRef={props.parentRef}>
      <h3 class="lh:1.5rem color:gray-90 f:1rem  font:bold leading:1.5rem">Save As Template</h3>

      <div class="lh:1.25rem color:gray-50  f:0.875rem max-width:36rem mt:0.5rem ">
        <p>Template name must be unique. If the name already exists, you will be prompted to change it.</p>
      </div>

      <div>
        <label class="lh:1.25rem  color:gray-90 display:block f:0.875rem font-weight:500 leading:1.5rem" for="templateName">
          Template Name
        </label>
        <div class="mt:2">
          <input
            class="lh:1.25rem@sm border-radius:0.375rem  border-width:0  box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus  color:gray-90 color:gray-40::placeholder display:block f:0.875rem leading:1.5rem@sm px:0.75rem py:0.375rem width:100%"
            id="templateName" onChange={(e) => setTemplateName(e.target.value)}
            placeholder="New Template Name"
            ref={nameInputRef!}
            type="text"
            value={templateName()}
          />
        </div>
      </div>
      <Show when={error()}>
        <div style={{ color: "red" }}>{error()}</div>
      </Show>

      <div class="mt:0.25rem">
        <button
          class="lh:1.25rem  align-items:center  bg:indigo-60  bg:indigo-50:hover  border-radius:0.375rem box-shadow:0|1px|2px|0|rgba(0,0,0,0.05) color:white display:inline-flex f:0.875rem  font:semibold  outline-color:indigo-50:focus-visible  outline-offset:2px:focus-visible outline-style:solid:focus-visible outline-width:2px:focus-visible px:0.75rem py:0.5rem"
          disabled={!templateName()}
          onClick={() => saveAsTemplate(templateName())}
          type="button"
        >
          Save
        </button>
      </div>

    </DropdownMenu>
  );
}
