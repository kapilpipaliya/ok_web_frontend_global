import Accordion from "@corvu/accordion";
import Dialog from "@corvu/dialog";
import Disclosure from "@corvu/disclosure";
import Drawer from "@corvu/drawer";
// This will not work with server side rendering, because keys are lost
import { clientOnly } from "@solidjs/start";
const OtpField = clientOnly(() => import("~/components/ssr/otpfield/OtpField"));
// @ts-expect-error ignore
OtpField.Input = clientOnly(() => import("~/components/ssr/otpfield/OtpFieldInput"));
const Popover = clientOnly(() => import("~/components/ssr/popover/Popover"));
// @ts-expect-error ignore
Popover.Anchor = clientOnly(() => import("~/components/ssr/popover/PopoverAnchor"));
// @ts-expect-error ignore
Popover.Arrow = clientOnly(() => import("~/components/ssr/popover/PopoverArrow"));
// @ts-expect-error ignore
Popover.Close = clientOnly(() => import("~/components/ssr/popover/PopoverClose"));
// @ts-expect-error ignore
Popover.Content = clientOnly(() => import("~/components/ssr/popover/PopoverContent"));
// @ts-expect-error ignore
Popover.Description = clientOnly(() => import("~/components/ssr/popover/PopoverDescription"));
// @ts-expect-error ignore
Popover.Label = clientOnly(() => import("~/components/ssr/popover/PopoverLabel"));
// @ts-expect-error ignore
Popover.Overlay = clientOnly(() => import("~/components/ssr/popover/PopoverOverlay"));
// @ts-expect-error ignore
Popover.Portal = clientOnly(() => import("~/components/ssr/popover/PopoverPortal"));
// @ts-expect-error ignore
Popover.Trigger = clientOnly(() => import("~/components/ssr/popover/PopoverTrigger"));
const Resizable = clientOnly(() => import("~/components/ssr/resizer/Resizable"));
// @ts-expect-error ignore
Resizable.Handle = clientOnly(() => import("~/components/ssr/resizer/Handle"));
// @ts-expect-error ignore
Resizable.Panel = clientOnly(() => import("~/components/ssr/resizer/Panel"));

const Tooltip = clientOnly(() => import("~/components/ssr/tooltip/Tooltip"));
// @ts-expect-error ignore
Tooltip.Anchor = clientOnly(() => import("~/components/ssr/tooltip/TooltipAnchor"));
// @ts-expect-error ignore
Tooltip.Arrow = clientOnly(() => import("~/components/ssr/tooltip/TooltipArrow"));
// @ts-expect-error ignore
Tooltip.Content = clientOnly(() => import("~/components/ssr/tooltip/TooltipContent"));
// @ts-expect-error ignore
Tooltip.Portal = clientOnly(() => import("~/components/ssr/tooltip/TooltipPortal"));
// @ts-expect-error ignore
Tooltip.Trigger = clientOnly(() => import("~/components/ssr/tooltip/TooltipTrigger"));

import { Portal } from "solid-js/web";
import { Transition, TransitionGroup } from "solid-transition-group";

import { componentMap } from "~/components/css_properties/components/componentMap";
import { CheckboxField } from "~/components/fields/CheckboxField";
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

import { BoxField } from "../../fields/BoxField";
import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { PageField } from "../../fields/PageField";
import { TextField } from "../../fields/TextField";
import { FileUploader } from "../../solid_blocks/FileUploader";
import { DataField } from "~/components/fields/DataField";

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
  CheckBox: CheckboxField,
  // https://ark-ui.com/solid/docs/components/color-picker
  DynamicTable: TableInputField,
  // ErrorPage: PageField,
  FileUploader: FileUploader,
  Form: FormField,
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
  Data: DataField,
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
Alert,
Calendar...,
Dialog...,
Disclosure...,
Select,...
Tooltip,...
*/
