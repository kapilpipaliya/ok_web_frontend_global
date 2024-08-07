import { createContext, useContext } from "solid-js";

import assert from "../../utils/assert";

interface AlertDialogContextData {
  descriptionID: string;
  ownerID: string;
  panelID: string;
  titleID: string;
}

export const AlertDialogContext = createContext<AlertDialogContextData>();

export function useAlertDialogContext(
  componentName: string,
): AlertDialogContextData {
  const context = useContext(AlertDialogContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <AlertDialog>`),
  );
  return context;
}
