// import Accordion from "@corvu/accordion";
// import Dialog from "@corvu/dialog";
// import Disclosure from "@corvu/disclosure";
// import Drawer from "@corvu/drawer";
// This will not work with server side rendering, because keys are lost
import { clientOnly } from "@solidjs/start";
// const OtpField = clientOnly(() => import("~/components/ssr/otpfield/OtpField"));
// OtpField.Input = clientOnly(() => import("~/components/ssr/otpfield/OtpFieldInput"));
const Popover = clientOnly(() => import("~/components/ssr/popover/Popover"));
// @ts-expect-error ignore
Popover.Anchor = clientOnly(
  () => import("~/components/ssr/popover/PopoverAnchor"),
);
// @ts-expect-error ignore
Popover.Arrow = clientOnly(
  () => import("~/components/ssr/popover/PopoverArrow"),
);
// @ts-expect-error ignore
Popover.Close = clientOnly(
  () => import("~/components/ssr/popover/PopoverClose"),
);
// @ts-expect-error ignore
Popover.Content = clientOnly(
  () => import("~/components/ssr/popover/PopoverContent"),
);
// @ts-expect-error ignore
Popover.Description = clientOnly(
  () => import("~/components/ssr/popover/PopoverDescription"),
);
// @ts-expect-error ignore
Popover.Label = clientOnly(
  () => import("~/components/ssr/popover/PopoverLabel"),
);
// @ts-expect-error ignore
Popover.Overlay = clientOnly(
  () => import("~/components/ssr/popover/PopoverOverlay"),
);
// @ts-expect-error ignore
Popover.Portal = clientOnly(
  () => import("~/components/ssr/popover/PopoverPortal"),
);
// @ts-expect-error ignore
Popover.Trigger = clientOnly(
  () => import("~/components/ssr/popover/PopoverTrigger"),
);
// const Resizable = clientOnly(() => import("~/components/ssr/resizer/Resizable"));
// Resizable.Handle = clientOnly(() => import("~/components/ssr/resizer/Handle"));
// Resizable.Panel = clientOnly(() => import("~/components/ssr/resizer/Panel"));

const Tooltip = clientOnly(() => import("~/components/ssr/tooltip/Tooltip"));
// @ts-expect-error ignore
Tooltip.Anchor = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipAnchor"),
);
// @ts-expect-error ignore
Tooltip.Arrow = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipArrow"),
);
// @ts-expect-error ignore
Tooltip.Content = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipContent"),
);
// @ts-expect-error ignore
Tooltip.Portal = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipPortal"),
);
// @ts-expect-error ignore
Tooltip.Trigger = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipTrigger"),
);

import { Match, Portal, Show, Switch } from "solid-js/web";
import { Transition, TransitionGroup } from "solid-transition-group";

import { componentMap } from "~/features/css_editor/components/componentMap";
import { CheckboxField } from "~/features/css_editor/components/fields/CheckboxField";
import { TextAreaField } from "~/features/css_editor/components/fields/TextArea";
import { ComponentChildrenField } from "~/components/fields/component/ComponentChildrenField";
import { ComponentField } from "~/components/fields/component/ComponentField";
import { DataField } from "~/components/fields/data/DataField";
import { FragmentField } from "~/components/fields/FragmentField";
import { IconField } from "~/components/fields/IconField";
import { NotFoundComponent } from "~/components/fields/NotFoundComponent";
// import { RadioGroupField } from "~/components/fields/RadioGroupField";
import { SelectField } from "~/components/fields/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { TextInputField } from "~/components/fields/TextInputField";
import { ZIndex } from "~/components/fields/ZIndex";

import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { HtmlField } from "../../fields/HtmlField";
import { PageField } from "../../fields/PageField";
import { TextField } from "../../fields/TextField";
import { FileUploader } from "../../styled/FileUploader";

export const corvuComponents = {
  // Accordion,
  // Dialog,
  // Disclosure,
  // Drawer,
  // OtpField,
  Popover,
  // Resizable,
  Tooltip,
};

export const componentsMap: Record<string, any> = {
  Box: HtmlField,
  Button: ButtonField,
  CheckBox: CheckboxField,
  Component: ComponentField,
  ComponentChildren: ComponentChildrenField,
  Data: DataField,
  // https://ark-ui.com/solid/docs/components/color-picker
  DynamicTable: TableInputField,
  FileUploader: FileUploader,
  Form: FormField,
  Fragment: FragmentField,
  Html: HtmlField,
  Icon: IconField,
  Match,
  MultiSelect: SelectField,
  Page: PageField,
  Portal,
  Select: SelectField,
  Show,
  Switch,
  Table: TableInputField,
  // keep as its used in metadata
  Text: TextField,
  TextArea: TextAreaField,
  TextInput: TextInputField,
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
