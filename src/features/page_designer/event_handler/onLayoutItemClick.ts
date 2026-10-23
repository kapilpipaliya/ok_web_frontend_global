import type { StoreSetter as SetStoreFunction } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import type {
  LayoutTreeScrollSource,
  PageLayoutObject,
} from "../context/LayoutContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { syncHighlightedCompKey } from "~/features/page_designer/functions/layout/syncHighlightedCompKey";
import { sameLayoutId } from "~/features/page_designer/functions/layout/layoutSelection";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export type LayoutItemMultiSelect = {
  /** Ctrl/Cmd click — toggle id in/out of the multi selection */
  toggle?: boolean;
  /** Shift click — select contiguous range using orderedIds */
  range?: boolean;
  /** Visible tree order (for shift-range). Typically data-item-id order. */
  orderedIds?: Array<Id | number>;
};

function toIdList(ids: Array<Id | number> | undefined): Array<Id | number> {
  return Array.isArray(ids) ? [...ids] : [];
}

function computeMultiSelectState(
  formStore: FormStoreObject,
  layoutVertexId: Id | number,
  multiSelect: LayoutItemMultiSelect | undefined,
  selectedIndex: number,
): {
  selectedId: Id | number;
  selectedIndex: number;
  multiHighlight: Array<Id | number>;
} {
  const currentSelectedId = formStore.selectedId ?? -1;
  const currentMulti = toIdList(formStore.multiHighlight).filter(
    (id) => id !== -1 && !sameLayoutId(id, currentSelectedId),
  );

  if (multiSelect?.range && layoutVertexId != null && layoutVertexId !== -1) {
    const orderedIds = multiSelect.orderedIds ?? [];
    const anchorId =
      currentSelectedId !== -1 && currentSelectedId != null
        ? currentSelectedId
        : layoutVertexId;
    const start = orderedIds.findIndex((id) => sameLayoutId(id, anchorId));
    const end = orderedIds.findIndex((id) =>
      sameLayoutId(id, layoutVertexId),
    );

    if (start !== -1 && end !== -1) {
      const [lo, hi] = start <= end ? [start, end] : [end, start];
      const rangeIds = orderedIds.slice(lo, hi + 1);
      return {
        selectedId: anchorId,
        selectedIndex: formStore.selectedIndex ?? 0,
        multiHighlight: rangeIds.filter((id) => !sameLayoutId(id, anchorId)),
      };
    }

    return {
      selectedId: layoutVertexId,
      selectedIndex,
      multiHighlight: [],
    };
  }

  if (multiSelect?.toggle && layoutVertexId != null && layoutVertexId !== -1) {
    if (sameLayoutId(layoutVertexId, currentSelectedId)) {
      if (currentMulti.length > 0) {
        return {
          selectedId: currentMulti[0],
          selectedIndex: 0,
          multiHighlight: currentMulti.slice(1),
        };
      }
      return {
        selectedId: currentSelectedId,
        selectedIndex: formStore.selectedIndex ?? selectedIndex,
        multiHighlight: [],
      };
    }

    if (currentMulti.some((id) => sameLayoutId(id, layoutVertexId))) {
      return {
        selectedId: currentSelectedId,
        selectedIndex: formStore.selectedIndex ?? selectedIndex,
        multiHighlight: currentMulti.filter(
          (id) => !sameLayoutId(id, layoutVertexId),
        ),
      };
    }

    if (currentSelectedId === -1 || currentSelectedId == null) {
      return {
        selectedId: layoutVertexId,
        selectedIndex,
        multiHighlight: [],
      };
    }

    return {
      selectedId: currentSelectedId,
      selectedIndex: formStore.selectedIndex ?? selectedIndex,
      multiHighlight: [...currentMulti, layoutVertexId],
    };
  }

  return {
    selectedId: layoutVertexId ?? -1,
    selectedIndex,
    multiHighlight: [],
  };
}

export function onLayoutItemClick(
  layoutStoreVertex: Vertex<PageLayoutObject>,
  formStoreVertex: Vertex<FormStoreObject>,
  layoutVertexId: Id,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  selectedIndex = 0,
  scrollSource?: LayoutTreeScrollSource,
  multiSelect?: LayoutItemMultiSelect,
) {
  {

    const layoutUpdates: Partial<PageLayoutObject> = {};
    if (layoutStoreVertex.P.focusedFormId !== formStoreVertex.id) {
      layoutUpdates.focusedFormId = formStoreVertex.id;
    }
    if (scrollSource) {
      layoutUpdates.layoutTreeScrollSource = scrollSource;
    }
    if (Object.keys(layoutUpdates).length > 0) {
      mergeVertexProperties<PageLayoutObject>(
        0,
        layoutStoreVertex.id,
        graph,
        setGraph,
        layoutUpdates,
      );
    }

    const next = computeMultiSelectState(
      formStoreVertex.P,
      layoutVertexId,
      multiSelect,
      selectedIndex,
    );

    mergeVertexProperties<FormStoreObject>(
      0,
      formStoreVertex.id,
      graph,
      setGraph,
      {
        selectedId: next.selectedId,
        selectedIndex: next.selectedIndex,
        multiHighlight: next.multiHighlight,
      },
    );

    if (next.selectedId != null && next.selectedId !== -1) {
      syncHighlightedCompKey(
        layoutStoreVertex.id,
        next.selectedId as Id,
        graph,
        setGraph,
      );
    }
  
};
}
