import type { IFormMetaData } from "~/lib/meta/FormMetadataType";
import { textFieldInputMeta, textFieldTextAreaMeta } from "~/components/constants/textFieldInput";

export const CompCategory: IFormMetaData = {
  attributes: [
    { componentName: "TextField", name: "name", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "label", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "description", attributes: [textFieldTextAreaMeta] },
  ],
  isInlineEditable: true,
  name: "CompCategory",
  title: "Component Category",
};
