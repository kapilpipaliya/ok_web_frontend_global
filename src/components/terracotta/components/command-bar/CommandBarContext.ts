import { createContext, useContext } from 'solid-js';

import assert from '../../utils/assert';

interface CommandBarContextData {
  descriptionID: string;
  onClose?: () => void;
  onOpen?: () => void;
  ownerID: string;
  panelID: string;
  titleID: string;
}

export const CommandBarContext = createContext<CommandBarContextData>();

export function useCommandBarContext(
  componentName: string,
): CommandBarContextData {
  const context = useContext(CommandBarContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <CommandBar>`),
  );
  return context;
}
