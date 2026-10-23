import { createSignal, onCleanup, onSettled } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { FloatingFormDropdown } from "~/components/styled/dialog/FloatingFormDropdown";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { generateNewVertexId } from "~/lib/graph/mutate/core/generateNewVertexId";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revert/revertTransactionUpToIndex";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";
import JsxParser from "~/lib/jsx_parser/components/JsxParser";
import { As } from "~/components/As";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function ImportMenu(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave?: () => void;
    parentRef: HTMLElement;
  }>,
) {
  let nameInputRef!: HTMLTextAreaElement;
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const [htmlContent, setHtmlContent] = createSignal("");
  const prevTxnIndex = getLastTxnIndex(formStoreVertex()?.P.txnId, graph);

  const metaVertexId = generateNewVertexId(graph, setGraph);
  const dataVertexId = generateNewVertexId(graph, setGraph);

  addNewVertex(
    0,
    { id: dataVertexId, IN: {}, L: [], OUT: {}, P: {} },
    graph,
    setGraph,
  );

  onCleanup(() => {
    deleteVertex(0, metaVertexId, graph, setGraph);
    deleteVertex(0, dataVertexId, graph, setGraph);
  });

  const onImport = () => {
    const jsxParser = new JsxParser({
      formData: graph.vertexes[formStoreVertex()?.P.formDataId!],
      jsx: htmlContent(),
      parent: graph.vertexes[formStoreVertex()?.P.selectedId],
      showWarnings: true,
      txnId: formStoreVertex()?.P.txnId,
    });
    jsxParser.render(graph, setGraph);
    props.onClose();
  };

  const onCancel = () => {
    if (prevTxnIndex !== -1) {
      revertTransactionUpToIndex(
        formStoreVertex()?.P.txnId,
        prevTxnIndex,
        graph,
        setGraph,
      );
    }
    props.onClose();
  };

  onSettled(() => {
    nameInputRef.focus();
  });

  return (
    <FloatingFormDropdown
      footerButtonText="Import"
      footerDisabled={!htmlContent().trim()}
      onClickOutside={onCancel}
      onFooterClick={onImport}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
      subtitle="Import HTML to the page."
      title="Import HTML"
    >
      <div>
        <As
          as="label"
          css={`return \`._id {
  color: \${t.var.color.primary};
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
}\`;`}
          for="importHtml"
        >
          HTML
        </As>
        <As
          as="div"
          css={`return \`._id {
  margin-top: 2px;
}\`;`}
        >
          <As
            as="textarea"
            css={`return \`._id {
  border-radius: 0.375rem;
  border-width: 0;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
  color: \${t.var.color.primary};
  display: block;
  font-size: 0.875rem;
  padding-left: 0.75rem; padding-right: 0.75rem;
  padding-top: 0.375rem; padding-bottom: 0.375rem;
  width: 100%;
  min-height: 120px;
}\`;`}
            id="importHtml"
            onInput={(e) => setHtmlContent(e.currentTarget.value)}
            placeholder="Paste HTML here"
            ref={nameInputRef!}
            value={htmlContent()}
          />
        </As>
      </div>
    </FloatingFormDropdown>
  );
}
