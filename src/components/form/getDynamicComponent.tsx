import { GenericField } from "~/components/fields/GenericField";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { TableInputField } from "~/components/fields/table_input/TableInputField";
import { Repeater } from "~/components/page_attr_render/Repeater";

import { Signature } from "../SignatureBox";
import { TextInput } from "../fields/TextInput";
import { FileUploader } from "../solid_blocks/FileUploader";
import { Radio, RadioGroup } from "../solid_blocks/radio/radio";
import { genericComponents2 } from "./genericComponents2";

export function getDynamicComponent(component: string) {
  switch (component) {
    case "SelectBox":
    case "TagBox":
      return SelectInputField;
    case "DynamicTable":
      return TableInputField;

    case "CheckBox":
    case "ColorBox":
    case "ImageUploader":
    case "TextBox":
    case "NumberBox":
    case "TextArea":
    case "HtmlEditor":
      return TextInput;

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

    // case "Text":
    //   return Dynamic;

    // case "A":
    //   return A;

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

    // case "Box":
    //   return Dynamic;

    // case "Button":
    //  return "button";

    default:
      if (genericComponents2.includes(component)) {
        return GenericField;
      }
      return null;
  }
}
