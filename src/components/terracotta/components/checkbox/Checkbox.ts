import type { JSX } from "solid-js";

import { createComponent, createUniqueId, mergeProps } from "solid-js";
import { omitProps } from "solid-use/props";

import type {
  CheckStateControlledOptions,
  CheckStateRenderProps,
  CheckStateUncontrolledOptions,
} from "../../states/create-check-state";
import type {
  DynamicProps,
  HeadlessProps,
  ValidConstructor,
} from "../../utils/dynamic-prop";
import type { Prettify } from "../../utils/types";

import {
  CheckStateProvider,
  createCheckState,
} from "../../states/create-check-state";
import createDynamic from "../../utils/create-dynamic";
import {
  createARIADisabledState,
  createCheckedState,
  createDisabledState,
} from "../../utils/state-props";
import { CheckboxContext } from "./CheckboxContext";
import { CHECKBOX_TAG } from "./tags";

export type CheckboxControlledBaseProps = Prettify<
  CheckStateControlledOptions & CheckStateRenderProps
>;

export type CheckboxControlledProps<T extends ValidConstructor = "div"> =
  HeadlessProps<T, CheckboxControlledBaseProps>;

export type CheckboxProps<T extends ValidConstructor = "div"> =
  | CheckboxControlledProps<T>
  | CheckboxUncontrolledProps<T>;

export type CheckboxUncontrolledBaseProps = Prettify<
  CheckStateRenderProps & CheckStateUncontrolledOptions
>;

export type CheckboxUncontrolledProps<T extends ValidConstructor = "div"> =
  HeadlessProps<T, CheckboxUncontrolledBaseProps>;

export function Checkbox<T extends ValidConstructor = "div">(
  props: CheckboxProps<T>,
): JSX.Element {
  const ownerID = createUniqueId();
  const labelID = createUniqueId();
  const indicatorID = createUniqueId();
  const descriptionID = createUniqueId();

  const state = createCheckState(props);

  return createComponent(CheckboxContext.Provider, {
    get children() {
      return createDynamic(
        () => props.as || "div",
        mergeProps(
          isCheckboxUncontrolled(props)
            ? omitProps(props, [
                "as",
                "children",
                "defaultChecked",
                "disabled",
                "onChange",
              ])
            : omitProps(props, [
                "as",
                "children",
                "checked",
                "disabled",
                "onChange",
              ]),
          CHECKBOX_TAG,
          createDisabledState(() => state.disabled()),
          createARIADisabledState(() => state.disabled()),
          createCheckedState(() => state.checked()),
          {
            get children() {
              return createComponent(CheckStateProvider, {
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
    value: {
      descriptionID,
      indicatorID,
      labelID,
      ownerID,
    },
  });
}

function isCheckboxUncontrolled<T extends ValidConstructor = "div">(
  props: CheckboxProps<T>,
): props is CheckboxUncontrolledProps<T> {
  return "defaultChecked" in props;
}
