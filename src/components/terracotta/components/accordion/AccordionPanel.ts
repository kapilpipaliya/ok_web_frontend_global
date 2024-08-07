import type { JSX } from "solid-js";

import { createComponent, mergeProps } from "solid-js";
import { omitProps } from "solid-use/props";

import type { SelectOptionStateRenderProps } from "../../states/create-select-option-state";
import type { UnmountableProps } from "../../utils/create-unmountable";
import type {
  DynamicProps,
  HeadlessProps,
  ValidConstructor,
} from "../../utils/dynamic-prop";
import type { Prettify } from "../../utils/types";

import {
  SelectOptionStateChild,
  useSelectOptionState,
} from "../../states/create-select-option-state";
import createDynamic from "../../utils/create-dynamic";
import { createUnmountable } from "../../utils/create-unmountable";
import {
  createActiveState,
  createDisabledState,
  createExpandedState,
  createSelectedState,
} from "../../utils/state-props";
import { useAccordionItemContext } from "./AccordionItemContext";
import { ACCORDION_PANEL_TAG } from "./tags";

export type AccordionPanelBaseProps = Prettify<
  SelectOptionStateRenderProps & UnmountableProps
>;

export type AccordionPanelProps<T extends ValidConstructor = "div"> =
  HeadlessProps<T, AccordionPanelBaseProps>;

export function AccordionPanel<T extends ValidConstructor = "div">(
  props: AccordionPanelProps<T>,
): JSX.Element {
  const context = useAccordionItemContext("AccordionPanel");
  const state = useSelectOptionState();

  return createUnmountable(
    props,
    () => state.isSelected(),
    () =>
      createDynamic(
        () => props.as || ("div" as T),
        mergeProps(
          omitProps(props, ["as", "children", "unmount"]),
          ACCORDION_PANEL_TAG,
          {
            "aria-labelledby": context.buttonID,
            id: context.panelID,
          },
          createDisabledState(() => state.disabled()),
          createSelectedState(() => state.isSelected()),
          createExpandedState(() => state.isSelected()),
          createActiveState(() => state.isActive()),
          {
            get children() {
              return createComponent(SelectOptionStateChild, {
                get children() {
                  return props.children;
                },
              });
            },
          },
        ) as DynamicProps<T>,
      ),
  );
}
