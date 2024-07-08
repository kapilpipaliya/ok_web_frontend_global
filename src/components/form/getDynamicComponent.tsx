import { GenericField } from "~/components/fields/GenericField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { TableInputField } from "~/components/fields/table_input/TableInputField";

import { genericComponents2 } from "./genericComponents2";
import { genericInputComponents } from "./genericInputComponents";

export function getDynamicComponent(component: string) {
  switch (component) {
    case "SelectBox":
    case "TagBox":
      return SelectInputField;
    case "DynamicTable":
      return TableInputField;
    default:
      if (genericInputComponents.includes(component)) {
        return GenericInputField;
      }
      if (genericComponents2.includes(component)) {
        return GenericField;
      }
      return null;
  }
}
