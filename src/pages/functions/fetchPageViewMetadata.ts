import {
  fetchFormData,
  type FetchFormDataResult,
  type FetchFormMetaDataResult,
} from "./fetchPageData";
import { fetchFormMetaData } from "./fetchFormMetaData";
import { resolveFormFetchEdges } from "~/lib/graph/fetch/resolveFormFetchEdges";

export interface FetchPageViewMetadataParams {
  pageVertexName?: string;
  formId?: string;
  expression?: string;
  isDesignMode?: boolean;
  pageKeyName?: string;
  url?: string;
  dataId?: string;
  formDataId?: string;
  isNoPermissionCheck?: boolean;
}

export interface FetchPageViewMetadataResult {
  formMetaId?: string;
  metaResult?: FetchFormMetaDataResult;
  dataResult?: FetchFormDataResult;
  error?: string;
}

/**
 * Loads page metadata and optional form data in one server call so the metadata
 * graph is not serialized back to the server for a second query.
 */
export async function fetchPageViewMetadata(
  params: FetchPageViewMetadataParams,
): Promise<FetchPageViewMetadataResult> {
  "use server";

  const metaResult = await fetchFormMetaData(
    params.pageVertexName,
    params.formId,
    params.expression,
    params.isDesignMode,
    params.pageKeyName,
    params.url,
  );

  if (!metaResult) {
    return { error: "404" };
  }

  if (metaResult.error) {
    return { error: metaResult.error };
  }

  const formMetaId = metaResult.formMetaId;

  const metaVertex = formMetaId
    ? metaResult.data?.graph?.vertexes[formMetaId]
    : undefined;
  const isNoPermissionCheck =
    params.isNoPermissionCheck ||
    metaVertex?.P?.isNoPermissionCheck ||
    false;

  const result: FetchPageViewMetadataResult = { formMetaId, metaResult };

  if (params.dataId && params.dataId !== "new" && formMetaId) {
    const { incoming, outgoing } = resolveFormFetchEdges(
      metaResult,
      formMetaId,
    );
    const dataResult = await fetchFormData(
      { incoming, outgoing },
      params.formDataId,
      params.dataId,
      isNoPermissionCheck,
      true,
      params.pageVertexName,
    );
    result.dataResult = dataResult;
  }

  return result;
}
