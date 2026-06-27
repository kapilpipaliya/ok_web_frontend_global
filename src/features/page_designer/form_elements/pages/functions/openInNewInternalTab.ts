import type { SetStoreFunction } from "solid-js/store";

import { v7 as uuidv7 } from "uuid";

import type {
  OpenFormInfo,
  PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";

import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function openInNewInternalTab(
  layoutStoreId: Id,
  child: Vertex | undefined,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const layoutStore = graph.vertexes[layoutStoreId].P as PageLayoutObject;
  if (!child) {
    return;
  }
  const label = Array.isArray(child.L) ? child.L[0] : child.L;
  const childId = child.id;

  let existingOpenFormId: Id | undefined;
  if (childId !== "new") {
    for (const openedFormId of layoutStore.openedFormIds) {
      const form = graph.vertexes[openedFormId].P as OpenFormInfo;
      if (form.label === label && form.dataId === childId) {
        existingOpenFormId = openedFormId;
        break;
      }
    }
  }

  if (existingOpenFormId) {
    const existingForm = graph.vertexes[existingOpenFormId].P as OpenFormInfo;
    mergeVertexProperties(0, layoutStoreId, graph, setGraph, {
      [`mainPanel${existingForm.mainPanel}Tab`]: existingForm.formId,
      focusedFormId: existingForm.formId,
    });
    return;
  }

  let targetMainPanel = layoutStore.mainPanelRows[0][0];
  if (layoutStore.focusedFormId) {
    for (const openedFormId of layoutStore.openedFormIds) {
      const form = graph.vertexes[openedFormId]?.P as OpenFormInfo | undefined;
      if (form?.formId === layoutStore.focusedFormId) {
        targetMainPanel = form.mainPanel;
        break;
      }
    }
  }

  const formId = uuidv7();
  const newOpenVertex = newVertex<OpenFormInfo>(uuidv7(), ["OpenForm"], {
    dataId: child.id,
    formDataId: child.P.formDataId,
    formId,
    label,
    mainPanel: targetMainPanel,
    parentId: child.P.parentId,
    txnId: child.P.txnId,
  });
  addNewVertex(0, newOpenVertex, graph, setGraph);

  // Note: cloneProperties is false because we don't want to clone the properties of the form. It cause re-render of the form.
  mergeVertexProperties<PageLayoutObject>(
    0,
    layoutStoreId,
    graph,
    setGraph,
    {
      openedFormIds: [...layoutStore.openedFormIds, newOpenVertex.id],
      // Activate the newly created tab in the focused tab's panel
      [`mainPanel${targetMainPanel}Tab`]: newOpenVertex.P.formId,
      focusedFormId: newOpenVertex.P.formId,
    },
    { cloneProperties: false },
  );
}
