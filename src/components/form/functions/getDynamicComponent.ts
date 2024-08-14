import { NotFoundComponent } from "~/components/fields/NotFoundComponent";
import { RadioGroupField } from "~/components/fields/RadioGroupField";
import { SelectField } from "~/components/fields/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { Repeater } from "~/components/page_attr_render/Repeater";
import { Accordion } from "~/kobalte/packages/core/src/accordion";
import { Alert } from "~/kobalte/packages/core/src/alert";
import { AlertDialog } from "~/kobalte/packages/core/src/alert-dialog";
import { Breadcrumbs } from "~/kobalte/packages/core/src/breadcrumbs";
import { Checkbox } from "~/kobalte/packages/core/src/checkbox";
import { Collapsible } from "~/kobalte/packages/core/src/collapsible";
import { Combobox } from "~/kobalte/packages/core/src/combobox";
import { ContextMenu } from "~/kobalte/packages/core/src/context-menu";
import { Dialog } from "~/kobalte/packages/core/src/dialog";
import { DropdownMenu } from "~/kobalte/packages/core/src/dropdown-menu";
import { HoverCard } from "~/kobalte/packages/core/src/hover-card";
import { Image } from "~/kobalte/packages/core/src/image";
import { Link } from "~/kobalte/packages/core/src/link";
import { Listbox } from "~/kobalte/packages/core/src/listbox";
import { Menubar } from "~/kobalte/packages/core/src/menubar";
import { NavigationMenu } from "~/kobalte/packages/core/src/navigation-menu";
import { NumberField } from "~/kobalte/packages/core/src/number-field";
import { Pagination } from "~/kobalte/packages/core/src/pagination";
import { Popover } from "~/kobalte/packages/core/src/popover";
import { Progress } from "~/kobalte/packages/core/src/progress";
import { Select } from "~/kobalte/packages/core/src/select";
import { Separator } from "~/kobalte/packages/core/src/separator";
import { Skeleton } from "~/kobalte/packages/core/src/skeleton";
import { Slider } from "~/kobalte/packages/core/src/slider";
import { Switch } from "~/kobalte/packages/core/src/switch";
import { Tabs } from "~/kobalte/packages/core/src/tabs";
import { TextField as KobalteTextField } from "~/kobalte/packages/core/src/text-field";
import { Toast } from "~/kobalte/packages/core/src/toast";
import { ToggleButton } from "~/kobalte/packages/core/src/toggle-button";
import { ToggleGroup } from "~/kobalte/packages/core/src/toggle-group";
import { Tooltip } from "~/kobalte/packages/core/src/tooltip";

import { BoxField } from "../../fields/BoxField";
import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { PageField } from "../../fields/PageField";
import { TextField } from "../../fields/TextField";
import { Signature } from "../../SignatureBox";
import { FileUploader } from "../../solid_blocks/FileUploader";

