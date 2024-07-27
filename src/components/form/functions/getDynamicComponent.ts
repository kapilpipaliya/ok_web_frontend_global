
import { SelectField } from "~/components/fields/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { Repeater } from "~/components/page_attr_render/Repeater";

import { Signature } from "../../SignatureBox";
import { BoxField } from "../../fields/BoxField";
import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { ImageField } from "../../fields/ImageField";
import { PageField } from "../../fields/PageField";
import { TextField } from "../../fields/TextField";
import { TextInputField } from "../../fields/TextInputField";
import { UrlField } from "../../fields/UrlField";
import { FileUploader } from "../../solid_blocks/FileUploader";
import { Radio, RadioGroup } from "../../solid_blocks/radio/radio";

export function getDynamicComponent(component: string) {
  switch (component) {
    case "SelectBox":
    case "TagBox":
      return SelectField;
    case "DynamicTable":
      return TableInputField;

    case "CheckBox":
    case "ColorBox":
    case "ImageUploader":
    case "TextBox":
    case "NumberBox":
    case "TextArea":
    case "HtmlEditor":
      return TextInputField;

    case "FileUploader":
      return FileUploader;

    case "Radio":
      return Radio;

    case "RadioGroup":
      return RadioGroup;

    case "SignatureBox":
      return Signature;

    case "Repeater":
      return Repeater;

    case "Form":
      return FormField

    case "Text":
      return TextField;

    case "A":
      return UrlField;

    case "Image":
      return ImageField;
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

    case "Button":
      return ButtonField;

    case "Page":
    case "ThankYouPage":
    case "ErrorPage":
    case "TemplatePage":
      return PageField;

    case "Box":
    default:
      return BoxField;
  }
}
