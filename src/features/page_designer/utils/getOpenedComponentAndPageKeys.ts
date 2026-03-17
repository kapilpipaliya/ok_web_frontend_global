import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Id } from "~/lib/graph/type/id";

import type { PageLayoutObject } from "../context/LayoutContext";

export interface OpenedSchemaKeys {
  components: string[];
  pages: string[];
}

/**
 * Returns the component and page keys for all currently opened designer tabs.
 */
export function getOpenedComponentAndPageKeys(
  graph: GraphInterface,
  layoutStore: PageLayoutObject,
): OpenedSchemaKeys {
  const components: string[] = [];
  const pages: string[] = [];
  for (const openedFormId of layoutStore.openedFormIds) {
    const openVertex = graph.vertexes[openedFormId];
    if (!openVertex?.P) continue;
    const label = openVertex.P.label as string;
    const formId = openVertex.P.formId as Id | undefined;
    if (!formId) continue;
    const formStore = graph.vertexes[formId]?.P;
    const formDataId = formStore?.formDataId as Id | undefined;
    if (!formDataId) continue;
    const key = graph.vertexes[formDataId]?.P?.key as string | undefined;
    if (!key) continue;
    if (label === "Component") {
      components.push(key);
    } else if (label === "Page") {
      pages.push(key);
    }
  }
  return { components: [...new Set(components)], pages: [...new Set(pages)] };
}
