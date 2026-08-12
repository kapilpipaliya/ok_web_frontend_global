import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";
import { evalExpression } from "~/lib/expression_eval";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/** Compare layout/form ids that may be string or number. */
export function sameLayoutId(
  a: Id | number | null | undefined,
  b: Id | number | null | undefined,
): boolean {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

function toIdList(ids: Array<Id | number> | undefined): Array<Id | number> {
  return Array.isArray(ids) ? [...ids] : [];
}

/** All selected layout attr ids (primary + multiHighlight). */
export function getLayoutSelectionIds(
  formStore: FormStoreObject | undefined,
): Array<Id | number> {
  if (!formStore) return [];
  const ids: Array<Id | number> = [];
  if (formStore.selectedId != null && formStore.selectedId !== -1) {
    ids.push(formStore.selectedId);
  }
  for (const id of toIdList(formStore.multiHighlight)) {
    if (
      id != null &&
      id !== -1 &&
      !ids.some((existing) => sameLayoutId(existing, id))
    ) {
      ids.push(id);
    }
  }
  return ids;
}

export function isLayoutIdSelected(
  formStore: FormStoreObject | undefined,
  id: Id | number,
): boolean {
  if (!formStore) return false;
  if (sameLayoutId(formStore.selectedId, id)) return true;
  return !!formStore.multiHighlight?.some((x) => sameLayoutId(x, id));
}

export function isAncestorOf(
  ancestorId: Id | number,
  descendantId: Id | number,
  graph: GraphInterface,
): boolean {
  let current: Vertex | undefined = graph.vertexes[descendantId as Id];
  while (current) {
    const parents =
      evalExpression("<-Attr", { graph, vertexes: [current] }) || [];
    if (!parents.length) return false;
    if (sameLayoutId(parents[0].id, ancestorId)) return true;
    current = parents[0];
  }
  return false;
}

/** Prefer parents over children when both are selected. */
export function filterTopmostSelectionIds(
  ids: Array<Id | number>,
  graph: GraphInterface,
): Array<Id | number> {
  return ids.filter(
    (id) =>
      !ids.some(
        (other) =>
          !sameLayoutId(other, id) && isAncestorOf(other, id, graph),
      ),
  );
}

/** DFS tree order under the form/page root (stable multi-drag order). */
export function sortLayoutIdsByTreeOrder(
  ids: Array<Id | number>,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  rootId: Id | number | undefined,
): Id[] {
  const wanted = new Set(ids.map((id) => String(id)));
  const ordered: Id[] = [];
  const seen = new Set<string>();

  const walk = (vertex: Vertex | undefined) => {
    if (!vertex) return;
    const key = String(vertex.id);
    if (wanted.has(key) && !seen.has(key)) {
      seen.add(key);
      ordered.push(vertex.id);
    }
    for (const child of getChildrenAttrs(graph, setGraph, vertex)) {
      walk(child);
    }
  };

  const root = rootId != null ? graph.vertexes[rootId as Id] : undefined;
  if (root) {
    walk(root);
  }

  for (const id of ids) {
    const key = String(id);
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(id as Id);
    }
  }

  return ordered;
}

/**
 * Vertex ids to include in a layout-item drag payload.
 * If the dragged row is part of a multi-selection, drag all topmost selected ids.
 */
export function getLayoutDragVertexIds(
  formStore: FormStoreObject | undefined,
  draggedId: Id,
  graph: GraphInterface,
): Id[] {
  const selection = getLayoutSelectionIds(formStore);
  if (
    selection.length <= 1 ||
    !selection.some((id) => sameLayoutId(id, draggedId))
  ) {
    return [draggedId];
  }

  return filterTopmostSelectionIds(selection, graph).map((id) => id as Id);
}
