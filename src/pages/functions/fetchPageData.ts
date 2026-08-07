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
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";

export type ComponentGraphData = Pick<ServerResult, "graph">;

export interface FetchFormDataParams {
  /**
   * Optional. Prefer `formKey` / `pageVertexName` so edges are built on the
   * server — NestedExpression trees from recursive pageAttr exceed seroval's
   * depth limit of 64 when sent as `/_server` args.
   */
  incoming?: NestedExpression[];
  outgoing?: NestedExpression[];
  formKey?: string;
  formDataId?: Id;
  id?: Id;
  isNoPermissionCheck?: boolean;
  hasRequiredPermissions?: boolean;
  pageVertexName?: string;
  isDesignMode?: boolean;
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
  /** Resolve via client `FormMetaData[formKey]` — avoids seroval depth limit on recursive pageAttr. */
  formKey?: string;
  formMetaId?: Id;
}

function resolveFetchEdges(params: FetchFormDataParams): {
  incoming: NestedExpression[];
  outgoing: NestedExpression[];
} {
  const key = params.formKey ?? params.pageVertexName;
  if (key && FormMetaData[key]) {
    return getEdgesFromRowsAttr(FormMetaData[key].attributes);
  }
  return {
    incoming: params.incoming ?? [],
    outgoing: params.outgoing ?? [],
  };
}

export async function fetchFormData(
  params: FetchFormDataParams,
): Promise<FetchFormDataResult> {
  "use server";

  if (params.formDataId) {
    return { formDataIdOverride: params.formDataId };
  }

  if (!params.id) {
    return { createNew: true };
  }

  if (
    !(params.isNoPermissionCheck || params.hasRequiredPermissions)
  ) {
    return { error: "Missing required permissions" };
  }

  if (params.id.startsWith("-")) {
    return { formDataId: params.id };
  }

  try {
    const { incoming, outgoing } = resolveFetchEdges(params);
    const formDataResult = await getFormData(params.id, {
      incoming,
      outgoing,
    });

    if (formDataResult.error || !formDataResult.data?.graph) {
      return { error: `No ${params.pageVertexName} found` };
    }

    const resolvedFormDataId =
      extractRootIdFromResult(formDataResult.data) ?? params.id;

    const componentData = await fetchComponentDataFromGraph(
      formDataResult.data,
    );

    // Return only wire-safe graph slices. Full ServerResult / NestedExpression
    // trees (Page Attr ~118 deep) hit SolidStart seroval depthLimit (64).
    const wireOptions = { isDesignMode: params.isDesignMode };
    prepareGraphForWireTransfer(componentData?.graph, wireOptions);
    prepareGraphForWireTransfer(formDataResult.data?.graph, wireOptions);
    stripResultFromServerResult(formDataResult.data);

    return {
      componentData: componentData?.graph
        ? { graph: componentData.graph }
        : undefined,
      data: formDataResult.data,
      formDataId: resolvedFormDataId,
    };
  } catch (e) {
    return { error: `Error When Loading Page: ${(e as Error).message}` };
  }
}
