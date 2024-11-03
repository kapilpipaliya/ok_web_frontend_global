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
// // import { Accordion } from "~/kobalte/packages/core/src/accordion";
// import { Alert } from "~/kobalte/packages/core/src/alert";
// import { AlertDialog } from "~/kobalte/packages/core/src/alert-dialog";
// import { Breadcrumbs } from "~/kobalte/packages/core/src/breadcrumbs";
// import { Checkbox } from "~/kobalte/packages/core/src/checkbox";
// import { Collapsible } from "~/kobalte/packages/core/src/collapsible";
// import { Combobox } from "~/kobalte/packages/core/src/combobox";
// import { ContextMenu } from "~/kobalte/packages/core/src/context-menu";
// // import { Dialog } from "~/kobalte/packages/core/src/dialog";
// import { DropdownMenu } from "~/kobalte/packages/core/src/dropdown-menu";
// import { HoverCard } from "~/kobalte/packages/core/src/hover-card";
// // import { Tooltip } from "~/kobalte/packages/core/src/tooltip";
// import { I18nProvider } from "~/kobalte/packages/core/src/i18n";
// import { Image } from "~/kobalte/packages/core/src/image";
// import { Link } from "~/kobalte/packages/core/src/link";
// import { Listbox } from "~/kobalte/packages/core/src/listbox";
// import { Menubar } from "~/kobalte/packages/core/src/menubar";
// import { NavigationMenu } from "~/kobalte/packages/core/src/navigation-menu";
// import { NumberField } from "~/kobalte/packages/core/src/number-field";
// import { Pagination } from "~/kobalte/packages/core/src/pagination";
// // import { Popover } from "~/kobalte/packages/core/src/popover";
// import { Progress } from "~/kobalte/packages/core/src/progress";
// import { Select } from "~/kobalte/packages/core/src/select";
// import { Separator } from "~/kobalte/packages/core/src/separator";
// import { Skeleton } from "~/kobalte/packages/core/src/skeleton";
// import { Slider } from "~/kobalte/packages/core/src/slider";
// import { Switch } from "~/kobalte/packages/core/src/switch";
// import { Tabs } from "~/kobalte/packages/core/src/tabs";
// import { TextField as KobalteTextField } from "~/kobalte/packages/core/src/text-field";
// import { Toast } from "~/kobalte/packages/core/src/toast";
// import { ToggleButton } from "~/kobalte/packages/core/src/toggle-button";
// import { ToggleGroup } from "~/kobalte/packages/core/src/toggle-group";

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

// export const arkUIComponents = {
//   // ColorPicker,
//   // DatePicker,
//   // Dropdown,
//   // Modal,
//   // Slider,
//   // Tabs,
// };

// export const kobalteComponents = {
//   // Accordion,
//   Alert,
//   AlertDialog,
//   Breadcrumbs,
//   Checkbox,
//   Collapsible,
//   Combobox,
//   ContextMenu,
//   // Dialog,
//   DropdownMenu,
//   HoverCard,
//   // Tooltip,
//   I18nProvider,
//   Image,
//   Link,
//   Listbox,
//   Menubar,
//   NavigationMenu,
//   NumberField,
//   Pagination,
//   // Popover,
//   Progress,
//   Select,
//   Separator,
//   Skeleton,
//   Slider,
//   Switch,
//   Tabs,
//   TextField: KobalteTextField,
//   Toast,
//   ToggleButton,
//   ToggleGroup,
// };

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

  if (corvuComponents[componentKey as keyof typeof corvuComponents]) {
    return subComponent
      ? // @ts-expect-error ignore
        corvuComponents[componentKey as keyof typeof corvuComponents][
          subComponent
        ] || NotFoundComponent
      : corvuComponents[componentKey as keyof typeof corvuComponents];
  }

  // if (arkUIComponents[componentKey as keyof typeof arkUIComponents]) {
  //   return subComponent
  //     ? // @ts-expect-error ignore
  //       arkUIComponents[componentKey as keyof typeof arkUIComponents][
  //         subComponent
  //       ] || NotFoundComponent
  //     : arkUIComponents[componentKey as keyof typeof arkUIComponents];
  // }

  // if (kobalteComponents[componentKey as keyof typeof kobalteComponents]) {
  //   return subComponent
  //     ? // @ts-expect-error ignore
  //       kobalteComponents[componentKey as keyof typeof kobalteComponents][
  //         subComponent
  //       ] || NotFoundComponent
  //     : kobalteComponents[componentKey as keyof typeof kobalteComponents];
  // }

  return componentsMap[componentKey];
}
