import type { NestedExpression } from "~/cypher/types/NestedExpression";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFormData } from "~/components/form/functions/getFormData";
import type { Id } from "~/lib/graph/type/id";
import { fetchComponentDataFromGraph } from "~/lib/graph/fetch/fetchComponentGraph";
import { prepareGraphForWireTransfer } from "~/lib/graph/fetch/graphFetchUtils";
import {
  extractRootIdFromResult,
  stripResultFromServerResult,
} from "~/lib/graph/fetch/wirePayloadUtils";
import { stripVertexAdjacency } from "~/lib/graph/transfer/stripVertexAdjacency";

export type ComponentGraphData = Pick<ServerResult, "graph">;

export interface FetchFormDataParams {
  incoming: NestedExpression[];
  outgoing: NestedExpression[];
}

export interface FetchFormDataResult {
  componentData?: ComponentGraphData;
  createNew?: boolean;
  data?: ServerResult;
  error?: string;
  formDataId?: Id;
  formDataIdOverride?: Id;
}

export interface FetchFormMetaDataResult {
  componentData?: ComponentGraphData;
  data?: ServerResult;
  error?: string;
  form?: IFormMetaData;
  formMetaId?: Id;
}

export async function fetchFormData(
  edges: FetchFormDataParams,
  formDataId?: Id,
  id?: Id,
  isNoPermissionCheck?: boolean,
  hasRequiredPermissions?: boolean,
  pageVertexName?: string,
  isDesignMode?: boolean,
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
    return { formDataId: id };
  }

  try {
    const formDataResult = await getFormData(id, edges);

    if (formDataResult.error || !formDataResult.data?.graph) {
      return { error: `No ${pageVertexName} found` };
    }

    const resolvedFormDataId =
      extractRootIdFromResult(formDataResult.data) ?? id;

    const componentData = await fetchComponentDataFromGraph(
      formDataResult.data,
    );

    const wireOptions = { isDesignMode };
    prepareGraphForWireTransfer(componentData?.graph, wireOptions);
    prepareGraphForWireTransfer(formDataResult.data?.graph, wireOptions);
    stripVertexAdjacency(formDataResult.data?.graph);
    stripResultFromServerResult(formDataResult.data);

    return {
      componentData,
      data: formDataResult.data,
      formDataId: resolvedFormDataId,
    };
  } catch (e) {
    return { error: `Error When Loading Page: ${(e as Error).message}` };
  }
}
