import { query, createAsync } from "@solidjs/router";
import { untrack } from "solid-js";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import {
  fetchFormData,
  buildFetchFormDataParams,
  canFetchFormData,
  type FetchFormDataResult,
  type FetchFormMetaDataResult,
  type FetchFormDataParams,
} from "../functions/fetchPageData";
import { fetchFormMetaData } from "../functions/fetchFormMetaData";
import type { PageViewConstants, PageViewWrapperProps } from "./types";
import type { PreviewStoreObject } from "~/features/page_designer/context/PreviewContext";
import type { StoreSetter as SetStoreFunction } from "solid-js";
import type { ServerResult } from "~/cypher/types/ServerResult";
import {
  toUserFacingNetworkMessage,
  withNetworkRetry,
} from "~/lib/api/withNetworkRetry";
import { getKnownComponentKeysFromGraph } from "~/lib/graph/fetch/getKnownComponentKeysFromGraph";
import { isServer } from "@solidjs/web";
import { resolveFormMeta } from "~/lib/meta/resolveFormMeta";

interface UseMetadataOptions {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  constants: () => PageViewConstants;
  setFormStore: (key: string, value: unknown) => void;
  metaTxnId: number;
  previewStore: PreviewStoreObject;
}

interface FetchFormMetaDataParams {
  pageVertexName?: string;
  formId?: string;
  expression?: string;
  isDesignMode?: boolean;
  pageKeyName?: string;
  url?: string;
  /** Component keys already in the client graph (post-hydration). */
  knownComponentKeys?: string[];
}

const fetchFormMetaDataQuery = query(
  async (params: FetchFormMetaDataParams) => {
    try {
      const metaResult = await withNetworkRetry(() =>
        fetchFormMetaData(
          params.pageVertexName,
          params.formId,
          params.expression,
          params.isDesignMode,
          params.pageKeyName,
          params.url,
          undefined,
          undefined,
          undefined,
          params.knownComponentKeys,
        ),
      );
      if (!metaResult) {
        return { error: "404" } as FetchFormMetaDataResult;
      }
      return metaResult;
    } catch (error) {
      return {
        error: toUserFacingNetworkMessage(error),
      } as FetchFormMetaDataResult;
    }
  },
  "fetchFormMetaData",
);

const fetchFormDataQuery = query(async (params: FetchFormDataParams) => {
  try {
    return await withNetworkRetry(() => fetchFormData(params));
  } catch (error) {
    return { error: toUserFacingNetworkMessage(error) };
  }
}, "fetchFormData");

const fetchCustomFormDataQuery = async (
  getFormData: () => Promise<ServerResult>,
) => {
  try {
    const data = await withNetworkRetry(() => getFormData());
    if (!data || data.error) {
      return { error: data?.error || "Error fetching form data" };
    }
    return { dataResult: { data } };
  } catch (error) {
    return { error: toUserFacingNetworkMessage(error) };
  }
};

