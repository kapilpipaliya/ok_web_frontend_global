import {GraphInterface, Vertex} from "../lib/graph";
import {getChildVertex} from "../lib/Utils";
import {Store} from "solid-js/store";
import {Icon} from "@iconify-icon/solid";

export const iconMap = {
  TextInput: "streamline:input-box",
  Icon: "mynaui:letter-i-hexagon",
  Image: "mage:image",
  A: "ph:link-bold",
  Text: "ci:text",
  Repeater: "formkit:repeater",
  Page: "fluent:document-one-page-20-regular",
  Box: "mage:box-3d-scan",
  ProgressBar: "carbon:progress-bar",
  LoadIndicator: "ep:loading",
  SelectBox: "radix-icons:dropdown-menu",
  TagBox: "radix-icons:dropdown-menu",
  Tabs: "material-symbols-light:tabs-outline",
  Button: "formkit:button",
  Breadcrumb: "tdesign:component-breadcrumb",
  Autocomplete: "fluent-mdl2:completed",
  CheckBox: "tabler:checkbox",
  ColorBox: "ic:outline-color-lens",
  DateBox: "circum:calendar-date",
  FileUploader: "arcticons:custom-uploader",
  Form: "lets-icons:form-duotone",
  NumberBox: "fluent-emoji-high-contrast:input-numbers",
  RadioGroup: "ri:list-radio",
  Radio: "fluent:radio-button-16-filled",
  Switch: "iconoir:switch-off",
  HtmlEditor: "mdi:code-block-html",
  Table: "material-symbols-light:table",
  TextArea: "bi:textarea",
  TextBox: "ph:textbox",
  ScrollView: "mdi:scroll",
  FormSubmit: "ant-design:file-done-outlined",
  FormCancel: "oui:index-close",
  TableHeader: "fluent:dual-screen-header-20-regular",
  TableRow:"carbon:row",
  TabContainer: "fluent:tabs-20-regular",
  TabList: "fluent:tab-desktop-20-regular",
  TreeViewItem: "tdesign:tree-list",
  TreeViewChild: "carbon:tree-view-alt",
  Collapsible: "lets-icons:collapse",
};

export const nameExpr = (v: Vertex,graph: Store<GraphInterface>) => {
  const component = getChildVertex(graph,["$0Comp"], v).vertex?.P.name;
  return `${v.P.name}${component ? ` (${component})` : ""}`;
};

