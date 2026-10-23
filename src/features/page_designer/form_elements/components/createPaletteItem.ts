import type { StoreSetter as SetStoreFunction } from "solid-js";

import { checkUniqueConstrains } from "~/cypher/mutate/validations/checkUniqueConstrains";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

import { openInNewInternalTab } from "../pages/functions/openInNewInternalTab";
import {
  type PaletteTreeConfig,
  resolvePaletteSaveCategoryId,
} from "./componentPaletteConfig";
import {
  fetchCategoryChildren,
  getPaletteServerError,
  isPaletteServerSuccess,
  moveContentToCategory,
} from "./componentPaletteApi";

function getDefaultProperties(
  label: string,
  url?: string,
): Record<string, unknown> {
  switch (label) {
    case "Page":
      return {
        fns: "return { enabled: () => true }",
        ...(url ? { url } : {}),
      };
    case "EmailTemplate":
      return { fns: "return { enabled: () => true }" };
    case "Function":
      return { body: "// Enter function body\n" };
    default:
      return {};
  }
}

function defaultUrlFromKey(key: string) {
  const slug = key.trim().toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
  return slug.startsWith("/") ? slug : `/${slug}`;
}

export async function createPaletteItem(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  options: {
    config: PaletteTreeConfig;
    key: string;
    url?: string;
    layoutStoreId: Id;
    selectedCategoryId: Id | null | undefined;
  },
): Promise<
  { success: true; vertex: Vertex } | { success: false; error: string }
> {
  const label = options.config.tableVertexLabel;
  const pageUrl =
    label === "Page"
      ? options.url?.trim() || defaultUrlFromKey(options.key)
      : undefined;

  if (label === "Page" && !pageUrl) {
    return { success: false, error: "URL is required for Page" };
  }

  const uniqueCheck = await checkUniqueConstrains({
    L: [label],
    P: {
      key: options.key,
      ...(pageUrl ? { url: pageUrl } : {}),
    },
  } as unknown as Vertex);

  if (typeof uniqueCheck.error === "string") {
    return { success: false, error: uniqueCheck.error };
  }

  const txnId = generateNewTxnId(graph, setGraph);
  const createResult = createFormVertex(graph, setGraph, txnId, label, {
    key: options.key,
    ...getDefaultProperties(label, pageUrl),
  });

  if (createResult.error || !createResult.vertex) {
    return {
      success: false,
      error: createResult.error || `Failed to create ${label}`,
    };
  }

  const data = commitTxn(txnId, graph);
  if (!data) {
    return { success: false, error: "Internal Server Error" };
  }

  try {
    await submitDataCall({ ...data }, graph, setGraph, txnId);
  } catch {
    return { success: false, error: "Failed to save new item" };
  }

  const savedVertex =
    findVertexByLabelAndUniqueId(graph, label, "key", options.key) ??
    createResult.vertex;

  const categoryId = resolvePaletteSaveCategoryId(
    graph,
    options.selectedCategoryId,
    options.config,
  );

  if (categoryId) {
    const categoryResult = await moveContentToCategory(
      graph,
      setGraph,
      options.config,
      [savedVertex.id],
      categoryId,
    );
    if (!isPaletteServerSuccess(categoryResult)) {
      return {
        success: false,
        error: getPaletteServerError(
          categoryResult,
          "Failed to assign item to category",
        ),
      };
    }
    await fetchCategoryChildren(graph, setGraph, options.config, categoryId, {
      defer: false,
    });
  }

  openInNewInternalTab(options.layoutStoreId, savedVertex, graph, setGraph);

  return { success: true, vertex: savedVertex };
}

export { defaultUrlFromKey };
