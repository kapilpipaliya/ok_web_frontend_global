import { useParams } from "@solidjs/router";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import type { PageLayoutObject } from "../../context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function FormConfig() {
  const params = useParams();
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;

  return (
    <PageViewWrapper
      dataId={params.id}
      hideSaveCancelButton={true}
      initializeFormStoreParent={(formId) => {
        // direct assignment not make it reactive
        mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
          formId: formId,
        });
      }}
      isNoPermissionCheck={true}
      pageVertexName={params.entity}
    />
  );
}
// showMainFieldsOnly={true}
// showSaveCancelButton={false}
