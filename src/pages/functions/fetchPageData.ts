import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Id } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFormData } from "~/components/form/functions/getFormData";
import { fetchComponentDataPure } from "~/cypher/get/fetchComponentData";

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
    return { error: `Error When Loading Page: ${(e as Error).message}` };
  }
}
