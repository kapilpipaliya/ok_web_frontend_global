
import {FormMetaData} from "~/lib/formMetaData";
import {AdminAttrKeys} from "~/lib/constants";
import {FormMetaDataAuth} from "~/lib/formMetaDataAuth";
import {getFormApiFromFormMGCall} from "~/cypher/get/getFormApiFromFormMGCall";

export async function getFormMetaDataAsync(
  formId: string,
) {
  let form =
    FormMetaData[formId] ||
    (AdminAttrKeys.includes(formId) && FormMetaDataAuth[formId]);

  if (!form) {
    const formResult = await getFormApiFromFormMGCall(formId);
    if (formResult.error) return formResult;
    form = formResult.form!;
  }
  return {error: "", form};
}