export function useMetadata(
  props: Readonly<PageViewWrapperProps>,
  options: UseMetadataOptions,
) {
  const metaData = createAsync(
    async () => {
      const constants = options.constants();
      if (constants.pageKeyName === "favicon.ico") {
        return { error: "No meta data found" };
      }

      // Access reactive values to track them, after first await call we cant track
      const metaResultParams: FetchFormMetaDataParams = {
        pageVertexName: constants.pageVertexName,
        formId: constants.formId,
        expression: constants.expression,
        isDesignMode: constants.isDesignMode,
        pageKeyName: constants.pageKeyName,
        url: constants.url,
        // Snapshot only — must not track graph.vertexes, or applying the
        // response via setGraphData retriggers createAsync in an infinite loop.
        knownComponentKeys: isServer
          ? undefined
          : untrack(() => getKnownComponentKeysFromGraph(options.graph)),
      };
      if (constants.formMetaId) {
        if (props.getFormData) {
          return await fetchCustomFormDataQuery(props.getFormData);
        }
        return {};
      }
      const metaResult = await fetchFormMetaDataQuery(metaResultParams);
      if (metaResult.error) {
        return metaResult;
      }

      const formMetaId = metaResult.formMetaId ?? constants.formMetaId;

      const metaVertex = constants.formMetaId
        ? options.graph.vertexes[constants.formMetaId]
        : formMetaId
          ? metaResult.data?.graph?.vertexes[formMetaId]
          : undefined;

      const isNoPermissionCheck =
        constants.isNoPermissionCheck ||
        metaVertex?.P?.isNoPermissionCheck ||
        options.previewStore.isNoPermissionCheck;

      const result: {
        formMetaId?: string;
        metaResult?: FetchFormMetaDataResult;
        dataResult?: FetchFormDataResult;
        error?: string;
      } = { formMetaId, metaResult };

      const canFetch =
        canFetchFormData({
          dataId: constants.dataId,
          skipCustomGetFormData: !!constants.getFormData,
          formMetaId,
          metaResult,
        });

      if (canFetch) {
        const dataResult = await fetchFormDataQuery(
          buildFetchFormDataParams({
            formKey: metaResult.formKey ?? constants.pageVertexName,
            pageVertexName: constants.pageVertexName,
            formDataId: constants.formDataId,
            dataId: constants.dataId,
            isNoPermissionCheck,
            isDesignMode: constants.isDesignMode,
          }),
        );
        return { ...result, dataResult };
      }

      // Use custom getFormData if provided
      if (props.getFormData) {
        const customDataResult = await fetchCustomFormDataQuery(
          props.getFormData,
        );
        if (customDataResult.error) {
          result.error = customDataResult.error;
        } else {
          result.dataResult = customDataResult.dataResult;
        }
      }

      return result;
    },
    { deferStream: true },
  );

  function setFormMetaData(
    metaResult?: FetchFormMetaDataResult,
    formMetaId?: string,
  ) {
    if (props.formMetaId) {
      options.setFormStore((d) => { d.formMetaId = props.formMetaId; });
      return true;
    }
    if (!metaResult) {
      return false;
    }
    if (metaResult.error) {
      options.setFormStore((d) => { d.error = metaResult.error; });
      return false;
    }

    if (metaResult.data) {
      const constants = options.constants();
      if (constants.formId && options.graph.vertexes[constants.formId]) {
        delete metaResult.data.graph!.vertexes[constants.formId];
      }
    }

    if (metaResult.data?.graph) {
      setGraphData(options.graph, options.setGraph, metaResult.data.graph);
    }

    if (metaResult.componentData?.graph) {
      setGraphData(
        options.graph,
        options.setGraph,
        metaResult.componentData.graph,
        { skipExisting: true },
      );
    }

    if (formMetaId) {
      options.setFormStore((d) => { d.formMetaId = formMetaId; });
    }
    const form = resolveFormMeta(metaResult);
    if (!(props.formMetaId || formMetaId || form)) {
      const constants = options.constants();
      options.setFormStore((d) => { d.error = `${constants.pageVertexName} is not configured`; });
      return false;
    }
    if (form) {
      let formToUse = form;
      // improve performance only
      if (PageDesignerLabels.includes(form.key!) || form.key === "Component") {
        formToUse = {
          ...form,
          attributes: form.attributes.map((attr) => ({
            ...attr,
            attributes: attr.attributes?.filter((a) => a.key !== "Attr"),
          })),
        };
      }

      const metaVertexResult = untrack(() =>
        createMeta(
          formToUse!,
          options.metaTxnId,
          options.graph,
          options.setGraph,
        ),
      );

      if (metaVertexResult.error) {
        return false;
      }
      options.setFormStore((d) => { d.formMetaId = metaVertexResult.vertex!.id; });
    }
    return true;
  }

  return {
    metaData,
    setFormMetaData,
  };
}