export const componentsMap: Record<string, any> = {
  Accordion: Accordion,
  AccordionContent: Accordion.Content,
  AccordionHeader: Accordion.Header,
  AccordionItem: Accordion.Item,
  AccordionTrigger: Accordion.Trigger,
  Alert: Alert,
  AlertDialog: AlertDialog,
  AlertDialogCloseButton: AlertDialog.CloseButton,
  AlertDialogContent: AlertDialog.Content,
  AlertDialogDescription: AlertDialog.Description,
  AlertDialogOverlay: AlertDialog.Overlay,
  AlertDialogPortal: AlertDialog.Portal,
  AlertDialogTitle: AlertDialog.Title,
  AlertDialogTrigger: AlertDialog.Trigger,
  Box: BoxField,
  Breadcrumb: Breadcrumbs,
  BreadcrumbLink: Breadcrumbs.Link,
  BreadcrumbSeparator: Breadcrumbs.Separator,
  Button: ButtonField,
  CheckBox: Checkbox,
  CheckboxControl: Checkbox.Control,
  CheckboxDescription: Checkbox.Description,
  CheckboxErrorMessage: Checkbox.ErrorMessage,
  CheckboxIndicator: Checkbox.Indicator,
  CheckboxInput: Checkbox.Input,
  CheckboxLabel: Checkbox.Label,
  Collapsible: Collapsible,
  CollapsibleContent: Collapsible.Content,
  CollapsibleTrigger: Collapsible.Trigger,
  ColorBox: KobalteTextField,
  Combobox: Combobox,
  ComboboxArrow: Combobox.Arrow,
  ComboboxContent: Combobox.Content,
  ComboboxControl: Combobox.Control,
  ComboboxDescription: Combobox.Description,
  ComboboxErrorMessage: Combobox.ErrorMessage,
  ComboboxIcon: Combobox.Icon,
  ComboboxInput: Combobox.Input,
  ComboboxLabel: Combobox.Label,
  ComboboxListbox: Combobox.Listbox,
  ComboboxPortal: Combobox.Portal,
  ComboboxTrigger: Combobox.Trigger,
  ContextMenu: ContextMenu,
  ContextMenuArrow: ContextMenu.Arrow,
  ContextMenuCheckboxItem: ContextMenu.CheckboxItem,
  ContextMenuContent: ContextMenu.Content,
  ContextMenuGroup: ContextMenu.Group,
  ContextMenuGroupLabel: ContextMenu.GroupLabel,
  ContextMenuIcon: ContextMenu.Icon,
  ContextMenuItem: ContextMenu.Item,
  ContextMenuItemDescription: ContextMenu.ItemDescription,
  ContextMenuItemIndicator: ContextMenu.ItemIndicator,
  ContextMenuItemLabel: ContextMenu.ItemLabel,
  ContextMenuPortal: ContextMenu.Portal,
  ContextMenuRadioGroup: ContextMenu.RadioGroup,
  ContextMenuRadioItem: ContextMenu.RadioItem,
  ContextMenuSeparator: ContextMenu.Separator,
  ContextMenuSub: ContextMenu.Sub,
  ContextMenuSubContent: ContextMenu.SubContent,
  ContextMenuSubTrigger: ContextMenu.SubTrigger,
  ContextMenuTrigger: ContextMenu.Trigger,
  Dialog: Dialog,
  DialogCloseButton: Dialog.CloseButton,
  DialogContent: Dialog.Content,
  DialogDescription: Dialog.Description,
  DialogOverlay: Dialog.Overlay,
  DialogPortal: Dialog.Portal,
  DialogTitle: Dialog.Title,
  DialogTrigger: Dialog.Trigger,
  DropdownMenu: DropdownMenu,
  DropdownMenuArrow: DropdownMenu.Arrow,
  DropdownMenuCheckboxItem: DropdownMenu.CheckboxItem,
  DropdownMenuContent: DropdownMenu.Content,
  DropdownMenuGroup: DropdownMenu.Group,
  DropdownMenuGroupLabel: DropdownMenu.GroupLabel,
  DropdownMenuIcon: DropdownMenu.Icon,
  DropdownMenuItem: DropdownMenu.Item,
  DropdownMenuItemDescription: DropdownMenu.ItemDescription,
  DropdownMenuItemIndicator: DropdownMenu.ItemIndicator,
  DropdownMenuItemLabel: DropdownMenu.ItemLabel,
  DropdownMenuPortal: DropdownMenu.Portal,
  DropdownMenuRadioGroup: DropdownMenu.RadioGroup,
  DropdownMenuRadioItem: DropdownMenu.RadioItem,
  DropdownMenuSeparator: DropdownMenu.Separator,
  DropdownMenuSub: DropdownMenu.Sub,
  DropdownMenuSubContent: DropdownMenu.SubContent,
  DropdownMenuSubTrigger: DropdownMenu.SubTrigger,
  DropdownMenuTrigger: DropdownMenu.Trigger,
  DynamicTable: TableInputField,
  ErrorPage: PageField,
  FileUploader: FileUploader,
  Form: FormField,
  HoverCard: HoverCard,
  HoverCardArrow: HoverCard.Arrow,
  HoverCardContent: HoverCard.Content,
  HoverCardPortal: HoverCard.Portal,
  HoverCardTrigger: HoverCard.Trigger,
  HtmlEditor: KobalteTextField,
  Image: Image,
  ImageFallback: Image.Fallback,
  ImageImg: Image.Img,
  ImageUploader: FileUploader,
  /*JundaoAlert: Jundao.Alert,
  JundaoAvatar: Jundao.Avatar,
  JundaoBadge: Jundao.Badge,
  JundaoBreadcrumb: Jundao.Breadcrumb,
  JundaoButton: Jundao.Button,
  JundaoCard: Jundao.Card,
  JundaoCheckbox: Jundao.Checkbox,
  JundaoContextMenu: Jundao.ContextMenu,
  JundaoDivider: Jundao.Divider,
  JundaoDrawer: Jundao.Drawer,
  JundaoDropdownMenu: Jundao.DropdownMenu,
  JundaoImage: Jundao.Image,
  JundaoInput: Jundao.Input,
  JundaoLabel: Jundao.Label,
  JundaoLayout: Jundao.Layout,
  JundaoLink: Jundao.Link,
  JundaoModal: Jundao.Modal,
  JundaoPopconfirm: Jundao.Popconfirm,
  JundaoProgress: Jundao.Progress,
  JundaoRadio: Jundao.Radio,
  JundaoSelect: Jundao.Select,
  JundaoSidenav: Jundao.Sidenav,
  JundaoSlider: Jundao.Slider,
  JundaoSpace: Jundao.Space,
  JundaoSpinner: Jundao.Spinner,
  JundaoSwitch: Jundao.Switch,
  JundaoTag: Jundao.Tag,
  JundaoText: Jundao.Text,
  JundaoTitle: Jundao.Title,
  JundaouseLayoutContext: Jundao.useLayoutContext,*/
  Link: Link,
  Listbox: Listbox,
  Menubar: Menubar,
  MenubarArrow: Menubar.Arrow,
  MenubarCheckboxItem: Menubar.CheckboxItem,
  MenubarContent: Menubar.Content,
  MenubarGroup: Menubar.Group,
  MenubarGroupLabel: Menubar.GroupLabel,
  MenubarIcon: Menubar.Icon,
  MenubarItem: Menubar.Item,
  MenubarItemDescription: Menubar.ItemDescription,
  MenubarItemIndicator: Menubar.ItemIndicator,
  MenubarItemLabel: Menubar.ItemLabel,
  MenubarMenu: Menubar.Menu,
  MenubarPortal: Menubar.Portal,
  MenubarRadioGroup: Menubar.RadioGroup,
  MenubarRadioItem: Menubar.RadioItem,
  MenubarSeparator: Menubar.Separator,
  MenubarSub: Menubar.Sub,
  MenubarSubContent: Menubar.SubContent,
  MenubarSubTrigger: Menubar.SubTrigger,
  MenubarTrigger: Menubar.Trigger,
  NavigationMenuArrow: NavigationMenu.Arrow,
  NavigationMenuCheckboxItem: NavigationMenu.CheckboxItem,
  NavigationMenuContent: NavigationMenu.Content,
  NavigationMenuGroup: NavigationMenu.Group,
  NavigationMenuGroupLabel: NavigationMenu.GroupLabel,
  NavigationMenuIcon: NavigationMenu.Icon,
  NavigationMenuItem: NavigationMenu.Item,
  NavigationMenuItemDescription: NavigationMenu.ItemDescription,
  NavigationMenuItemIndicator: NavigationMenu.ItemIndicator,
  NavigationMenuItemLabel: NavigationMenu.ItemLabel,
  NavigationMenuMenu: NavigationMenu.Menu,
  NavigationMenuPortal: NavigationMenu.Portal,
  NavigationMenuRadioGroup: NavigationMenu.RadioGroup,
  NavigationMenuRadioItem: NavigationMenu.RadioItem,
  NavigationMenuSeparator: NavigationMenu.Separator,
  NavigationMenuSub: NavigationMenu.Sub,
  NavigationMenuSubContent: NavigationMenu.SubContent,
  NavigationMenuSubTrigger: NavigationMenu.SubTrigger,
  NavigationMenuTrigger: NavigationMenu.Trigger,
  NavigationMenuViewport: NavigationMenu.Viewport,
  NumberBox: NumberField,
  NumberField: NumberField,
  NumberFieldDecrementTrigger: NumberField.DecrementTrigger,
  NumberFieldDescription: NumberField.Description,
  NumberFieldErrorMessage: NumberField.ErrorMessage,
  NumberFieldHiddenInput: NumberField.HiddenInput,
  NumberFieldIncrementTrigger: NumberField.IncrementTrigger,
  NumberFieldInput: NumberField.Input,
  NumberFieldLabel: NumberField.Label,
  Page: PageField,
  Pagination: Pagination,
  PaginationItems: Pagination.Items,
  PaginationNext: Pagination.Next,
  PaginationPrevious: Pagination.Previous,
  Popover: Popover,
  PopoverAnchor: Popover.Anchor,
  PopoverArrow: Popover.Arrow,
  PopoverCloseButton: Popover.CloseButton,
  PopoverContent: Popover.Content,
  PopoverDescription: Popover.Description,
  PopoverPortal: Popover.Portal,
  PopoverTitle: Popover.Title,
  PopoverTrigger: Popover.Trigger,
  Progress: Progress,
  ProgressFill: Progress.Fill,
  ProgressLabel: Progress.Label,
  ProgressTrack: Progress.Track,
  ProgressValueLabel: Progress.ValueLabel,
  // RadioGroupDescription: RadioGroup.Description,
  // RadioGroupErrorMessage: RadioGroup.ErrorMessage,
  // RadioGroupItem: RadioGroup.Item,
  // RadioGroupItemControl: RadioGroup.ItemControl,
  // RadioGroupItemDescription: RadioGroup.ItemDescription,
  // RadioGroupItemIndicator: RadioGroup.ItemIndicator,
  // RadioGroupItemInput: RadioGroup.ItemInput,
  // RadioGroupItemLabel: RadioGroup.ItemLabel,
  RadioGroup: RadioGroupField,
  // RadioGroupLabel: RadioGroup.Label,
  Repeater: Repeater,
  Select: Select,
  SelectArrow: Select.Arrow,
  SelectBox: SelectField,
  SelectContent: Select.Content,
  SelectDescription: Select.Description,
  SelectErrorMessage: Select.ErrorMessage,
  SelectIcon: Select.Icon,
  SelectLabel: Select.Label,
  SelectListbox: Select.Listbox,
  SelectPortal: Select.Portal,
  SelectTrigger: Select.Trigger,
  SelectValue: Select.Value,
  Separator: Separator,
  SignatureBox: Signature,
  Skeleton: Skeleton,
  Slider: Slider,
  SliderFill: Slider.Fill,
  SliderInput: Slider.Input,
  SliderLabel: Slider.Label,
  SliderThumb: Slider.Thumb,
  SliderTrack: Slider.Track,
  SliderValueLabel: Slider.ValueLabel,
  Switch: Switch,
  SwitchControl: Switch.Control,
  SwitchDescription: Switch.Description,
  SwitchErrorMessage: Switch.ErrorMessage,
  SwitchInput: Switch.Input,
  SwitchLabel: Switch.Label,
  SwitchThumb: Switch.Thumb,
  Tab: Tabs,
  TabContent: Tabs.Content,
  TabIndicator: Tabs.Indicator,
  TabList: Tabs.List,
  TabTrigger: Tabs.Trigger,
  TagBox: SelectField,
  TemplatePage: PageField,
  Text: TextField,
  TextField: KobalteTextField,
  TextFieldDescription: KobalteTextField.Description,
  TextFieldErrorMessage: KobalteTextField.ErrorMessage,
  TextFieldInput: KobalteTextField.Input,
  TextFieldLabel: KobalteTextField.Label,
  TextFieldTextArea: KobalteTextField.TextArea,
  ThankYouPage: PageField,
  Toast: Toast,
  ToastCloseButton: Toast.CloseButton,
  ToastDescription: Toast.Description,
  ToastProgressFill: Toast.ProgressFill,
  ToastProgressTrack: Toast.ProgressTrack,
  ToastTitle: Toast.Title,
  ToggleButton: ToggleButton,
  ToggleGroup: ToggleGroup,
  ToggleGroupItem: ToggleGroup.Item,
  Tooltip: Tooltip,
  TooltipArrow: Tooltip.Arrow,
  TooltipContent: Tooltip.Content,
  TooltipPortal: Tooltip.Portal,
  TooltipTrigger: Tooltip.Trigger,
};

export function getDynamicComponent(component: string) {
  return componentsMap[component] || NotFoundComponent;
}

// case "Tabs":
//   return Tabs;

// case "Table":
//   return Table;

// case "TableHeader":
//   return TableHeadCell;

// case "TableRow":
//   return TableBodyCell;

// case "Collapsible":
//   return Collapsible;

// case "Avatar":
//   return Avatar;

// case "Select":
//   return Select; // check is it correct

// case "TreeViewItem":
//   return TreeView;

// case "TreeViewChild":
//   return PageAttrRender;

// case "Accordion":
//   return Accordion;

// case "Breadcrumb":
// return Breadcrumbs;

// case "Divider":
//   return "hr"; // Assuming you have a Divider component

// case "Heading":
//   return Heading;

// case "Rating":
//   return StarRating;

// case "Label":
//   return Label;

// case "Icon":
//   return Icon;