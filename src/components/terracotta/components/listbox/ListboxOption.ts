import type { JSX } from "solid-js";

import { createComponent, createRenderEffect, mergeProps } from "solid-js";
import { omitProps } from "solid-use/props";

import type {
  SelectOptionStateOptions,
  SelectOptionStateRenderProps,
} from "../../states/create-select-option-state";
import type {
  HeadlessPropsWithRef,
  ValidConstructor,
} from "../../utils/dynamic-prop";
import type { OmitAndMerge, Prettify } from "../../utils/types";
import type { ButtonProps } from "../button";

import { useDisclosureState } from "../../states/create-disclosure-state";
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
import { useListboxContext } from "./ListboxContext";
import { useListboxOptionsContext } from "./ListboxOptionsContext";
import { LISTBOX_OPTION_TAG } from "./tags";

export type ListboxOptionBaseProps<V> = Prettify<
  SelectOptionStateOptions<V> & SelectOptionStateRenderProps
>;

export type ListboxOptionProps<
  V,
  T extends ValidConstructor = "li",
> = HeadlessPropsWithRef<
  T,
  OmitAndMerge<ListboxOptionBaseProps<V>, ButtonProps<T>>
>;

export function ListboxOption<V, T extends ValidConstructor = "li">(
  props: ListboxOptionProps<V, T>,
): JSX.Element {
  const rootContext = useListboxContext("ListboxOptions");
  const context = useListboxOptionsContext("ListboxOptions");
  const disclosure = useDisclosureState();
  const state = createSelectOptionState(props);

  const [internalRef, setInternalRef] = createForwardRef(props);

  // I would really love to use createEffect but for some reason
  // the timing is never accurate
  createRenderEffect(() => {
    const current = internalRef();

    if (current instanceof HTMLElement) {
      useEventListener(current, "click", () => {
        if (!state.disabled()) {
          state.select();
          if (!rootContext.multiple) {
            disclosure.close();
          }
        }
      });
      useEventListener(current, "focus", () => {
        state.focus();
      });
      useEventListener(current, "blur", () => {
        state.blur();
      });
      useEventListener(current, "mouseenter", () => {
        if (!state.disabled()) {
          current.focus();
        }
      });
      useEventListener(current, "mouseleave", () => {
        if (!state.disabled()) {
          state.blur();
        }
      });
    }
  });

  return createComponent(
    Button,
    mergeProps(
      omitProps(props, ["as", "children", "disabled", "value", "ref"]),
      LISTBOX_OPTION_TAG,
      createOwnerAttribute(context.getId()),
      {
        get as() {
          return props.as || ("li" as T);
        },
        ref: setInternalRef,
        role: "option",
        tabindex: -1,
      },
      createDisabledState(() => state.disabled()),
      createARIADisabledState(() => state.disabled()),
      createSelectedState(() => state.isSelected()),
      createARIASelectedState(() => state.isSelected()),
      createActiveState(() => state.isActive()),
      {
        get children() {
          return createComponent(SelectOptionStateProvider, {
            get children() {
              return props.children;
            },
            state,
          });
        },
      },
    ) as ButtonProps<T>,
  );
}
