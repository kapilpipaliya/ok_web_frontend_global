import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/LayoutContext";
import type { FieldAttribute } from "~/lib/FormMetadataType";
import type { GraphInterface } from "~/lib/graph/graph";

import { getFormMetaData } from "~/components/page_designer/functions/getChildrenAttrs";

export function modifyFieldMetaAllFields(attribute: FieldAttribute, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, layoutStore: PageLayoutObject, ignoreTable?: boolean) {
  attribute.labelKey = "::'name'||::'P.displayName'||::'P.name'||::'P.id'";
  attribute.valueKey = "id";
  attribute.childrenKey = "attributes";
  attribute.options = () => getFormMetaData(graph, setGraph, layoutStore.formData.formData, ignoreTable)
    .attributes;
  return attribute;
}
