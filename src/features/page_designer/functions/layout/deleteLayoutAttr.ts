import type { StoreSetter as SetStoreFunction } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { deleteNestedLayout } from "~/lib/graph/mutate/vertex/delete/deleteNestedLayout";
import { evalExpression } from "~/lib/expression_eval";

import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";
import { onLayoutItemClick } from "~/features/page_designer/event_handler/onLayoutItemClick";
import type { PageLayoutObject } from "../../context/LayoutContext";
import { getChildrenAttrs } from "./getChildrenAttrs";
import { clearLayoutPreviewHover } from "./previewHover";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { allFormAttrsInPageFromLevel } from "~/features/page_designer/functions/form/allFormAttrsInPageFromLevel";
import { getAllFieldsUsedInRootLevelSetting } from "~/features/page_designer/functions/form/getAllFieldsUsedInRootLevelSetting";
import { filterTopmostSelectionIds, sameLayoutId } from "~/features/page_designer/functions/layout/layoutSelection";

/**
 * Find the parent vertex of a given layout vertex
 */
function findParentVertex(
  layoutVertex: Vertex,
  graph: GraphInterface,
): Vertex | null {
  const parentElements =
    evalExpression("<-Attr", { graph, vertexes: [layoutVertex] }) || [];
  return parentElements.length > 0 ? parentElements[0] : null;
}

/**
 * Find the siblings of a given vertex and determine the next and previous siblings
 */
function findSiblings(
  layoutVertex: Vertex,
  parentVertex: Vertex | null,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): { nextSibling: Vertex | null; prevSibling: Vertex | null } {
  if (!parentVertex) {
    return { nextSibling: null, prevSibling: null };
  }

  // Get all siblings including the current vertex
  const siblings = getChildrenAttrs(graph, setGraph, parentVertex);

  // Find the index of the current vertex in the siblings array
  const currentIndex = siblings.findIndex(
    (sibling) => sibling.id === layoutVertex.id,
  );

  // Determine next and previous siblings
  const nextSibling =
    currentIndex !== -1 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;
  const prevSibling = currentIndex > 0 ? siblings[currentIndex - 1] : null;

  return { nextSibling, prevSibling };
}

/**
 * Clear selectedId, multiHighlight, and hoverId if they match the layout being deleted
 */
function clearSelectedAndHoverIds(
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): void {
  {

    const updates: Partial<FormStoreObject> = {};

    if (formStoreVertex?.P.selectedId === layoutVertex.id) {
      updates.selectedId = -1;
    }

    if (formStoreVertex?.P.hoverId === layoutVertex.id) {
      updates.hoverId = -1;
    }

    const multi = formStoreVertex?.P.multiHighlight;
    if (multi?.some((id) => sameLayoutId(id, layoutVertex.id))) {
      updates.multiHighlight = multi.filter(
        (id) => !sameLayoutId(id, layoutVertex.id),
      );
    }

    if (Object.keys(updates).length > 0) {
      mergeVertexProperties<FormStoreObject>(
        0,
        formStoreVertex.id!,
        graph,
        setGraph,
        updates,
      );
    }
  
};
}

/**
 * Delete multiple layout attrs (e.g. multi-select). Skips nested children of
 * other selected nodes. Selects a remaining sibling/parent afterward.
 */
export function deleteLayoutAttrs(
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertexIds: Array<Id | number>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  showSuccessToast: (message: string) => void,
  layoutStoreId?: Id,
) {
  const uniqueIds = [
    ...new Map(layoutVertexIds.map((id) => [String(id), id])).values(),
  ];
  const topIds = filterTopmostSelectionIds(uniqueIds, graph);
  const vertices = topIds
    .map((id) => graph.vertexes[id as Id])
    .filter(Boolean) as Vertex[];

  if (vertices.length === 0) return;

  if (vertices.length === 1) {
    const key = vertices[0].P?.key || vertices[0].P?.componentName || "Html";
    deleteLayoutAttr(
      formStoreVertex,
      vertices[0],
      graph,
      setGraph,
      txnId,
      key,
      showSuccessToast,
      layoutStoreId,
    );
    return;
  }

  // Validate each; abort all if any fails validation
  for (const vertex of vertices) {
    if (validateLayoutDeletion(formStoreVertex, vertex, graph, setGraph)) {
      return;
    }
  }

  const primary = vertices[0];
  const parentVertex = findParentVertex(primary, graph);
  const { nextSibling, prevSibling } = findSiblings(
    primary,
    parentVertex,
    graph,
    setGraph,
  );

  {

    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id!,
      graph,
      setGraph,
      {
        selectedId: -1,
        multiHighlight: [],
        hoverId:
          formStoreVertex.P.hoverId != null &&
          uniqueIds.some((id) =>
            sameLayoutId(id, formStoreVertex.P.hoverId),
          )
            ? -1
            : formStoreVertex.P.hoverId,
      },
    );
  
};

  if (layoutStoreId) {
    const previewHoverId = graph.vertexes[layoutStoreId]?.P?.previewHoverId;
    if (
      previewHoverId != null &&
      uniqueIds.some((id) => sameLayoutId(id, previewHoverId))
    ) {
      clearLayoutPreviewHover(layoutStoreId, graph, setGraph);
    }
  }

  deleteNestedLayout(graph, setGraph, txnId, vertices);
  saveUndoPoint(txnId, graph, setGraph);

  const layoutStoreVertex = layoutStoreId
    ? (graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>)
    : null;

  if (layoutStoreVertex) {
    const vertexToSelect = determineVertexToSelect(
      nextSibling &&
        !uniqueIds.some((id) => sameLayoutId(id, nextSibling.id))
        ? nextSibling
        : null,
      prevSibling &&
        !uniqueIds.some((id) => sameLayoutId(id, prevSibling.id))
        ? prevSibling
        : null,
      parentVertex,
      formStoreVertex,
      graph,
    );

    if (vertexToSelect) {
      selectVertex(
        layoutStoreVertex,
        formStoreVertex,
        vertexToSelect,
        graph,
        setGraph,
      );
    }
  }

  showSuccessToast(`${vertices.length} items deleted successfully`);
}

