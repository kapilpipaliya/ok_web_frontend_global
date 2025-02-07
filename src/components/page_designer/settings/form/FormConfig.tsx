import { For } from "solid-js";

import { useGraph, } from "~/lib/graph/graph";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

import type { PageLayoutObject } from "../../context/LayoutContext";

import { useDesignerLayoutStore } from "../../context/LayoutContext";

export function FormConfig() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  return (
    <For each={layoutStore().openedFormIds}>
      {(openedFormId) => (
        <div
          style={{
            display: layoutStore().formId === graph.vertexes[openedFormId].P.formId ? "block" : "none",
          }}
        >
          <PageViewWrapper
            dataId={graph.vertexes[openedFormId].P.dataId}
            formDataId={graph.vertexes[openedFormId].P.formDataId}
            hideSaveCancelButton={true}
            isNoPermissionCheck={true}
            pageVertexName={graph.vertexes[openedFormId].P.label}
            // @ts-expect-error ignore
            parentId={graph.vertexes[openedFormId].P.parentId}
            txnId={graph.vertexes[openedFormId].P.txnId}
            uuid={graph.vertexes[openedFormId].P.formId}
            // openedFormId={openedFormId}
          />
        </div>
      )}
    </For>
  );
}
