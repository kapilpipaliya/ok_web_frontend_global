import { useContext } from "solid-js";

import type { DialogContext } from "~/components/fields/dialog/DialogContext";
import type { TableFieldStoreContext } from "~/components/fields/table_field/TableContext";
import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { RenderStore } from "~/components/form/RenderContext";

import { useKeyedContext } from "~/utils/keyedContext";

export function onStepSaveClick(options: FunctionArgumentType) {
  const dialogContextProvider = useKeyedContext<typeof DialogContext>("dialog");
  const dialogContext = useContext(dialogContextProvider);
  const formValue = options.formValueStore;
  const parentItemsMeta = options.parentItems as RenderStore[];
  const parentForm = [...parentItemsMeta]
    .reverse()
    .find((item) => item[0].meta.componentName === "form");
  const parentItemsOnChange = parentForm[0].parentOnChange;
  parentItemsOnChange(JSON.parse(JSON.stringify(formValue)));

  const tableContextProvider =
    useKeyedContext<typeof TableFieldStoreContext>("table");
  const tableContext = useContext(tableContextProvider);
  tableContext[0].validateCurrentRow(tableContext[0].selectedRowIndex);
  dialogContext.close();
}
