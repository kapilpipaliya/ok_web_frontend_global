import type { NestedExpression } from "~/cypher/types/NestedExpression";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFormData } from "~/components/form/functions/getFormData";
import type { Id } from "~/lib/graph/type/id";
import { fetchComponentDataFromGraph } from "~/lib/graph/fetch/fetchComponentGraph";
import {
  extractRootIdFromResult,
  prepareServerResultForWire,
  toComponentGraphData,
} from "~/lib/graph/fetch/wirePayloadUtils";
import {
  type FormFetchEdges,
  resolveEdgesFromFormKey,
} from "~/lib/graph/fetch/resolveEdgesFromFormKey";

export type ComponentGraphData = Pick<ServerResult, "graph">;

export interface FetchFormDataParams {
  /** Preferred: edges are built on the server from FormMetaData[formKey]. */
  formKey?: string;
  /** @deprecated Prefer formKey — deep NestedExpression exceeds seroval depth 64. */
  incoming?: NestedExpression[];
  /** @deprecated Prefer formKey — deep NestedExpression exceeds seroval depth 64. */
  outgoing?: NestedExpression[];
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
  /** Client resolves via FormMetaData[formKey] when `form` is omitted. */
  formKey?: string;
  formMetaId?: Id;
}

function resolveFetchEdges(params: FetchFormDataParams): FormFetchEdges {
  return (
    resolveEdgesFromFormKey(params.formKey ?? params.pageVertexName) ?? {
      incoming: params.incoming ?? [],
      outgoing: params.outgoing ?? [],
    }
  );
}

export function canFetchFormData(options: {
  dataId?: string;
  skipCustomGetFormData?: boolean;
  formMetaId?: string;
  metaResult?: Pick<FetchFormMetaDataResult, "form" | "formKey" | "data">;
}): boolean {
  const { dataId, skipCustomGetFormData, formMetaId, metaResult } = options;
  return !!(
    dataId &&
    dataId !== "new" &&
    !skipCustomGetFormData &&
    (formMetaId ||
      metaResult?.form ||
      metaResult?.formKey ||
      metaResult?.data?.graph)
  );
}

export function buildFetchFormDataParams(options: {
  formKey?: string;
  pageVertexName?: string;
  formDataId?: Id;
  dataId?: string;
  isNoPermissionCheck?: boolean;
  isDesignMode?: boolean;
}): FetchFormDataParams {
  return {
    formKey: options.formKey ?? options.pageVertexName,
    formDataId: options.formDataId,
    id: options.dataId === "new" ? undefined : options.dataId,
    isNoPermissionCheck: options.isNoPermissionCheck,
    hasRequiredPermissions: true,
    pageVertexName: options.pageVertexName,
    isDesignMode: options.isDesignMode,
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

  if (!(params.isNoPermissionCheck || params.hasRequiredPermissions)) {
    return { error: "Missing required permissions" };
  }

  if (params.id.startsWith("-")) {
    return { formDataId: params.id };
  }

  try {
    const edges = resolveFetchEdges(params);
    const formDataResult = await getFormData(params.id, edges);

    if (formDataResult.error || !formDataResult.data?.graph) {
      return { error: `No ${params.pageVertexName} found` };
    }

    const resolvedFormDataId =
      extractRootIdFromResult(formDataResult.data) ?? params.id;

    const componentData = await fetchComponentDataFromGraph(
      formDataResult.data,
    );

    const wireOptions = { isDesignMode: params.isDesignMode };
    prepareServerResultForWire(formDataResult.data, wireOptions);

    return {
      componentData: toComponentGraphData(componentData, wireOptions),
      data: formDataResult.data,
      formDataId: resolvedFormDataId,
    };
  } catch (e) {
    return { error: `Error When Loading Page: ${(e as Error).message}` };
  }
}
