import { For } from "solid-js";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { useDesignerFormIdContext, useDesignerLayoutStore } from "../../context/LayoutContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import type { PageLayoutObject } from "../../context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

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
            hideSaveCancelButton={true}
            isNoPermissionCheck={true}
            pageVertexName={graph.vertexes[openedFormId].P.label}
            uuid={graph.vertexes[openedFormId].P.formId}
            // @ts-expect-error ignore
            parentId={graph.vertexes[openedFormId].P.parentId}
            formDataId={graph.vertexes[openedFormId].P.formDataId}
            // openedFormId={openedFormId}
          />
        </div>
      )}
    </For>
  );
}
