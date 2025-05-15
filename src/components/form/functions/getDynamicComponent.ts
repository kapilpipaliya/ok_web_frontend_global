import { Show } from "solid-js/web";
import { Transition, TransitionGroup } from "solid-transition-group";

import { SlotField } from "~/components/fields/component/SlotField";
import { ComponentField } from "~/components/fields/component/ComponentField";
import { DataField } from "~/components/fields/data/DataField";
// import { RadioGroupField } from "~/components/fields/RadioGroupField";
import { SelectField } from "~/components/fields/select/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { TextInputField } from "~/components/fields/TextInputField";
import { ZIndex } from "~/components/fields/ZIndex";

// import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { HtmlField } from "../../fields/HtmlField";
import { FileUploader } from "../../styled/FileUploader";

export const componentsMap: Record<string, any> = {
  // Button: ButtonField,
  Component: ComponentField,
  Slot: SlotField,
  Data: DataField,
  // https://ark-ui.com/solid/docs/components/color-picker
  DynamicTable: TableInputField,
  FileUploader: FileUploader,
  Form: FormField,
  Html: HtmlField,
  MultiSelect: SelectField,
  // Page: PageField,
  Select: SelectField,
  Show,
  Table: TableInputField,
  TextInput: TextInputField,
  // Title: MetaTitle,
  Transition,
  TransitionGroup,
  ZIndex,
};

export function getDynamicComponent(component: string) {
  if (!component) {
    return;
  }
  return componentsMap[component];
}
