import type { JSX } from 'solid-js';

import { createComponent, mergeProps } from 'solid-js';
import { omitProps } from 'solid-use/props';

import type { DisclosureStateRenderProps } from '../../states/create-disclosure-state';
import type {
  DynamicProps,
  HeadlessProps,
  ValidConstructor,
} from '../../utils/dynamic-prop';

import {
  DisclosureStateChild,
  useDisclosureState,
} from '../../states/create-disclosure-state';
import { useSelectState } from '../../states/create-select-state';
import createDynamic from '../../utils/create-dynamic';
import {
  createDisabledState,
  createExpandedState,
  createHasActiveState,
  createHasSelectedState,
} from '../../utils/state-props';
import { useListboxContext } from './ListboxContext';
import { LISTBOX_LABEL_TAG } from './tags';

export type ListboxLabelProps<T extends ValidConstructor = 'label'> =
  HeadlessProps<T, DisclosureStateRenderProps>;

export function ListboxLabel<T extends ValidConstructor = 'label'>(
  props: ListboxLabelProps<T>,
): JSX.Element {
  const context = useListboxContext('ListboxLabel');
  const disclosureState = useDisclosureState();
  const selectState = useSelectState();

  return createDynamic(
    () => props.as || ('label' as T),
    mergeProps(
      omitProps(props, ['as', 'children']),
      LISTBOX_LABEL_TAG,
      {
        get children() {
          return createComponent(DisclosureStateChild, {
            get children() {
              return props.children;
            },
          });
        },
        id: context.labelID,
      },
      createDisabledState(() => disclosureState.disabled()),
      createExpandedState(() => disclosureState.isOpen()),
      createHasSelectedState(() => selectState.hasSelected()),
      createHasActiveState(() => selectState.hasActive()),
    ) as DynamicProps<T>,
  );
}
