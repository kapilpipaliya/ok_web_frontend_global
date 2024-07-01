import { onCleanup, useContext } from "solid-js";
import { Portal } from "solid-js/web";
import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "~/components/solid_blocks";
import { GraphContext } from "~/lib/graph/graph";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { getNewGraphId } from "~/lib/graph/transaction";
import JsxParser from "~/lib/jsx_parser/components/JsxParser";
import { useDesignerLayoutStore } from "../../../LayoutContext";

export function ImportModal(props: { toggleModal: () => void; }) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();
  let prevTxnIndex = -1;
  prevTxnIndex =
    graph.transactions.get(layoutStore.formData.txnId)?.steps?.length || 0;

  const metaVertexId = getNewGraphId();
  const dataVertexId = getNewGraphId();

  setGraph("vertexes", metaVertexId, {
    P: { name: "jsx", width: 700, height: 700 },
  });
  setGraph("vertexes", dataVertexId, { id: dataVertexId, P: {} });

  onCleanup(() => {
    // @ts-ignore
    setGraph("vertexes", metaVertexId, undefined);
    // @ts-ignore
    setGraph("vertexes", dataVertexId, undefined);
  });

  const onImport = () => {
    const jsxParser = new JsxParser({
      formData: layoutStore.formData.formData,
      showWarnings: true,
      txnId: layoutStore.formData.txnId,
      jsx: graph.vertexes[dataVertexId].P.jsx || "",
      parent: graph.vertexes[layoutStore.selectedId],
    });
    jsxParser.render(graph, setGraph);
    // reset layout
    // layoutTreeViewInstance.option("items", getLayoutTreeData());
  }
  const onCancel = () => {
    props.toggleModal();
  }
  const onSubmit = () => {
    props.toggleModal();
  }

  return (
    <>
      <Portal>
        <div role="dialog" tabIndex={-1} class="sb-modal r:10|10|10|10">
          <ModalContent class={"min-w:30%"}>
            <ModalHeader>
              Import HTML
              <button
                onclick={props.toggleModal}
                style={{ float: "right" }}
              >
                ✕
              </button>
            </ModalHeader>
            <ModalBody class={"mt:1rem"}>
              <GenericInputField
                txnId={layoutStore.formData.txnId}
                title={"Write HTML"}
                component="TextArea"
                meta={graph.vertexes[metaVertexId]}
                data={graph.vertexes[dataVertexId]}
                setValue={(data: any) => setGraph("vertexes", dataVertexId, "P", { jsx: data })}
                disabled={false} />
            </ModalBody>
            <ModalFooter>
              <div
                style={{
                  display: "flex",
                  "justify-content": "center",
                  "align-items": "center",
                }}
              >
                <button
                  class=""
                  onClick={onImport}
                >
                  Import
                </button>
                <button
                  class=""
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  class="border-color:#FF0000 color:#FF0000"
                  onClick={onSubmit}
                >
                  Submit
                </button>
              </div>
            </ModalFooter>
          </ModalContent>
        </div>
      </Portal>
    </>
  );
}