/**
 * Determine which vertex to select after deletion based on priority:
 * 1. Next sibling
 * 2. Previous sibling
 * 3. Parent
 * 4. Root vertex
 */
function determineVertexToSelect(
  nextSibling: Vertex | null,
  prevSibling: Vertex | null,
  parentVertex: Vertex | null,
  formStoreVertex: Vertex<FormStoreObject>,
  graph: GraphInterface,
): Vertex | null {
  // Priority 1: Next sibling
  if (nextSibling) {
    return nextSibling;
  }

  // Priority 2: Previous sibling
  if (prevSibling) {
    return prevSibling;
  }

  // Priority 3: Parent
  if (parentVertex) {
    return parentVertex;
  }

  // Priority 4: Root form data item
  if (
    formStoreVertex?.P.formDataId &&
    graph.vertexes[formStoreVertex.P.formDataId]
  ) {
    return graph.vertexes[formStoreVertex.P.formDataId];
  }

  return null;
}

/**
 * Select a vertex in the layout
 */
function selectVertex(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  vertexToSelect: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): void {
  onLayoutItemClick(
    layoutStoreVertex,
    formStoreVertex,
    vertexToSelect.id,
    graph,
    setGraph,
  );
}

export function deleteLayoutAttr(
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  key: string,
  showSuccessToast: (message: string) => void,
  layoutStoreId?: Id,
) {
  if (validateLayoutDeletion(formStoreVertex, layoutVertex, graph, setGraph)) {
    return;
  }

  // Find parent and siblings
  const parentVertex = findParentVertex(layoutVertex, graph);
  const { nextSibling, prevSibling } = findSiblings(
    layoutVertex,
    parentVertex,
    graph,
    setGraph,
  );

  // Clear selection if currently selected item is being deleted
  clearSelectedAndHoverIds(formStoreVertex, layoutVertex, graph, setGraph);

  if (
    layoutStoreId &&
    graph.vertexes[layoutStoreId]?.P?.previewHoverId === layoutVertex.id
  ) {
    clearLayoutPreviewHover(layoutStoreId, graph, setGraph);
  }

  // Delete the layout
  deleteNestedLayout(graph, setGraph, txnId, [layoutVertex]);
  saveUndoPoint(txnId, graph, setGraph);

  // Get layout store vertex for selection update
  const layoutStoreVertex = layoutStoreId
    ? (graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>)
    : null;

  // Select appropriate item after deletion
  if (layoutStoreVertex) {
    const vertexToSelect = determineVertexToSelect(
      nextSibling,
      prevSibling,
      parentVertex,
      formStoreVertex,
      graph,
    );

    if (vertexToSelect) {
      selectVertex(
        layoutStoreVertex,
        formStoreVertex,
        vertexToSelect,
        graph,
        setGraph,
      );
    }
  }

  if (key) {
    showSuccessToast(`${key} deleted successfully`);
  }
}

function validateLayoutDeletion(
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertex: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
): boolean {
  const formDataId = formStoreVertex?.P.formDataId;
  if (!(formDataId && graph.vertexes[formDataId])) {
    return false;
  }

  const usedAttrsInUniqueConstraints = getAllFieldsUsedInRootLevelSetting(
    graph,
    setGraph,
    graph.vertexes[formDataId],
    layoutVertex,
    "->$0Unique->$0Key",
  );

  if (usedAttrsInUniqueConstraints.length > 0) {
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id!,
      graph,
      setGraph,
      { usedAttrsInUniqueConstraints },
    );
    return true;
  }

  const usedAttrsInNameKeys = getAllFieldsUsedInRootLevelSetting(
    graph,
    setGraph,
    graph.vertexes[formDataId],
    layoutVertex,
    "->$0NameKey",
  );

  if (usedAttrsInNameKeys.length > 0) {
    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id!,
      graph,
      setGraph,
      { usedAttrsInNameKeys },
    );
    return true;
  }

  if (graph.vertexes[formDataId]?.L[0] === "Page") {
    const childContainsFormAttr = allFormAttrsInPageFromLevel(
      graph,
      layoutVertex,
      "Page",
    );

    if (childContainsFormAttr.length > 0) {
      const rootContainsFormAttrExcludingChild = allFormAttrsInPageFromLevel(
        graph,
        graph.vertexes[formDataId],
        "Page",
        childContainsFormAttr,
      );

      if (rootContainsFormAttrExcludingChild.length === 0) {
        mergeVertexProperties<FormStoreObject>(
          0,
          formStoreVertex.id!,
          graph,
          setGraph,
          { shouldContainAtLeastOneForm: true },
        );
        return true;
      }
    }
  }

  return false;
}
