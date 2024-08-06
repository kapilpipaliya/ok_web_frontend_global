import type { JSX } from 'solid-js';

import {
  createComponent,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
} from 'solid-js';
import { omitProps } from 'solid-use/props';

import type {
  MultipleAutocompleteStateControlledOptions,
  MultipleAutocompleteStateUncontrolledOptions,
  SingleAutocompleteStateControlledOptions,
  SingleAutocompleteStateUncontrolledOptions,
} from '../../states/create-autocomplete-state';
import type {
  DisclosureStateControlledOptions,
  DisclosureStateUncontrolledOptions,
} from '../../states/create-disclosure-state';
import type {
  DynamicProps,
  HeadlessProps,
  ValidConstructor,
} from '../../utils/dynamic-prop';
import type { Prettify } from '../../utils/types';

import {
  AutocompleteStateProvider,
  createMultipleAutocompleteState,
  createSingleAutocompleteState,
} from '../../states/create-autocomplete-state';
import {
  createDisclosureState,
  DisclosureStateProvider,
} from '../../states/create-disclosure-state';
import createDynamic from '../../utils/create-dynamic';
import {
  createARIADisabledState,
  createDisabledState,
  createExpandedState,
  createHasActiveState,
  createHasSelectedState,
} from '../../utils/state-props';
import {
  ComboboxContext,
  createComboboxOptionFocusNavigator,
} from './ComboboxContext';
import { COMBOBOX_TAG } from './tags';

export interface ComboboxBaseProps {
  onDisclosureChange?: (value: boolean) => void;
}

export interface ComboboxMultipleBaseProps<V> {
  onSelectChange?: (value: V[]) => void;
}

export interface ComboboxSingleBaseProps<V> {
  onSelectChange?: (value?: V) => void;
}

// SCSCD = Single, Controlled Select, Controlled Disclosure
export type ComboboxSCSCDBaseProps<V> = Prettify<
  {
      children?: JSX.Element;
    } &
    ComboboxBaseProps &
    ComboboxSingleBaseProps<V> &
    Omit<DisclosureStateControlledOptions, 'onChange'> & Omit<SingleAutocompleteStateControlledOptions<V>, 'onChange'>
>;

export type ComboboxSCSCDProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, ComboboxSCSCDBaseProps<V>>;

// SCSCD = Single, Controlled Select, Uncontrolled Disclosure
export type ComboboxSCSUDBaseProps<V> = Prettify<
  {
      children?: JSX.Element;
    } &
    ComboboxBaseProps &
    ComboboxSingleBaseProps<V> &
    Omit<DisclosureStateUncontrolledOptions, 'onChange'> & Omit<SingleAutocompleteStateControlledOptions<V>, 'onChange'>
>;

export type ComboboxSCSUDProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, ComboboxSCSUDBaseProps<V>>;

// SCSCD = Single, Uncontrolled Select, Controlled Disclosure
export type ComboboxSUSCDBaseProps<V> = Prettify<
  {
      children?: JSX.Element;
    } &
    ComboboxBaseProps &
    ComboboxSingleBaseProps<V> &
    Omit<DisclosureStateControlledOptions, 'onChange'> & Omit<SingleAutocompleteStateUncontrolledOptions<V>, 'onChange'>
>;

export type ComboboxSUSCDProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, ComboboxSUSCDBaseProps<V>>;

// SCSCD = Single, Uncontrolled Select, Uncontrolled Disclosure
export type ComboboxSUSUDBaseProps<V> = Prettify<
  {
      children?: JSX.Element;
    } &
    ComboboxBaseProps &
    ComboboxSingleBaseProps<V> &
    Omit<DisclosureStateUncontrolledOptions, 'onChange'> & Omit<SingleAutocompleteStateUncontrolledOptions<V>, 'onChange'>
>;

export type ComboboxSUSUDProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, ComboboxSUSUDBaseProps<V>>;

export type ComboboxSingleProps<V, T extends ValidConstructor = 'div'> =
  | ComboboxSCSCDProps<V, T>
  | ComboboxSCSUDProps<V, T>
  | ComboboxSUSCDProps<V, T>
  | ComboboxSUSUDProps<V, T>;

