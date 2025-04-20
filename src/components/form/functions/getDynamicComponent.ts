import { Portal, Show } from "solid-js/web";
import { Transition, TransitionGroup } from "solid-transition-group";

import { ComponentChildrenField } from "~/components/fields/component/ComponentChildrenField";
import { ComponentField } from "~/components/fields/component/ComponentField";
import { DataField } from "~/components/fields/data/DataField";
import { IconField } from "~/components/fields/IconField";
import { NotFoundComponent } from "~/components/fields/NotFoundComponent";
// import { RadioGroupField } from "~/components/fields/RadioGroupField";
import { SelectField } from "~/components/fields/select/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { TextInputField } from "~/components/fields/TextInputField";
import { ZIndex } from "~/components/fields/ZIndex";
import { componentMap } from "~/features/css_editor/components/componentMap";
import { CheckboxField } from "~/features/css_editor/components/fields/CheckboxField";
import { TextAreaField } from "~/features/css_editor/components/fields/TextArea";

// import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { HtmlField } from "../../fields/HtmlField";
import { MetaLink, MetaMeta, MetaTitle } from "../../fields/MetaTitle";
import { FileUploader } from "../../styled/FileUploader";
// const OtpField = clientOnly(() => import("~/components/ssr/otpfield/OtpField"));
// OtpField.Input = clientOnly(() => import("~/components/ssr/otpfield/OtpFieldInput"));

export const corvuComponents = {
  // Accordion,
  // Dialog,
  // Disclosure,
  // Drawer,
  // OtpField,
  // Popover,
  // Resizable,
  // Tooltip,
};

export const componentsMap: Record<string, any> = {
  // Button: ButtonField,
  CheckBox: CheckboxField,
  Component: ComponentField,
  ComponentChildren: ComponentChildrenField,
  Data: DataField,
  // https://ark-ui.com/solid/docs/components/color-picker
  DynamicTable: TableInputField,
  FileUploader: FileUploader,
  Form: FormField,
  Html: HtmlField,
  Icon: IconField,
  Link: MetaLink,
  Meta: MetaMeta,
  MultiSelect: SelectField,
  // Page: PageField,
  Portal,
  Select: SelectField,
  Show,
  Table: TableInputField,
  TextArea: TextAreaField,
  TextInput: TextInputField,
  Title: MetaTitle,
  Transition,
  TransitionGroup,
  ZIndex,
};

export function getDynamicComponent(component: string) {
  if (!component) {
    return;
  }
  const [componentKey, subComponent] = component.split(".");

  if (componentKey.startsWith("System")) {
    const key = componentKey.replace("System", "");
    const lowerCaseKey = key.charAt(0).toLowerCase() + key.slice(1);
    return componentMap[lowerCaseKey] || NotFoundComponent;
  }
  if (corvuComponents[componentKey as keyof typeof corvuComponents]) {
    return subComponent
      ? // @ts-expect-error ignore
        corvuComponents[componentKey as keyof typeof corvuComponents][
          subComponent
        ] || NotFoundComponent
      : corvuComponents[componentKey as keyof typeof corvuComponents];
  }

  return componentsMap[componentKey];
}

/*
Calendar...,
Dialog...,
Disclosure...,
Select,...
Tooltip,...
*/
