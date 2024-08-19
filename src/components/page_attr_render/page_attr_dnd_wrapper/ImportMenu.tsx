import { createSignal, onCleanup, onMount, Show } from "solid-js";

import { useGraph, type Vertex } from "~/lib/graph/graph";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revertTransactionUpToIndex";
import JsxParser from "~/lib/jsx_parser/components/JsxParser";

import { DropdownMenu } from "../../DropdownMenu";
import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";

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

  const metaVertexId = graph.newVertexId;
  const dataVertexId = graph.newVertexId;

  setGraph("vertexes", dataVertexId, { id: dataVertexId, P: {} });

  onCleanup(() => {
    // @ts-expect-error ignore
    setGraph("vertexes", metaVertexId, undefined);
    // @ts-expect-error ignore
    setGraph("vertexes", dataVertexId, undefined);
  });

  const onImport = () => {
    const jsxParser = new JsxParser({
      formData: layoutStore.formStore[0].formData,
      jsx: htmlContent(),
      parent: graph.vertexes[layoutStore.selectedId],
      showWarnings: true,
      txnId: layoutStore.formStore[0].txnId,
    });
    jsxParser.render(graph, setGraph);
  };
  const onCancel = () => {
    if (prevTxnIndex !== -1) {
      revertTransactionUpToIndex(layoutStore.formStore[0].txnId, prevTxnIndex, graph);
    }
    props.onClose();
  }

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
      <h3 class="lh:1.5rem color:gray-90 f:1rem  font:bold leading:1.5rem">
        Import HTML
      </h3>

      <div class="lh:1.25rem color:gray-50  f:0.875rem max-width:36rem mt:0.5rem ">
        <p>
          Import HTML to the page.
        </p>
      </div>

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

      <div class="">
        <div class="flex ai:center jc:center mt:0.25rem">
          <button
            class="lh:1.25rem  align-items:center  bg:indigo-60  bg:indigo-50:hover  border-radius:0.375rem box-shadow:0|1px|2px|0|rgba(0,0,0,0.05) color:white display:inline-flex f:0.875rem  font:semibold  outline-color:indigo-50:focus-visible  outline-offset:2px:focus-visible outline-style:solid:focus-visible outline-width:2px:focus-visible px:0.75rem py:0.5rem"
            disabled={!htmlContent()}
            onClick={onImport}
            type="button">
            Import
          </button>
          <button class="" onClick={onCancel} type="button">
            Cancel
          </button>
        </div>
      </div>
    </DropdownMenu>
  );
}
