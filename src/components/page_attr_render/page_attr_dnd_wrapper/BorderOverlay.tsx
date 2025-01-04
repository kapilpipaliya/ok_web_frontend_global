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

import type { Vertex } from "~/lib/graph/graph";
import { useGraph } from "~/lib/graph/graph";

import { generateBoxShadow } from "~/components/css_properties/utils/generate/generateBoxShadow";
import { getBoundingRectChildren } from "~/components/page_designer/functions/getBoundingRectChildren";

import { useDesignerLayoutStore } from "../../page_designer/context/LayoutContext";
import { getDnDBoxShadowArgs } from "../../page_designer/functions/getDnDBoxShadowArgs";
import type { PageLayoutObject } from "../../page_designer/context/LayoutContext";

export function BorderOverlay(
  props: Readonly<{ item: Vertex; reference: Accessor<HTMLElement | null> }>,
) {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph] = useGraph();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const isSelectedLayoutId = createSelector(() => layoutStore().selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore().hoverId);
  const activeItemChanged = createSelector(() => layoutStore().activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.item.id);

  const getBorder = createMemo(() => {
    let boxShadow = "";

    if (isActiveTargetItem()) {
      const boxShadowProps = getDnDBoxShadowArgs(
        layoutStore().position,
        "green-60",
      );
      boxShadow = `box-shadow:${generateBoxShadow([boxShadowProps])}`;
    }

    if (isSelectedLayoutId(props.item.id)) {
      boxShadow += " b:1px|solid|blue-60";
    } else if (isSelectedHoverId(props.item.id)) {
      boxShadow += " b:1px|solid|blue-80";
    }

    return boxShadow;
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
      on([() => floatingState().x, () => floatingState().y], updatePos),
    );

    return (
      <Portal>
        <div
          class={getBorder()}
          ref={setFloating}
          style={{
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
    <Show when={getBorder()}>
      <ShowBorder />
    </Show>
  );
}
