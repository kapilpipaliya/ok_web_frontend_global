import type { IFormMetaData } from "~/lib/meta/FormMetadataType";
import { textFieldInputMeta, textFieldTextAreaMeta } from "~/components/constants/textFieldInput";

export const CollCategory: IFormMetaData = {
  attributes: [
    { componentName: "TextField", name: "name", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "label", attributes: [textFieldInputMeta] },
    { componentName: "TextField", name: "description", attributes: [textFieldTextAreaMeta] },
  ],
  isInlineEditable: true,
  name: "CollCategory",
  title: "Collection Category",
};
