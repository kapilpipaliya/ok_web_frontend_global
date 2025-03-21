import { createMemo, For } from "solid-js";

import { Id } from "~/lib/graph/graph";
import { useGraph } from "~/lib/graph/GraphContext";
import { getExistingOrDefaultTxnValue } from "~/lib/graph/transaction/value/getExistingOrDefaultTxnValue";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

import type { PageLayoutObject } from "../../context/LayoutContext";

import { useDesignerLayoutStore } from "../../context/LayoutContext";

export function FormConfig() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  const PrintableTxnValue = (props: {openedFormId: Id}) => {
    const txnId = () => graph.vertexes[graph.vertexes[props.openedFormId].P.formId].P.txnId;
    
    const memoizedTxnValue = createMemo(() => {
      const txnValue = getExistingOrDefaultTxnValue(txnId(), graph);
      
      // Remove originalData from steps if it exists
      if (txnValue.steps && txnValue.steps.length > 0) {
        txnValue.steps = txnValue.steps.map(step => {
          const { originalData, ...rest } = step;
          return rest;
        });
      }
      
      return txnValue;
    });
    
    return (
      <div class="transaction-debug">
        <h3>------Transaction Data------</h3>
        <div class="transaction-summary">
          <div>Steps Count: {memoizedTxnValue().steps.length}</div>
        </div>
        <pre>
          {JSON.stringify(memoizedTxnValue(), null, 2)}
        </pre>
      </div>
    );
  };
  
  return (
    <For each={layoutStore().openedFormIds}>
      {(openedFormId) => (
        <div
          style={{
            display:
              layoutStore().formId === graph.vertexes[openedFormId].P.formId
                ? "block"
                : "none",
          }}
        >
          <PageViewWrapper
            dataId={graph.vertexes[openedFormId].P.dataId}
            formDataId={graph.vertexes[openedFormId].P.formDataId}
            hideSaveCancelButton={true}
            isDesignMode={true}
            isNoPermissionCheck={true}
            pageVertexName={graph.vertexes[openedFormId].P.label}
            // @ts-expect-error ignore
            parentId={graph.vertexes[openedFormId].P.parentId}
            txnId={graph.vertexes[openedFormId].P.txnId}
            uuid={graph.vertexes[openedFormId].P.formId}
            // openedFormId={openedFormId}
          />
          <PrintableTxnValue openedFormId={openedFormId} />
        </div>
      )}
    </For>
  );
}
