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
      {(form) => (
        <div
          style={{
            display: layoutStore().formId === form.formId ? "block" : "none",
          }}
        >
          <PageViewWrapper
            dataId={form.dataId}
            hideSaveCancelButton={true}
            isNoPermissionCheck={true}
            pageVertexName={form.label}
            uuid={form.formId}
          />
        </div>
      )}
    </For>
  );
}
