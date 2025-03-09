import type { ServerResult } from "~/cypher/types/ServerResult";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFormData } from "~/components/form/functions/getFormData";
import { fetchComponentData, fetchComponentDataPure } from "~/cypher/get/fetchComponentData";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { FormMetaData } from "~/lib/meta/formMetaData";

export interface FetchFormDataResult {
  componentData?: ServerResult | null;
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
  getFormDataFn?: () => Promise<ServerResult>,
  formDataId?: Id,
  id?: Id,
  isNoPermissionCheck?: boolean,
  hasRequiredPermissions?: boolean,
  pageVertexName?: string,
  formMetaDataAttributes?: any[],
): Promise<FetchFormDataResult> {
  if (getFormDataFn) {
    try {
      // TODO: This is the issue refactoring this is hard.
      const data = await getFormDataFn();
      if (!data || data.error) {
        return { error: data.error || "Error fetching form data" };
      }
      return { data };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

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
    const formDataResult = await getFormData(graph, formMetaDataAttributes!, id);

    if (formDataResult.error || !Array.isArray(formDataResult.data?.result) || formDataResult.data.result.length === 0) {
      return { error: `No ${pageVertexName} found` };
    }

    // Find all Component vertices from the loaded data
    const componentVertices = Object.values(formDataResult.data!.graph!.vertexes).filter(
      (v) => v.L.includes("Component"),
    );

    // Fetch data for all components if needed
    let componentData: ServerResult | null = null;
    if (componentVertices.length > 0) {
      componentData = await fetchComponentDataPure(componentVertices, graph);
    }

    return { componentData, data: formDataResult.data };
  } catch (e) {
    return { error: `Error When Loading Form: ${(e as Error).message}` };
  }
}

export async function fetchFormMetaData(
  graph: GraphInterface,
  pageVertexName?: string,
  formId?: string,
  expression?: string,
  isDesignMode?: boolean,
  pageKeyName?: string,
): Promise<FetchFormMetaDataResult> {
  let form: IFormMetaData | null = null;
  if (isDesignMode) {
    return { form: FormMetaData[pageVertexName!] };
  } else {
    form = FormMetaData.Form;
    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);

    const data = await fetchDataFromMG({
      expression:
        expression ??
        (formId
          ? `id:'${formId}'`
          : `g:'${pageVertexName ?? "Form"}[${pageKeyName}]'`),
      [getGlobalStore(graph).P.url]: true,
      incoming,
      outgoing,
    });

    if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
      return { error: `No ${pageVertexName} configured` };
    }

    return { data };
  }
} 