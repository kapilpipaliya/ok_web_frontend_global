import { createContext, createUniqueId, useContext } from "solid-js";

import assert from "../../utils/assert";
import FocusNavigator from "../../utils/focus-navigator";
import { MATCHES_NODE } from "../../utils/namespace";

interface CommandContextData {
  activeDescendant: string | undefined;
  anchor?: HTMLElement | null;
  controller: FocusNavigator;
  inputID: string;
  labelID: string;
  multiple: boolean;
  optionsHovering: boolean;
  optionsID: string;
  selectedDescendant: string | undefined;
}

export const CommandContext = createContext<CommandContextData>();

export function useCommandContext(componentName: string): CommandContextData {
  const context = useContext(CommandContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <Command>`),
  );
  return context;
}

export function createCommandOptionFocusNavigator(): FocusNavigator {
  return new FocusNavigator(createUniqueId(), {
    base: MATCHES_NODE,
    virtual: true,
  });
}
