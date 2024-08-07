import type { JSX } from "solid-js";

import { createComponent, mergeProps } from "solid-js";
import { omitProps } from "solid-use/props";

import type { DisclosureStateRenderProps } from "../../states/create-disclosure-state";
import type { UnmountableProps } from "../../utils/create-unmountable";
import type {
  DynamicProps,
  HeadlessProps,
  ValidConstructor,
} from "../../utils/dynamic-prop";
import type { Prettify } from "../../utils/types";

import {
  DisclosureStateChild,
  useDisclosureState,
} from "../../states/create-disclosure-state";
import createDynamic from "../../utils/create-dynamic";
import { createUnmountable } from "../../utils/create-unmountable";
import {
  createDisabledState,
  createExpandedState,
} from "../../utils/state-props";
import { useDisclosureContext } from "./DisclosureContext";
import { DISCLOSURE_PANEL_TAG } from "./tags";

export type DisclosurePanelBaseProps = Prettify<
  DisclosureStateRenderProps & UnmountableProps
>;

export type DisclosurePanelProps<T extends ValidConstructor = "div"> =
  HeadlessProps<T, DisclosurePanelBaseProps>;

export function DisclosurePanel<T extends ValidConstructor = "div">(
  props: DisclosurePanelProps<T>,
): JSX.Element {
  const context = useDisclosureContext("DisclosurePanel");
  const state = useDisclosureState();

  return createUnmountable(
    props,
    () => state.isOpen(),
    () =>
      createDynamic(
        () => props.as || ("div" as T),
        mergeProps(
          omitProps(props, ["as", "unmount", "children"]),
          DISCLOSURE_PANEL_TAG,
          {
            get children() {
              return createComponent(DisclosureStateChild, {
                get children() {
                  return props.children;
                },
              });
            },
            id: context.panelID,
          },
          createDisabledState(() => state.disabled()),
          createExpandedState(() => state.isOpen()),
        ) as DynamicProps<T>,
      ),
  );
}
