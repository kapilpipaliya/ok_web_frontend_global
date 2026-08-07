import type { IFormMetaData } from "~/lib/meta/FormMetadataType";
import { FormMetaData } from "~/lib/meta/formMetaData";

/** Prefer inline `form`, else local `FormMetaData[formKey]` (avoids deep wire payloads). */
export function resolveFormMeta(meta?: {
  form?: IFormMetaData;
  formKey?: string;
}): IFormMetaData | undefined {
  if (!meta) {
    return undefined;
  }
  if (meta.form) {
    return meta.form;
  }
  if (meta.formKey) {
    return FormMetaData[meta.formKey];
  }
  return undefined;
}