// MCSCD = Multiple, Controlled Select, Controlled Disclosure
export type ComboboxMCSCDBaseProps<V> = Prettify<
  {
      children?: JSX.Element;
    } &
    ComboboxBaseProps &
    ComboboxMultipleBaseProps<V> &
    Omit<DisclosureStateControlledOptions, 'onChange'> & Omit<MultipleAutocompleteStateControlledOptions<V>, 'onChange'>
>;

export type ComboboxMCSCDProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, ComboboxMCSCDBaseProps<V>>;

// MCSCD = Multiple, Controlled Select, Uncontrolled Disclosure
export type ComboboxMCSUDBaseProps<V> = Prettify<
  {
      children?: JSX.Element;
    } &
    ComboboxBaseProps &
    ComboboxMultipleBaseProps<V> &
    Omit<DisclosureStateUncontrolledOptions, 'onChange'> & Omit<MultipleAutocompleteStateControlledOptions<V>, 'onChange'>
>;

export type ComboboxMCSUDProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, ComboboxMCSUDBaseProps<V>>;

// MCSCD = Multiple, Uncontrolled Select, Controlled Disclosure
export type ComboboxMUSCDBaseProps<V> = Prettify<
  {
      children?: JSX.Element;
    } &
    ComboboxBaseProps &
    ComboboxMultipleBaseProps<V> &
    Omit<DisclosureStateControlledOptions, 'onChange'> & Omit<MultipleAutocompleteStateUncontrolledOptions<V>, 'onChange'>
>;

export type ComboboxMUSCDProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, ComboboxMUSCDBaseProps<V>>;

// MCSCD = Multiple, Uncontrolled Select, Uncontrolled Disclosure
export type ComboboxMUSUDBaseProps<V> = Prettify<
  {
      children?: JSX.Element;
    } &
    ComboboxBaseProps &
    ComboboxMultipleBaseProps<V> &
    Omit<DisclosureStateUncontrolledOptions, 'onChange'> & Omit<MultipleAutocompleteStateUncontrolledOptions<V>, 'onChange'>
>;

export type ComboboxMUSUDProps<
  V,
  T extends ValidConstructor = 'div',
> = HeadlessProps<T, ComboboxMUSUDBaseProps<V>>;

export type ComboboxMultipleProps<V, T extends ValidConstructor = 'div'> =
  | ComboboxMCSCDProps<V, T>
  | ComboboxMCSUDProps<V, T>
  | ComboboxMUSCDProps<V, T>
  | ComboboxMUSUDProps<V, T>;

type ComboboxSelectUncontrolledProps<V, T extends ValidConstructor = 'div'> =
  | ComboboxMUSCDProps<V, T>
  | ComboboxMUSUDProps<V, T>
  | ComboboxSUSCDProps<V, T>
  | ComboboxSUSUDProps<V, T>;

type ComboboxDisclosureUncontrolledProps<
  V,
  T extends ValidConstructor = 'div',
> =
  | ComboboxMCSUDProps<V, T>
  | ComboboxMUSUDProps<V, T>
  | ComboboxSCSUDProps<V, T>
  | ComboboxSUSUDProps<V, T>;

export type ComboboxProps<V, T extends ValidConstructor = 'div'> =
  | ComboboxMultipleProps<V, T>
  | ComboboxSingleProps<V, T>;

function isComboboxMultiple<V, T extends ValidConstructor = 'div'>(
  props: ComboboxProps<V, T>,
): props is ComboboxMultipleProps<V, T> {
  return !!props.multiple;
}

function isComboboxSelectUncontrolled<V, T extends ValidConstructor = 'div'>(
  props: ComboboxProps<V, T>,
): props is ComboboxSelectUncontrolledProps<V, T> {
  return 'defaultValue' in props;
}

function isComboboxDisclosureUncontrolled<
  V,
  T extends ValidConstructor = 'div',
>(
  props: ComboboxProps<V, T>,
): props is ComboboxDisclosureUncontrolledProps<V, T> {
  return 'defaultOpen' in props;
}

