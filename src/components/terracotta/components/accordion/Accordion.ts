import type { JSX } from "solid-js";

import {
  createComponent,
  createEffect,
  createMemo,
  mergeProps,
  onCleanup,
} from "solid-js";
import { omitProps } from "solid-use/props";

import type {
  MultipleSelectStateControlledOptions,
  MultipleSelectStateUncontrolledOptions,
  SelectStateRenderProps,
  SingleSelectStateControlledOptions,
  SingleSelectStateUncontrolledOptions,
} from "../../states/create-select-state";
import type {
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from "../../utils/dynamic-prop";
import type { Prettify } from "../../utils/types";

import {
  createMultipleSelectState,
  createSingleSelectState,
  SelectStateProvider,
} from "../../states/create-select-state";
import createDynamic from "../../utils/create-dynamic";
import { createForwardRef } from "../../utils/dynamic-prop";
import {
  createARIADisabledState,
  createDisabledState,
  createHasActiveState,
  createHasSelectedState,
} from "../../utils/state-props";
import useEventListener from "../../utils/use-event-listener";
import {
  AccordionContext,
  createAccordionFocusNavigator,
} from "./AccordionContext";
import { ACCORDION_TAG } from "./tags";

export type AccordionSingleControlledBaseProps<V> = Prettify<
  SelectStateRenderProps<V> & SingleSelectStateControlledOptions<V>
>;

export type AccordionSingleControlledProps<
  V,
  T extends ValidConstructor = "div",
> = HeadlessPropsWithRef<T, AccordionSingleControlledBaseProps<V>>;

export type AccordionSingleUncontrolledBaseProps<V> = Prettify<
  SelectStateRenderProps<V> & SingleSelectStateUncontrolledOptions<V>
>;

export type AccordionSingleUncontrolledProps<
  V,
  T extends ValidConstructor = "div",
> = HeadlessPropsWithRef<T, AccordionSingleUncontrolledBaseProps<V>>;

export type AccordionMultipleControlledBaseProps<V> = Prettify<
  MultipleSelectStateControlledOptions<V> & SelectStateRenderProps<V>
>;

export type AccordionMultipleControlledProps<
  V,
  T extends ValidConstructor = "div",
> = HeadlessPropsWithRef<T, AccordionMultipleControlledBaseProps<V>>;

export type AccordionMultipleUncontrolledBaseProps<V> = Prettify<
  MultipleSelectStateUncontrolledOptions<V> & SelectStateRenderProps<V>
>;

export type AccordionMultipleUncontrolledProps<
  V,
  T extends ValidConstructor = "div",
> = HeadlessPropsWithRef<T, AccordionMultipleUncontrolledBaseProps<V>>;

export type AccordionProps<V, T extends ValidConstructor = "div"> =
  | AccordionMultipleControlledProps<V, T>
  | AccordionMultipleUncontrolledProps<V, T>
  | AccordionSingleControlledProps<V, T>
  | AccordionSingleUncontrolledProps<V, T>;

function isAccordionUncontrolled<V, T extends ValidConstructor = "div">(
  props: AccordionProps<V, T>,
): props is
  | AccordionMultipleUncontrolledProps<V, T>
  | AccordionSingleUncontrolledProps<V, T> {
  return "defaultValue" in props;
}

function isAccordionMultiple<V, T extends ValidConstructor = "div">(
  props: AccordionProps<V, T>,
): props is
  | AccordionMultipleControlledProps<V, T>
  | AccordionMultipleUncontrolledProps<V, T> {
  return !!props.multiple;
}

export function Accordion<V, T extends ValidConstructor = "div">(
  props: AccordionProps<V, T>,
): JSX.Element {
  return createMemo(() => {
    const state = isAccordionMultiple(props)
      ? createMultipleSelectState(props)
      : createSingleSelectState(props);
    const controller = createAccordionFocusNavigator();
    const [ref, setRef] = createForwardRef(props);

    createEffect(() => {
      const current = ref();
      if (current instanceof HTMLElement) {
        controller.setRef(current);
        onCleanup(() => {
          controller.clearRef();
        });
        useEventListener(current, "keydown", (e) => {
          if (!state.disabled()) {
            switch (e.key) {
              case "ArrowDown": {
                e.preventDefault();
                controller.setNextChecked(true);
                break;
              }
              case "ArrowUp": {
                e.preventDefault();
                controller.setPrevChecked(true);
                break;
              }
              case "End": {
                e.preventDefault();
                controller.setLastChecked();
                break;
              }
              case "Home": {
                e.preventDefault();
                controller.setFirstChecked();
                break;
              }
              default:
                break;
            }
          }
        });
        useEventListener(current, "focusin", (e) => {
          if (e.target && e.target !== current) {
            controller.setCurrent(e.target as HTMLElement);
          }
        });
      }
    });

    return createComponent(AccordionContext.Provider, {
      get children() {
        return createDynamic(
          () => props.as || ("div" as T),
          mergeProps(
            isAccordionUncontrolled(props)
              ? omitProps(props, [
                  "as",
                  "by",
                  "children",
                  "defaultValue",
                  "disabled",
                  "multiple",
                  "onChange",
                  "ref",
                  "toggleable",
                ])
              : omitProps(props, [
                  "as",
                  "by",
                  "children",
                  "value",
                  "disabled",
                  "multiple",
                  "onChange",
                  "ref",
                  "toggleable",
                ]),
            ACCORDION_TAG,
            {
              id: controller.getId(),
              ref: setRef,
            },
            createDisabledState(() => state.disabled()),
            createARIADisabledState(() => state.disabled()),
            createHasSelectedState(() => state.hasSelected()),
            createHasActiveState(() => state.hasActive()),
            {
              get children() {
                return createComponent(SelectStateProvider, {
                  get children() {
                    return props.children;
                  },
                  state,
                });
              },
            },
          ) as DynamicProps<T>,
        );
      },
      value: controller,
    });
  }) as unknown as JSX.Element;
}
