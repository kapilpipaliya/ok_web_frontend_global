import { Show, createSignal, onMount, useContext } from "solid-js";

import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { submitDataCall } from "~/lib/api/api_functions";
import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { DropdownMenu } from "../../DropdownMenu";
import { useToast } from "../../Toast";
import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";

export function SaveAsTemplateMenu(props: Readonly<{ item: Vertex; onClose: () => void; onMouseLeave: () => void; parentRef: HTMLElement; }>) {
  let nameInputRef: HTMLInputElement;
  const [layoutStore] = useDesignerLayoutStore();
  const [graph, setGraph] = useContext(GraphContext)!;
  const [templateName, setTemplateName] = createSignal("");
  const [error, setError] = createSignal("");
  const { showSuccessToast, showWarningToast } = useToast();

  const saveTemplate = async () => {
    const newFormTxnId = graph.newTxnId;
    const createResult = createForm(graph, setGraph, newFormTxnId, "TemplatePage", { name: templateName() });
    const dataVertex = createResult.vertex!;
    cloneLayoutAndChildren(props.item, dataVertex, newFormTxnId, layoutStore.formData.txnId, graph, setGraph, layoutStore.formData.formData);
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
    const res = await checkIfNameExistsMGCall("TemplatePage", name);
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
    <DropdownMenu onMouseLeave={props.onMouseLeave} parentRef={props.parentRef}>
      Save As Template
      <input onChange={(e) => setTemplateName(e.target.value)} ref={nameInputRef!} type="text" value={templateName()} />
      <Show when={error()}>
        <div style={{ color: 'red' }}>{error()}</div>
      </Show>
      <button disabled={!templateName()} onClick={() => saveAsTemplate(templateName())} type="button">Save</button>
    </DropdownMenu>
  );
}
