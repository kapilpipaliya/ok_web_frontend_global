import { createSignal, onCleanup, onMount, Show } from "solid-js";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revertTransactionUpToIndex";
import JsxParser from "~/lib/jsx_parser/components/JsxParser";

import { useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import {
  dialogCancelButtonClass,
  DialogFooter,
  dialogOkButtonClass,
} from "../../styled/dialog/DialogFooter";
import { DialogHeader } from "../../styled/dialog/DialogHeader";
import { DialogSubTitle } from "../../styled/dialog/DialogSubTitle";
import { addNewVertex, deleteVertex } from "~/lib/graph/mutate/vertex";

export function ImportMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave?: () => void;
    parentRef: HTMLElement;
  }>,
) {
  let nameInputRef: HTMLTextAreaElement;
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const [htmlContent, setHtmlContent] = createSignal("");
  const [error] = createSignal("");
  const prevTxnIndex = getLastTxnIndex(layoutStore.formStore[0].txnId, graph);

  const metaVertexId = graph.newVertexId();
  const dataVertexId = graph.newVertexId();

  addNewVertex(0, { id: dataVertexId, IN: {}, L: [], OUT: {}, P: {} }, graph, setGraph);

  onCleanup(() => {
    deleteVertex(0, metaVertexId, graph, setGraph);
    deleteVertex(0, dataVertexId, graph, setGraph);
  });

  const onImport = () => {
    const jsxParser = new JsxParser({
      formData: graph.vertexes[layoutStore.formStore[0].formDataId!],
      jsx: htmlContent(),
      parent: graph.vertexes[layoutStore.selectedId],
      showWarnings: true,
      txnId: layoutStore.formStore[0].txnId,
    });
    jsxParser.render(graph, setGraph);
  };
  const onCancel = () => {
    if (prevTxnIndex !== -1) {
      revertTransactionUpToIndex(
        layoutStore.formStore[0].txnId,
        prevTxnIndex,
        graph,
        setGraph,
      );
    }
    props.onClose();
  };

  onMount(() => {
    nameInputRef.focus();
  });

  return (
    <DropdownMenu
      class="padding:0.50rem"
      onClickOutside={props.onClose}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <DialogHeader title="Import HTML" />
      <DialogSubTitle>Import HTML to the page.</DialogSubTitle>

      <div>
        <label
          class="lh:1.25rem  color:gray-90 display:block f:0.875rem font-weight:500 leading:1.5rem"
          for="importHtml"
        >
          HTML
        </label>
        <div class="mt:2">
          <textarea
            class="lh:1.25rem@sm border-radius:0.375rem  border-width:0  box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus  color:gray-90 color:gray-40::placeholder display:block f:0.875rem leading:1.5rem@sm px:0.75rem py:0.375rem width:100%"
            id="importHtml"
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Paste HTML here"
            ref={nameInputRef!}
            value={htmlContent()}
          />
        </div>
      </div>
      <Show when={error()}>
        <div style={{ color: "red" }}>{error()}</div>
      </Show>

      <DialogFooter>
        <button
          class={dialogOkButtonClass}
          disabled={!htmlContent()}
          onClick={onImport}
          type="button"
        >
          Import
        </button>
        <button
          class={dialogCancelButtonClass}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </DialogFooter>
    </DropdownMenu>
  );
}
