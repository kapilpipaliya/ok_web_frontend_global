import { isObject } from "~/lib/data_structure/object/isObject";
import {
  fetchFormData,
  type FetchFormDataResult,
  type FetchFormMetaDataResult,
} from "./fetchPageData";
import { fetchFormMetaData } from "./fetchFormMetaData";

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

  let formMetaId: string | undefined;
  if (metaResult.data) {
    if (Array.isArray(metaResult.data.result)) {
      if (metaResult.data.result.length > 0) {
        formMetaId = metaResult.data.result[0].id;
      }
    } else if (isObject(metaResult.data.result)) {
      formMetaId = metaResult.data.result.id;
    }
  }

  const metaVertex = metaResult.data?.graph?.vertexes[formMetaId!];
  const isNoPermissionCheck =
    params.isNoPermissionCheck ||
    metaVertex?.P?.isNoPermissionCheck ||
    false;

  const result: FetchPageViewMetadataResult = { formMetaId, metaResult };

  if (
    params.dataId &&
    params.dataId !== "new"
  ) {
    const dataResult = await fetchFormData(
      metaResult,
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
