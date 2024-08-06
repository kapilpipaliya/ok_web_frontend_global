
import { SelectField } from "~/components/fields/SelectField";
import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { Repeater } from "~/components/page_attr_render/Repeater";

import { BoxField } from "../../fields/BoxField";
import { ButtonField } from "../../fields/ButtonField";
import { FormField } from "../../fields/FormField";
import { ImageField } from "../../fields/ImageField";
import { PageField } from "../../fields/PageField";
import { TextField } from "../../fields/TextField";
import { TextInputField } from "../../fields/TextInputField";
import { UrlField } from "../../fields/UrlField";
import { Signature } from "../../SignatureBox";
import { FileUploader } from "../../solid_blocks/FileUploader";
import { Radio, RadioGroup } from "../../solid_blocks/radio/radio";

export function getDynamicComponent(component: string) {
  switch (component) {
    case "A":
      return UrlField;
    case "Button":
      return ButtonField;
    case "CheckBox":

    case "ColorBox":
    case "HtmlEditor":
    case "ImageUploader":
    case "NumberBox":
    case "TextArea":
    case "TextBox":
      return TextInputField;
    case "DynamicTable":
      return TableInputField;

    case "ErrorPage":

    case "Page":

    case "TemplatePage":

    case "ThankYouPage":
      return PageField;

    case "FileUploader":
      return FileUploader;

    case "Form":
      return FormField

    case "Image":
      return ImageField;

    case "Radio":
      return Radio;

    case "RadioGroup":
      return RadioGroup;
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

    case "Repeater":
      return Repeater;

    case "SelectBox":
    case "TagBox":
      return SelectField;
    case "SignatureBox":
      return Signature;
    case "Text":
      return TextField;
    default:
      return BoxField;
  }
}
