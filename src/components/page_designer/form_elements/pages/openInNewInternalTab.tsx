import {GraphInterface, Id, Vertex} from "~/lib/graph/graph";
import type {NavItem} from "~/components/page_designer/form_elements/getTreeData";
import {OpenFormInfo, PageLayoutObject} from "~/components/page_designer/context/LayoutContext";
import {SetStoreFunction} from "solid-js/store";
import {addNewVertex, mergeVertexProperties, newVertex} from "~/lib/graph/mutate/vertex";
import {v7 as uuidv7} from "uuid";

export function openInNewInternalTab(
  layoutStoreId: Id,
  child: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const layoutStore = graph.vertexes[layoutStoreId].P as PageLayoutObject;
  // Check if form with same label and dataId already exists
  const exists = child.id !== "new" && layoutStore.openedFormIds.some(
    formId => {
      const form = graph.vertexes[formId].P as OpenFormInfo;
      return form.label === child.L[0] && form.dataId === child.id;
    }
  );

  if (!exists) {
    const newOpenVertex = newVertex<OpenFormInfo>(uuidv7(), ["OpenForm"], {
      formId: uuidv7(),
      label: child.L[0],
      dataId: child.id,
      // @ts-expect-error ignore
      parentId: child.P.parentId,
      mainPanel: 0
    });
    addNewVertex(0, newOpenVertex, graph, setGraph);
    // Note: cloneProperties is false because we don't want to clone the properties of the form. It cause re-render of the form.
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      {
        openedFormIds: [...layoutStore.openedFormIds, newOpenVertex.id]
      },
      {cloneProperties: false}
    );
  } else {
    const openFormId = layoutStore.openedFormIds.find(formId => graph.vertexes[formId].P.dataId === child.id);
    if (openFormId) {
      mergeVertexProperties(0, layoutStoreId, graph, setGraph, {
        formId: graph.vertexes[openFormId].P.formId
      });
    }
  }
}
