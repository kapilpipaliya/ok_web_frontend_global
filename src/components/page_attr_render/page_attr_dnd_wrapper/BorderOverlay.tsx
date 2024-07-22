import { autoUpdate } from "@floating-ui/dom";
import { debounce } from "@solid-primitives/scheduled";
import { useFloating } from "solid-floating-ui";
import {
  Show, createEffect, createMemo,
  createSelector, createSignal, on
} from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";

import type { Vertex } from "~/lib/graph/graph";

import { generateBoxShadow } from "~/components/css_properties/utils/generateBoxShadow";
import { getBoundingRect } from "~/components/page_designer/functions/getIndicatorPosition";
import { useIsPreview } from "~/lib/contexts";

import { useDesignerLayoutStore } from "../../page_designer/LayoutContext";
import { getDnDBoxShadowArgs } from "../../page_designer/functions/getDnDBoxShadowArgs";

export function BorderOverlay(props: Readonly<{ item: Vertex; reference: Accessor<HTMLElement | null>; }>) {
  const [layoutStore] = useDesignerLayoutStore();
  const [isPreview] = useIsPreview();
  const isSelectedLayoutId = createSelector(() => layoutStore.selectedId);
  const isSelectedHoverId = createSelector(() => layoutStore.hoverId);
  const activeItemChanged = createSelector(() => layoutStore.activeItem);
  const isActiveTargetItem = () => activeItemChanged(props.item.id);

  const getBorder = createMemo(() => {
    let boxShadow = "";

    if (!isPreview()) {
      if (isActiveTargetItem()) {
        const boxShadowProps = getDnDBoxShadowArgs(layoutStore.position, "green-60");
        boxShadow = `box-shadow:${generateBoxShadow([boxShadowProps])}`;
      }

      if (isSelectedLayoutId(props.item.id)) {
        boxShadow += " b:1px|solid|blue-60";
      } else if (isSelectedHoverId(props.item.id)) {
        boxShadow += " b:1px|solid|blue-80";
      }
    }

    return boxShadow;
  });

  const ShowBorder = () => {
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);

    const ref = props.reference();
    if (!ref) return;
    ref.getBoundingClientRect = () => getBoundingRect(ref);

    const [store, setStore] = createStore({
      maxHeight: 0,
      maxWidth: 0,
      x: 0,
      y: 0
    });
    const updateInitial = () => {
      const rect = getBoundingRect(props.reference());
      setStore({
        maxHeight: rect.height + 2,
        maxWidth: rect.width + 2,
        x: rect.x - 1,
        y: rect.y - 1
      });
    }
    updateInitial();

    const position = useFloating(props.reference, floating, {
      placement: "bottom-start",
      strategy: "fixed",
      whileElementsMounted: autoUpdate
    });

    const updatePos = () => {
      const rect = getBoundingRect(props.reference());
      setStore({
        maxHeight: rect.height + 2,
        maxWidth: rect.width + 2,
        x: (position.x ?? 0) - 1,
        y: (position.y ?? 0) - rect.height - 1
      });
    }

    const updatePosition = debounce(updatePos, 300);

    createEffect(on([() => position.x, () => position.y], updatePosition));

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
            width: `${store.maxWidth}px`
          }}
        ></div>
      </Portal>
    );
  };

  return (
    <Show when={getBorder()}>
      <ShowBorder />
    </Show>
  );
}
