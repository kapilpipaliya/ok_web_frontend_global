import { createContext, createUniqueId, useContext } from 'solid-js';

import assert from '../../utils/assert';
import FocusNavigator from '../../utils/focus-navigator';
import { MATCHES_NODE } from '../../utils/namespace';

interface ComboboxContextData {
  activeDescendant: string | undefined;
  anchor?: HTMLElement | null;
  controller: FocusNavigator;
  inputHovering: boolean;
  inputID: string;
  labelID: string;
  multiple?: boolean;
  optionsHovering: boolean;
  optionsID: string;
  selectedDescendant: string | undefined;
}

export const ComboboxContext = createContext<ComboboxContextData>();

export function useComboboxContext(componentName: string): ComboboxContextData {
  const context = useContext(ComboboxContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <Combobox>`),
  );
  return context;
}

export function createComboboxOptionFocusNavigator(): FocusNavigator {
  return new FocusNavigator(createUniqueId(), {
    base: MATCHES_NODE,
    virtual: true,
  });
}
