import { onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { useGraph } from "~/lib/graph/graph";
import { getLastTxnIndex } from "~/lib/graph/transaction/getLastTxnIndex";
import JsxParser from "~/lib/jsx_parser/components/JsxParser";

import { getModalClass } from "../../../../../lib/ui/getModalClass";
import { useDesignerLayoutStore } from "../../../LayoutContext";

export function ImportModal(props: Readonly<{ toggleModal: () => void }>) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const _prevTxnIndex = getLastTxnIndex(layoutStore.formStore[0].txnId, graph);

  const metaVertexId = graph.newVertexId;
  const dataVertexId = graph.newVertexId;

  setGraph("vertexes", metaVertexId, {
    P: { height: 700, name: "jsx", width: 700 },
  });
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
      jsx: graph.vertexes[dataVertexId].P.jsx || "",
      parent: graph.vertexes[layoutStore.selectedId],
      showWarnings: true,
      txnId: layoutStore.formStore[0].txnId,
    });
    jsxParser.render(graph, setGraph);
    // reset layout
    // layoutTreeViewInstance.option("items", getLayoutTreeData());
  };
  const onCancel = () => {
    //     //   if (prevTxnIndex !== -1)
    //     //     revertTransactionUpTo(pageConfig.formData.txnId, prevTxnIndex, graph);
    //     //   // reset layout
    //     //   // layoutTreeViewInstance.option("items", getLayoutTreeData());
    props.toggleModal();
  };
  const onSubmit = () => {
    //     //   // reset layout
    //     //   // layoutTreeViewInstance.option("items", getLayoutTreeData());
    //     //   // hack to refresh the select fields. no option is refereshing the label.
    //     //   setGraph("vertexes", layoutStore.selectedId, "OUT", "Rule", (v) =>
    //     //     v ? [...v] : v,
    //     //   );
    props.toggleModal();
  };

  return (
    <Portal>
      <dialog class={`${getModalClass()}`}>
        <div class={"min-w:30%"}>
          <div class="modal-header">
            Import HTML
            <button
              class="float:right"
              onclick={props.toggleModal}
              type="button"
            >
              ✕
            </button>
          </div>
          <div class={"mt:1rem"}>
            <DynamicComponent
              componentName="TextArea"
              data={graph.vertexes[dataVertexId]}
              disabled={false}
              isNoPermissionCheck={true}
              meta={graph.vertexes[metaVertexId]}
              onChange={(data: any) =>
                setGraph("vertexes", dataVertexId, "P", { jsx: data })
              }
              title={"Write HTML"}
              txnId={layoutStore.formStore[0].txnId}
            />
          </div>
          <div class="modal-footer">
            <div class="flex ai:center jc:center">
              <button class="" onClick={onImport} type="button">
                Import
              </button>
              <button class="" onClick={onCancel} type="button">
                Cancel
              </button>
              <button
                class="border-color:#FF0000 color:#FF0000"
                onClick={onSubmit}
                type="button"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </Portal>
  );
}
