import { SetStoreFunction } from "solid-js/store";
import type { FieldAttribute } from "~/lib/FormMetadataType";
import { PageLayoutObject } from "~/components/page_designer/LayoutContext";
import { getFormMetaData } from "~/components/page_designer/functions/getChildrenAttrs";
import { GraphInterface } from "~/lib/graph/graph";


export function modifyFieldMetaAllFields(attribute: FieldAttribute, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, layoutStore: PageLayoutObject) {
  attribute.labelKey = "::'name'||::'P.displayName'||::'P.name'||::'P.id'";
  attribute.valueKey = "id";
  attribute.childrenKey = "attributes";
  attribute.options = () => getFormMetaData(graph, setGraph, layoutStore.formData.formData)
    .attributes;
  return attribute;
}
