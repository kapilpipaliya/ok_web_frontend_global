import type { JSX } from "solid-js";

import { createComponent, createEffect, mergeProps } from "solid-js";
import { omitProps } from "solid-use/props";

import type {
  SelectOptionStateOptions,
  SelectOptionStateRenderProps,
} from "../../states/create-select-option-state";
import type {
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from "../../utils/dynamic-prop";
import type { Prettify } from "../../utils/types";

import {
  createSelectOptionState,
  SelectOptionStateProvider,
} from "../../states/create-select-option-state";
import { createForwardRef } from "../../utils/dynamic-prop";
import { createOwnerAttribute } from "../../utils/focus-navigator";
import {
  createActiveState,
  createARIADisabledState,
  createARIASelectedState,
  createDisabledState,
  createSelectedState,
} from "../../utils/state-props";
import useEventListener from "../../utils/use-event-listener";
import { Button } from "../button";
import { useTabGroupContext } from "./TabGroupContext";
import { useTabListContext } from "./TabListContext";
import { TAB_TAG } from "./tags";

export type TabBaseProps<V> = Prettify<
  SelectOptionStateOptions<V> & SelectOptionStateRenderProps
>;

export type TabProps<
  V,
  T extends ValidConstructor = "div",
> = HeadlessPropsWithRef<T, TabBaseProps<V>>;

export function Tab<V, T extends ValidConstructor = "div">(
  props: TabProps<V, T>,
): JSX.Element {
  const rootContext = useTabGroupContext("Tab");
  const listContext = useTabListContext("Tab");

  const [internalRef, setInternalRef] = createForwardRef(props);
  const state = createSelectOptionState(props);

  createEffect(() => {
    const current = internalRef();
    if (current instanceof HTMLElement) {
      useEventListener(current, "click", () => {
        state.select();
      });
      useEventListener(current, "focus", () => {
        state.focus();
        state.select();
      });
      useEventListener(current, "blur", () => {
        state.blur();
        state.select();
      });
    }
  });
  return createComponent(
    Button,
    mergeProps(
      omitProps(props, ["as", "children", "value", "disabled", "ref"]),
      TAB_TAG,
      createOwnerAttribute(listContext.getId()),
      {
        get "aria-controls"() {
          return rootContext.getId("tab-panel", props.value);
        },
        get as() {
          return props.as || ("div" as T);
        },
        get children() {
          return createComponent(SelectOptionStateProvider, {
            get children() {
              return props.children;
            },
            state,
          });
        },
        get id() {
          return rootContext.getId("tab", props.value);
        },
        ref: setInternalRef,
        role: "tab",
        get tabindex() {
          const selected = state.isSelected();
          return state.disabled() || !selected ? -1 : 0;
        },
      },
      createDisabledState(() => state.disabled()),
      createARIADisabledState(() => state.disabled()),
      createSelectedState(() => state.isSelected()),
      createARIASelectedState(() => state.isSelected()),
      createActiveState(() => state.isActive()),
    ) as DynamicProps<T>,
  );
}