function getProps<V, T extends ValidConstructor = 'div'>(
  props: ComboboxProps<V, T>,
): DynamicProps<T> {
  if (isComboboxSelectUncontrolled(props)) {
    if (isComboboxDisclosureUncontrolled(props)) {
      return omitProps(props, [
        'as',
        'by',
        'children',
        'defaultOpen',
        'defaultValue',
        'disabled',
        'matchBy',
        'multiple',
        'onClose',
        'onDisclosureChange',
        'onOpen',
        'onSelectChange',
        'toggleable',
      ]) as DynamicProps<T>;
    }
    return omitProps(props, [
      'as',
      'by',
      'children',
      'defaultValue',
      'disabled',
      'isOpen',
      'matchBy',
      'multiple',
      'onClose',
      'onDisclosureChange',
      'onOpen',
      'onSelectChange',
      'toggleable',
    ]) as DynamicProps<T>;
  }
  if (isComboboxDisclosureUncontrolled(props)) {
    return omitProps(props, [
      'as',
      'by',
      'children',
      'defaultOpen',
      'disabled',
      'matchBy',
      'multiple',
      'onClose',
      'onDisclosureChange',
      'onOpen',
      'onSelectChange',
      'toggleable',
      'value',
    ]) as DynamicProps<T>;
  }
  return omitProps(props, [
    'as',
    'by',
    'children',
    'disabled',
    'isOpen',
    'matchBy',
    'multiple',
    'onClose',
    'onDisclosureChange',
    'onOpen',
    'onSelectChange',
    'toggleable',
    'value',
  ]) as DynamicProps<T>;
}

export function Combobox<V, T extends ValidConstructor = 'div'>(
  props: ComboboxProps<V, T>,
): JSX.Element {
  return createMemo(() => {
    const labelID = createUniqueId();
    const inputID = createUniqueId();
    const optionsID = createUniqueId();

    const disclosureState = createDisclosureState(
      mergeProps(props, {
        onChange(value: boolean) {
          if (props.onDisclosureChange) {
            props.onDisclosureChange(value);
          }
        },
      }),
    );

    const autocompleteState = isComboboxMultiple(props)
      ? createMultipleAutocompleteState(
          mergeProps(props, {
            onChange(value: V[]) {
              if (props.onSelectChange) {
                props.onSelectChange(value);
              }
            },
          }),
        )
      : createSingleAutocompleteState(
          mergeProps(props, {
            onChange(value?: V) {
              if (props.onSelectChange) {
                props.onSelectChange(value);
              }
            },
          }),
        );

    const controller = createComboboxOptionFocusNavigator();
    const [activeDescendant, setActiveDescendant] = createSignal<string>();
    const [selectedDescendant, setSelectedDescendant] = createSignal<
      string | undefined
    >(undefined, {
      equals: false,
    });

    createEffect(() => {
      if (!autocompleteState.hasActive()) {
        setActiveDescendant(undefined);
      }
    });

    return createComponent(ComboboxContext.Provider, {
      get children() {
        return createComponent(AutocompleteStateProvider, {
          get children() {
            return createComponent(DisclosureStateProvider, {
              get children() {
                return createDynamic(
                  () => props.as || 'div',
                  mergeProps(
                    getProps(props),
                    COMBOBOX_TAG,
                    {
                      'aria-labelledby': labelID,
                      get children() {
                        return props.children;
                      },
                    },
                    createDisabledState(() => autocompleteState.disabled()),
                    createARIADisabledState(() => autocompleteState.disabled()),
                    createHasSelectedState(() =>
                      autocompleteState.hasSelected(),
                    ),
                    createHasActiveState(() => autocompleteState.hasActive()),
                    createExpandedState(() => disclosureState.isOpen()),
                  ) as DynamicProps<T>,
                );
              },
              state: disclosureState,
            });
          },
          state: autocompleteState,
        });
      },
      value: {
        get activeDescendant() {
          return activeDescendant();
        },
        set activeDescendant(value: string | undefined) {
          setActiveDescendant(value);
        },
        controller,
        inputHovering: false,
        inputID,
        labelID,
        get multiple() {
          return props.multiple;
        },
        optionsHovering: false,
        optionsID,
        get selectedDescendant() {
          return selectedDescendant();
        },
        set selectedDescendant(value: string | undefined) {
          setSelectedDescendant(value);
        },
      },
    });
  }) as unknown as JSX.Element;
}
