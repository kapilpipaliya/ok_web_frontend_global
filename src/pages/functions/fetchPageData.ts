import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFormData } from "~/components/form/functions/getFormData";
import type { Id } from "~/lib/graph/type/id";
import { fetchComponentDataFromGraph } from "~/lib/graph/fetch/fetchComponentGraph";
import { stripGraphTimestamps } from "~/lib/graph/fetch/graphFetchUtils";

export type ComponentGraphData = Pick<ServerResult, "graph">;

export interface FetchFormDataResult {
  componentData?: ComponentGraphData;
  createNew?: boolean;
  data?: ServerResult;
  error?: string;
  formDataIdOverride?: Id;
}

export interface FetchFormMetaDataResult {
  componentData?: ComponentGraphData;
  data?: ServerResult;
  error?: string;
  form?: IFormMetaData;
}

export async function fetchFormData(
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
    const formDataResult = await getFormData(metaResult, id);

    if (
      formDataResult.error ||
      !Array.isArray(formDataResult.data?.result) ||
      formDataResult.data.result.length === 0
    ) {
      return { error: `No ${pageVertexName} found` };
    }

    const componentData = await fetchComponentDataFromGraph(
      formDataResult.data,
    );

    stripGraphTimestamps(componentData?.graph);

    return { componentData, data: formDataResult.data };
  } catch (e) {
    return { error: `Error When Loading Page: ${(e as Error).message}` };
  }
}
