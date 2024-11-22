import Accordion from "@corvu/accordion";
import Dialog from "@corvu/dialog";
import Disclosure from "@corvu/disclosure";
import Drawer from "@corvu/drawer";
import OtpField from "@corvu/otp-field";
import Popover from "@corvu/popover";
import Resizable from "@corvu/resizable";
import Tooltip from "@corvu/tooltip";
import { Portal } from "solid-js/web";
import { Transition, TransitionGroup } from "solid-transition-group";

import { componentMap } from "~/components/css_properties/components/componentMap";
import { CheckboxField } from "~/components/fields/CheckboxField";
import { FormError } from "~/components/fields/FormError";
import { FragmentField } from "~/components/fields/FragmentField";
import { IconField } from "~/components/fields/IconField";
import { ImageField } from "~/components/fields/ImageField";
import { KeyedContext } from "~/components/fields/KeyedContext";
import { NotFoundComponent } from "~/components/fields/NotFoundComponent";
import { PullToRefresh } from "~/components/fields/PullToRefresh";
import { RadioField } from "~/components/fields/RadioField";
import { RadioGroupField } from "~/components/fields/RadioGroupField";
// import { RadioGroupField } from "~/components/fields/RadioGroupField";
import { SelectField } from "~/components/fields/SelectField";
import { StepsContent } from "~/components/fields/steps/ActiveStepContent";
import { Step } from "~/components/fields/steps/Step";
import { StepsRoot } from "~/components/fields/steps/StepsRoot";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { TextAreaField } from "~/components/fields/TextArea";
import { TextInputField } from "~/components/fields/TextInputField";
import { ZIndex } from "~/components/fields/ZIndex";
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
  ActiveStep: StepsContent,
  Box: BoxField,
  Button: ButtonField,
  Checkbox: CheckboxField,
  // https://ark-ui.com/solid/docs/components/color-picker
  DynamicTable: TableInputField,
  // ErrorPage: PageField,
  FileUploader: FileUploader,
  Form: FormField,
  FormError,
  Fragment: FragmentField,
  Icon: IconField,
  Image: ImageField,
  KeyedContext: KeyedContext,
  // HtmlEditor: KobalteTextField,
  MultiSelect: SelectField,
  // Link: Link,
  Page: PageField,
  Portal,
  PullToRefresh,
  Radio: RadioField,
  RadioGroup: RadioGroupField,
  // RadioGroup: RadioGroupField,
  Repeater: Repeater,
  Select: SelectField,
  Step,
  Steps: StepsRoot,
  // TemplatePage: PageField,
  Text: TextField,
  TextArea: TextAreaField,
  TextInput: TextInputField,
  Transition,
  TransitionGroup,
  // ThankYouPage: PageField,
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

  return componentsMap[componentKey];
}

/*
Alert,
Calendar...,
Dialog...,
Disclosure...,
Select,...
Tooltip,...
*/
