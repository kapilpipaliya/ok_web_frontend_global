import Accordion from "@corvu/accordion";
import Dialog from "@corvu/dialog";
import Disclosure from "@corvu/disclosure";
import Drawer from "@corvu/drawer";
import OtpField from "@corvu/otp-field";
import Popover from "@corvu/popover";
import Resizable from "@corvu/resizable";
import Tooltip from "@corvu/tooltip";

import { componentMap } from "~/components/css_properties/components/componentMap";
import { NotFoundComponent } from "~/components/fields/NotFoundComponent";
import { RadioGroupField } from "~/components/fields/RadioGroupField";
import { SelectField } from "~/components/fields/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { Repeater } from "~/components/page_attr_render/Repeater";

import { BoxField } from "../../fields/BoxField";
import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { PageField } from "../../fields/PageField";
import { TextField } from "../../fields/TextField";
import { FileUploader } from "../../solid_blocks/FileUploader";

export const corvuComponents = {
  Accordion,
  Dialog,
  Disclosure,
  Drawer,
  OtpField,
  Popover,
  Resizable,
  Tooltip,
};

export const componentsMap: Record<string, any> = {
  Box: BoxField,
  Button: ButtonField, // usen kobalte button
  // https://ark-ui.com/solid/docs/components/color-picker
  // ColorBox: KobalteTextField,
  DynamicTable: TableInputField,
  ErrorPage: PageField,
  FileUploader: FileUploader,
  Form: FormField,
  // HtmlEditor: KobalteTextField,
  ImageUploader: FileUploader,
  // Link: Link,
  Page: PageField,
  RadioGroup: RadioGroupField,
  Repeater: Repeater,
  SelectBox: SelectField,
  TagBox: SelectField,
  TemplatePage: PageField,
  Text: TextField,
  ThankYouPage: PageField,
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

  return componentsMap[componentKey];
}
