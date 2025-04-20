import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";
import { FetchFormMetaDataResult } from "./fetchPageData";


export async function fetchFormMetaData(
  // graph: GraphInterface,
  pageVertexName?: string,
  formId?: string,
  expression?: string,
  isDesignMode?: boolean,
  pageKeyName?: string
): Promise<FetchFormMetaDataResult> {
  "use server";
  let form: IFormMetaData | null = null;
  if (isDesignMode) {
    const form = FormMetaData[pageVertexName!];
    // can't return form, if it contins functions
    return { form };
  }
  form = FormMetaData.Form;
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);

  const data = await fetchDataFromDB({
    expression: expression ??
      (formId
        ? `id:'${formId}'`
        : `g:'${pageVertexName ?? "Form"}[${pageKeyName}]'`),
    // [getGlobalStore(graph).P.url]: true,
    incoming,
    outgoing,
  });

  if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
    return { error: `No ${pageVertexName} configured` };
  }

  return { data };
}
