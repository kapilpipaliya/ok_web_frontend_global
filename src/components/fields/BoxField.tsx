import { type JSX, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createLongPress } from "~/lib/hooks/createLongPress";

import type { GenericComponentProps } from "./FieldType";

export function BoxField(
  props: {
    as?: string;
    class?: string;
    isViewMode?: boolean;
    longPressDuration?: number;
    onLongPress?: (event: Event) => void;
    viewModeClass?: string;
  } & JSX.HTMLAttributes<HTMLDivElement> &
    Readonly<GenericComponentProps>,
) {
  const [local, others] = splitProps(props, [
    "componentName",
    "onChange",
    "value",
    "as",
    "class",
    "isViewMode",
    "viewModeClass",
    "onLongPress",
    "longPressDuration",
    "onMouseDown",
    "onMouseUp",
    "onMouseLeave",
    "onTouchStart",
    "onTouchEnd",
    "onTouchCancel",
  ]);

  const { handlePressEnd, handlePressStart } = createLongPress(local);

  return (
    <Show
      fallback={
        <Dynamic
          class={`${local.isViewMode ? local.viewModeClass : local.class || ""}`}
          component={local.as || "div"}
          {...others}
          onMouseDown={local.onMouseDown}
          onMouseLeave={local.onMouseLeave}
          onMouseUp={local.onMouseUp}
          onTouchCancel={local.onTouchCancel}
          onTouchEnd={local.onTouchEnd}
          onTouchStart={local.onTouchStart}
        />
      }
      when={props.onLongPress}
    >
      <Dynamic
        class={`${local.isViewMode ? local.viewModeClass : local.class || ""}`}
        component={local.as || "div"}
        {...others}
        // setting event handlers here like {...getEventHandlers()} re-renders the childrens! not sure why that behaves that way, used <Show> to not set dynamic event handlers here
        // {...getEventHandlers()}
        onMouseDown={handlePressStart}
        onMouseLeave={handlePressEnd}
        onMouseUp={handlePressEnd}
        onTouchCancel={handlePressEnd}
        onTouchEnd={handlePressEnd}
        onTouchStart={handlePressStart}
      />
    </Show>
  );
}
