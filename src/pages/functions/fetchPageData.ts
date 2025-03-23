import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Id } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFormData } from "~/components/form/functions/getFormData";
import { fetchComponentDataPure } from "~/cypher/get/fetchComponentData";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";

export interface FetchFormDataResult {
  componentData?: null | ServerResult;
  createNew?: boolean;
  data?: ServerResult;
  error?: string;
  formDataIdOverride?: Id;
}

export interface FetchFormMetaDataResult {
  data?: ServerResult;
  error?: string;
  form?: IFormMetaData;
}

export async function fetchFormData(
  graph: GraphInterface,
  metaResult: {
    data?: ServerResult;
    form?: IFormMetaData;
  },
  // getFormDataFn?: () => Promise<ServerResult>,
  formDataId?: Id,
  id?: Id,
  isNoPermissionCheck?: boolean,
  hasRequiredPermissions?: boolean,
  pageVertexName?: string,
): Promise<FetchFormDataResult> {
  if (formDataId) {
    return { formDataIdOverride: formDataId };
  }

  if (!id) {
    return { createNew: true };
  }

  if (!(id && (isNoPermissionCheck || hasRequiredPermissions))) {
    return { error: "Missing required permissions" };
  }

  try {
    const formDataResult = await getFormData(graph, metaResult, id);

    if (
      formDataResult.error ||
      !Array.isArray(formDataResult.data?.result) ||
      formDataResult.data.result.length === 0
    ) {
      return { error: `No ${pageVertexName} found` };
    }

    // Find all Component vertices from the loaded data
    const componentVertices = Object.values(
      formDataResult.data!.graph!.vertexes,
    ).filter((v) => v.L.includes("Component"));

    // Fetch data for all components if needed
    let componentData: null | ServerResult = null;
    if (componentVertices.length > 0) {
      componentData = await fetchComponentDataPure(componentVertices);
    }

    return { componentData, data: formDataResult.data };
  } catch (e) {
    return { error: `Error When Loading Form: ${(e as Error).message}` };
  }
}

export async function fetchFormMetaData(
  // graph: GraphInterface,
  pageVertexName?: string,
  formId?: string,
  expression?: string,
  isDesignMode?: boolean,
  pageKeyName?: string,
): Promise<FetchFormMetaDataResult> {
  "use server";
  let form: IFormMetaData | null = null;
  if (isDesignMode) {
    return { form: FormMetaData[pageVertexName!] };
  }
  form = FormMetaData.Form;
  const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);

  const data = await fetchDataFromDB({
    expression:
      expression ??
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
