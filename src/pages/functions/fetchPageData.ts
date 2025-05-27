import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFormData } from "~/components/form/functions/getFormData";
import { fetchComponentDataPure } from "~/cypher/get/fetchComponentData";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

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
  // adding use server, is passing function in response when Component tab is opened, and it breaks the SSR.
  // "use server";
  if (formDataId) {
    return { formDataIdOverride: formDataId };
  }

  if (!id) {
    return { createNew: true };
  }

  if (!(id && (isNoPermissionCheck || hasRequiredPermissions))) {
    return { error: "Missing required permissions" };
  }

  if (id && id.startsWith("-")) {
    return { data: { result: [{ id }] } };
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

    // // Find all Component vertices from the loaded data
    // const componentVertices = Object.values(
    //   formDataResult.data!.graph!.vertexes,
    // ).filter((v) => v.L.includes("Component"));

    // Create a set of component names from Attr vertices
    const componentNames = new Set<string>();

    // Find all Attr vertices that define componentName
    for (const vertex of Object.values(formDataResult.data!.graph!.vertexes)) {
      if (vertex.L.includes("Attr") && vertex.P.componentName) {
        // Skip "Html", "Data" and "Slot" components
        if (!["Html", "Data", "Slot"].includes(vertex.P.componentName)) {
          componentNames.add(vertex.P.componentName);
        }
      }
    }

    // Fetch data for all components if needed
    let componentData: null | ServerResult = null;
    if (componentNames.size > 0) {
      componentData = await fetchComponentDataPure(Array.from(componentNames));
    }

    return { componentData, data: formDataResult.data };
  } catch (e) {
    return { error: `Error When Loading Page: ${(e as Error).message}` };
  }
}
