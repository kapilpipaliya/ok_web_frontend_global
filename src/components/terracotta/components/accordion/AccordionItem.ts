import type { JSX } from 'solid-js';

import { createComponent, createUniqueId, mergeProps } from 'solid-js';
import { omitProps } from 'solid-use/props';

import type {
  SelectOptionStateOptions,
  SelectOptionStateRenderProps,
} from '../../states/create-select-option-state';
import type {
  DynamicProps,
  HeadlessProps,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import type { Prettify } from '../../utils/types';

import {
  createSelectOptionState,
  SelectOptionStateProvider,
} from '../../states/create-select-option-state';
import createDynamic from '../../utils/create-dynamic';
import {
  createActiveState,
  createARIADisabledState,
  createDisabledState,
  createExpandedState,
  createSelectedState,
} from '../../utils/state-props';
import { useAccordionContext } from './AccordionContext';
import { AccordionItemContext } from './AccordionItemContext';
import { ACCORDION_ITEM_TAG } from './tags';

export type AccordionItemprops<V> = Prettify<
  SelectOptionStateOptions<V> & SelectOptionStateRenderProps
>;

export type AccordionItemProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, AccordionItemprops<V>>;

export function AccordionItem<V, T extends ValidConstructor = 'div'>(
  props: AccordionItemProps<V, T>,
): JSX.Element {
  useAccordionContext('AccordionItem');
  const buttonID = createUniqueId();
  const panelID = createUniqueId();
  const state = createSelectOptionState(props);

  return createComponent(AccordionItemContext.Provider, {
    get children() {
      return createDynamic(
        () => props.as || ('div' as T),
        mergeProps(
          omitProps(props, ['as', 'children', 'value', 'disabled']),
          ACCORDION_ITEM_TAG,
          createDisabledState(() => state.disabled()),
          createARIADisabledState(() => state.disabled()),
          createSelectedState(() => state.isSelected()),
          createExpandedState(() => state.isSelected()),
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
        ) as DynamicProps<T>,
      );
    },
    value: { buttonID, panelID },
  });
}
