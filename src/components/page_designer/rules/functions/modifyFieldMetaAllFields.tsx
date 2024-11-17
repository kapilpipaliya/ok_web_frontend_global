import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface } from "~/lib/graph/graph";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";
import { generateFormMetaAttributes } from "../../functions/generateFormMetaAttributes";

export function modifyFieldMetaAllFields(
  attribute: FieldAttribute,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStore: PageLayoutObject,
  ignoreTable?: boolean,
) {
  attribute.labelKey = "::'key'||::'P.key'||::'P.id'";
  attribute.valueKey = "id";
  attribute.childrenKey = "attributes";
  attribute.options = () =>
    generateFormMetaAttributes(
      graph,
      setGraph,
      layoutStore.formStore[0].formData,
      ignoreTable,
    ).attributes;
  return attribute;
}
