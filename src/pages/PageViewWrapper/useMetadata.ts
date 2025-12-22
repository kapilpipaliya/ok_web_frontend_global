import { query, createAsync } from "@solidjs/router";
import { untrack } from "solid-js";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { isObject } from "~/lib/data_structure/object/isObject";
import { PageDesignerLabels } from "~/features/page_designer/constants/PageDesignerLabels";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import {
  fetchFormData,
  type FetchFormDataResult,
  type FetchFormMetaDataResult,
} from "../functions/fetchPageData";
import { fetchFormMetaData } from "../functions/fetchFormMetaData";
import type { PageViewConstants, PageViewWrapperProps } from "./types";
import type { PreviewStoreObject } from "~/features/page_designer/context/PreviewContext";
import type { SetStoreFunction } from "solid-js/store";
import type { ServerResult } from "~/cypher/types/ServerResult";

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
}

interface FetchFormDataParams {
  metaResult: FetchFormMetaDataResult;
  formDataId?: string;
  id?: string;
  isNoPermissionCheck?: boolean;
  hasRequiredPermissions?: boolean;
  pageVertexName?: string;
}

const fetchFormMetaDataQuery = query(
  async (params: FetchFormMetaDataParams) => {
    const metaResult = await fetchFormMetaData(
      params.pageVertexName,
      params.formId,
      params.expression,
      params.isDesignMode,
      params.pageKeyName,
      params.url,
    );
    if (!metaResult) {
      return { error: "404" } as FetchFormMetaDataResult;
    }
    return metaResult;
  },
  "fetchFormMetaData",
);

const fetchFormDataQuery = query(
  async (params: FetchFormDataParams) => {
    return await fetchFormData(
      params.metaResult,
      params.formDataId,
      params.id,
      params.isNoPermissionCheck,
      params.hasRequiredPermissions,
      params.pageVertexName,
    );
  },
  "fetchFormData",
);

const fetchCustomFormDataQuery = async (getFormData: () => Promise<ServerResult>) => {
  try {
    const data = await getFormData();
    if (!data || data.error) {
      return { error: data?.error || "Error fetching form data" };
    }
    return { dataResult: { data } };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

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

      // Extract formMetaId from metaResult
      let formMetaId = constants.formMetaId;
      if (metaResult.data) {
        if (Array.isArray(metaResult.data.result)) {
          if (metaResult.data.result.length > 0) {
            formMetaId = metaResult.data.result[0].id;
          }
        } else if (isObject(metaResult.data.result)) {
          formMetaId = metaResult.data.result.id;
        }
      }

      // Determine isNoPermissionCheck
      const metaVertex = constants.formMetaId
        ? options.graph.vertexes[constants.formMetaId]
        : metaResult.data?.graph?.vertexes[formMetaId!];

      const isNoPermissionCheck =
        constants.isNoPermissionCheck ||
        metaVertex?.P?.isNoPermissionCheck ||
        options.previewStore.isNoPermissionCheck;

      // Fetch form data if needed
      const result: {
        formMetaId?: string;
        metaResult?: FetchFormMetaDataResult;
        dataResult?: FetchFormDataResult;
        error?: string;
      } = { formMetaId, metaResult };

      if (constants.dataId && constants.dataId !== "new" && !constants.getFormData) {
        const idLocal = constants.dataId === "new" ? undefined : constants.dataId;
        const formDataParams: FetchFormDataParams = {
          metaResult,
          formDataId: constants.formDataId,
          id: idLocal,
          isNoPermissionCheck,
          hasRequiredPermissions: true,
          pageVertexName: constants.pageVertexName,
        };
        const dataResult = await fetchFormDataQuery(formDataParams);
        return { ...result, dataResult };
      }

      // Use custom getFormData if provided
      if (props.getFormData) {
        const customDataResult = await fetchCustomFormDataQuery(props.getFormData);
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
      options.setFormStore("formMetaId", props.formMetaId);
      return true;
    }
    if (!metaResult) {
      return false;
    }
    if (metaResult.error) {
      options.setFormStore("error", metaResult.error);
      return false;
    }

    if (metaResult.data) {
      const constants = options.constants();
      if (constants.formId && options.graph.vertexes[constants.formId]) {
        delete metaResult.data.graph!.vertexes[constants.formId];
      }
      setGraphData(options.graph, options.setGraph, metaResult.data.graph!);
    }

    // Process componentData from metaResult
    if (metaResult.componentData?.length) {
      for (const componentData of metaResult.componentData) {
        if (componentData.graph) {
          setGraphData(options.graph, options.setGraph, componentData.graph, {
            skipExisting: true,
          });
        }
      }
    }

    if (formMetaId) {
      options.setFormStore("formMetaId", formMetaId);
    }
    const form = metaResult.form;
    if (!(props.formMetaId || formMetaId || form)) {
      const constants = options.constants();
      options.setFormStore(
        "error",
        `${constants.pageVertexName} is not configured`,
      );
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
      options.setFormStore("formMetaId", metaVertexResult.vertex!.id);
    }
    return true;
  }

  return {
    metaData,
    setFormMetaData,
  };
}
