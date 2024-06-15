import type { GraphInterface } from "~/lib/graph/graph";
import type { SetStoreFunction, Store } from "solid-js/store";
import { getFormApiFromForm } from "../../get/sync/graph_functions";
import { FormMetaDataAuth } from "~/lib/formMetaDataAuth";
import { FormMetaData } from "~/lib/formMetaData";
import { AdminAttrKeys } from "~/lib/constants";

// 'type' or 'label' can be overwritten in the meta.
export function getFormMetaData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  formId: string
) {
  let form = FormMetaData[formId] ||
    (AdminAttrKeys.includes(formId) && FormMetaDataAuth[formId]);

  if (!form) {
    const formResult = getFormApiFromForm(graph, setGraph, formId);
    if (formResult.error) return formResult;
    form = formResult.form!;
  }
  return { error: false, form };
}
