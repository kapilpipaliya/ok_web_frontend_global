import type { Strategy } from "@floating-ui/dom";

import createFloating from "@corvu/utils/create/floating";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  on,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { PageLayoutObject } from "~/features/page_designer/context/LayoutContext";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";

import { generateBoxShadow } from "~/lib/css/generateBoxShadow";
import { getBoundingRectChildren } from "~/features/page_designer/functions/drag_drop/ui/getBoundingRectChildren";
import { getDnDBoxShadowArgs } from "~/features/page_designer/functions/drag_drop/ui/getDnDBoxShadowArgs";
import { isLayoutPreviewHover } from "~/features/page_designer/functions/layout/previewHover";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function BorderOverlay(
  props: Readonly<{ item: Vertex; reference: Accessor<HTMLElement | null> }>,
) {
  const [graph] = useGraph();

  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId!] as Vertex<PageLayoutObject>;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const isSelectedLayoutId = createSelector(
    () => formStoreVertex()?.P.selectedId,
  );
  const isSelectedHoverId = createSelector(() => formStoreVertex()?.P.hoverId);
  const isPreviewHoverId = () =>
    isLayoutPreviewHover(layoutStoreVertex()?.P, props.item.id);
  const activeItemChanged = createSelector(
    () => layoutStoreVertex()?.P.activeItem,
  );
  const isActiveTargetItem = () => activeItemChanged(props.item.id);

  const isActiveDropTarget = () =>
    isActiveTargetItem() && !!layoutStoreVertex()?.P.dragPosition;

  const getBorder = createMemo(() => {
    let styles: Record<string, string> = {};

    // Drop indicator (green edge shadow) takes priority over hover border.
    if (isActiveDropTarget()) {
      const boxShadowProps = getDnDBoxShadowArgs(
        layoutStoreVertex()?.P.dragPosition,
        "green",
      );
      return {
        "box-shadow": generateBoxShadow([boxShadowProps]),
      };
    }

    if (isSelectedLayoutId(props.item.id)) {
      styles = {
        ...styles,
        border: "1px solid purple",
      };
    } else if (isSelectedHoverId(props.item.id) || isPreviewHoverId()) {
      styles = {
        ...styles,
        border: "1px solid orange",
      };
    }

    return styles;
  });

  const ShowBorder = () => {
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);

    const ref = props.reference();
    if (!ref) {
      return;
    }

    const [store, setStore] = createStore({
      maxHeight: 0,
      maxWidth: 0,
      x: 0,
      y: 0,
    });
    // const updateInitial = () => {
    //   const rect = getBoundingRectChildren(props.reference()!);
    //   setStore({
    //     maxHeight: rect.height + 2,
    //     maxWidth: rect.width + 2,
    //     x: rect.x - 1,
    //     y: rect.y - 1
    //   });
    // }
    // updateInitial();

    const strategy = () => "fixed" as Strategy;

    const floatingState = createFloating({
      enabled: true,
      floating: floating,
      options: () => ({}),
      placement: () => "bottom-start",
      reference: () => props.reference() ?? null,
      strategy,
    });

    const updatePos = () => {
      const rect = getBoundingRectChildren(props.reference()!);
      setStore({
        maxHeight: rect.height + 2,
        maxWidth: rect.width + 2,
        x: (floatingState().x ?? 0) - 1,
        y: (floatingState().y ?? 0) - rect.height - 1,
      });
    };

    createEffect(
      on(
        [
          () => layoutStoreVertex()?.P.activeItem,
          () => layoutStoreVertex()?.P.dragPosition,
          () => layoutStoreVertex()?.P.previewHoverId,
          () => formStoreVertex()?.P.hoverId,
          () => floatingState().x,
          () => floatingState().y,
        ],
        // Re-measure when drop zone or hover changes during drag.
        updatePos,
      ),
    );

    return (
      <Portal>
        <div
          ref={setFloating}
          style={{
            ...getBorder(),
            height: `${store.maxHeight}px`,
            left: `${store.x}px`,
            "pointer-events": "none",
            position: "fixed",
            top: `${store.y}px`,
            width: `${store.maxWidth}px`,
          }}
        />
      </Portal>
    );
  };

  return (
    <Show when={Object.keys(getBorder()).length > 0}>
      <ShowBorder />
    </Show>
  );
}
