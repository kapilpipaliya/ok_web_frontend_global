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
// import { RadioGroupField } from "~/components/fields/RadioGroupField";
import { SelectField } from "~/components/fields/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { Repeater } from "~/components/page_attr_render/Repeater";

import { BoxField } from "../../fields/BoxField";
import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { PageField } from "../../fields/PageField";
import { TextField } from "../../fields/TextField";
import { FileUploader } from "../../solid_blocks/FileUploader";
import { ZIndex } from "~/components/ZIndex";
import { Portal } from "solid-js/web";
import { CheckboxField } from "~/components/fields/CheckboxField";
import { FormError } from "~/components/fields/FormError";
import { FragmentField } from "~/components/fields/FragmentField";
import { ImageField } from "~/components/fields/ImageField";
import { IconField } from "~/components/fields/IconField";
import { KeyedContext } from "~/components/fields/KeyedContext";
import { TextInputField } from "~/components/fields/TextInputField";
import { TextAreaField } from "~/components/fields/TextArea";
import { PullToRefresh } from "~/components/fields/PullToRefresh";
import { RadioField } from "~/components/fields/RadioField";
import { RadioGroupField } from "~/components/fields/RadioGroupField";
import { Transition, TransitionGroup } from "solid-transition-group";
import { StepsRoot } from "~/components/fields/steps/StepsRoot";
import { StepsContent } from "~/components/fields/steps/ActiveStepContent";
import { Step } from "~/components/fields/steps/Step";

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
  Button: ButtonField,
  // https://ark-ui.com/solid/docs/components/color-picker
  DynamicTable: TableInputField,
  // ErrorPage: PageField,
  FileUploader: FileUploader,
  Form: FormField,
  // HtmlEditor: KobalteTextField,
  MultiSelect: SelectField,
  // Link: Link,
  Page: PageField,
  // RadioGroup: RadioGroupField,
  Repeater: Repeater,
  Select: SelectField,
  // TemplatePage: PageField,
  Text: TextField,
  // ThankYouPage: PageField,
  ZIndex,
  Portal,
  Checkbox: CheckboxField,
  FormError,
  Fragment: FragmentField,
  Image: ImageField,
  Icon: IconField,
  KeyedContext: KeyedContext,
  TextInput: TextInputField,
  TextArea: TextAreaField,
  PullToRefresh,
  Radio: RadioField,
  RadioGroup: RadioGroupField,
  Transition,
  TransitionGroup,
  StepsRoot,
  Step,
  ActiveStep: StepsContent,
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