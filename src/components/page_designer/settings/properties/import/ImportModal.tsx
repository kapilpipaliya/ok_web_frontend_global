import { onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { GenericInputField } from "~/components/fields/GenericInputField";
import { ModalBody, ModalContent, ModalFooter, ModalHeader } from "~/components/solid_blocks";
import { useGraph } from "~/lib/graph/graph";
import JsxParser from "~/lib/jsx_parser/components/JsxParser";

import { useDesignerLayoutStore } from "../../../LayoutContext";

export function ImportModal(props: { toggleModal: () => void; }) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  let prevTxnIndex = -1;
  prevTxnIndex =
    graph.transactions.get(layoutStore.formData.txnId)?.steps?.length || 0;

  const metaVertexId = graph.newVertexId;
  const dataVertexId = graph.newVertexId;

  setGraph("vertexes", metaVertexId, {
    P: { height: 700, name: "jsx", width: 700 },
  });
  setGraph("vertexes", dataVertexId, { P: {}, id: dataVertexId });

  onCleanup(() => {
    // @ts-ignore
    setGraph("vertexes", metaVertexId, undefined);
    // @ts-ignore
    setGraph("vertexes", dataVertexId, undefined);
  });

  const onImport = () => {
    const jsxParser = new JsxParser({
      formData: layoutStore.formData.formData,
      jsx: graph.vertexes[dataVertexId].P.jsx || "",
      parent: graph.vertexes[layoutStore.selectedId],
      showWarnings: true,
      txnId: layoutStore.formData.txnId,
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
        <div class="sb-modal r:10|10|10|10" role="dialog">
          <ModalContent class={"min-w:30%"}>
            <ModalHeader>
              Import HTML
              <button
                class="float:right"
                onclick={props.toggleModal}
                type="button"
              >
                ✕
              </button>
            </ModalHeader>
            <ModalBody class={"mt:1rem"}>
              <GenericInputField
                component="TextArea"
                data={graph.vertexes[dataVertexId]}
                disabled={false}
                meta={graph.vertexes[metaVertexId]}
                setValue={(data: any) => setGraph("vertexes", dataVertexId, "P", { jsx: data })}
                title={"Write HTML"}
                txnId={layoutStore.formData.txnId} />
            </ModalBody>
            <ModalFooter>
              <div
                class="flex ai:center jc:center"
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
