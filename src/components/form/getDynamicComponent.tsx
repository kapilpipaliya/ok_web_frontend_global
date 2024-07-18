import { GenericField } from "~/components/fields/GenericField";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { TableInputField } from "~/components/fields/table_input/TableInputField";

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

    // case "SelectBox"

    case "RadioGroup":
      return RadioGroup;

    case "SignatureBox":
      return Signature

    default:
      if (genericComponents2.includes(component)) {
        return GenericField;
      }
      return null;
  }
}
