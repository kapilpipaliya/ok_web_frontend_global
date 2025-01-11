import { createSignal, onMount, Show } from "solid-js";

import { cloneLayoutAndChildren } from "~/components/page_designer/functions/cloneLayoutAndChildren";
import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { PageLayoutObject, useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { DialogFooter } from "../../styled/dialog/DialogFooter";
import { DialogHeader } from "../../styled/dialog/DialogHeader";
import { DialogSubTitle } from "../../styled/dialog/DialogSubTitle";
import { DropdownMenu } from "../../styled/DropdownMenu";
import { useToast } from "../../styled/Toast";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";

export function SaveAsTemplateMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
    saveAsLabel: "Template" | "Component";
  }>,
) {
  let nameInputRef: HTMLInputElement;
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const [templateName, setTemplateName] = createSignal("");
  const [error, setError] = createSignal("");
  const { showSuccessToast, showWarningToast } = useToast();
  const label = () => (props.saveAsLabel).replace(/Page$/, "");

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const saveTemplate = async () => {
    const newFormTxnId = generateNewTxnId(graph, setGraph);
    const createResult = createFormVertex(
      graph,
      setGraph,
      newFormTxnId,
      `${label()}Page`,
      { key: templateName() },
    );
    const dataVertex = createResult.vertex!;
    cloneLayoutAndChildren(
      props.item,
      dataVertex,
      newFormTxnId,
      formStoreVertex()?.P.txnId,
      graph,
      setGraph,
      graph.vertexes[formStoreVertex()?.P.formDataId!],
    );
    const data = commitTxn(newFormTxnId, graph);

    if (!data) {
      showWarningToast("Internal Server Error");
      return;
    }

    try {
      await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
      showSuccessToast(`${label()} Saved Successfully`);
      props.onClose();
    } catch (_error) {
      setError("An unexpected error occurred");
    }
  };

  const saveAsTemplate = async (key: string) => {
    const res = await checkUniqueConstrains({
      L: [`${props.saveAsLabel}`],
      P: { key },
    } as unknown as Vertex);
    if (res.error) {
      setError(res.message || "An error occurred");
      return;
    }
    saveTemplate();
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
      <DialogHeader title={`Save As ${label()}`} />

      <DialogSubTitle>
        {label()} key must be unique. If the key already exists, you will be
        prompted to change it.
      </DialogSubTitle>

      <div>
        <label
          class="lh:1.25rem  color:gray-90 display:block f:0.875rem font-weight:500 leading:1.5rem"
          for="templateName"
        >
          {label()} Name
        </label>
        <div class="mt:2">
          <input
            class="lh:1.25rem@sm border-radius:0.375rem  border-width:0  box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus  color:gray-90 color:gray-40::placeholder display:block f:0.875rem leading:1.5rem@sm px:0.75rem py:0.375rem width:100%"
            id="templateName"
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder={`New ${label()} Name`}
            ref={nameInputRef!}
            type="text"
            value={templateName()}
          />
        </div>
      </div>
      <Show when={error()}>
        <div style={{ color: "red" }}>{error()}</div>
      </Show>

      <DialogFooter
        disabled={!templateName()}
        onClick={() => saveAsTemplate(templateName())}
      />
    </DropdownMenu>
  );
}
