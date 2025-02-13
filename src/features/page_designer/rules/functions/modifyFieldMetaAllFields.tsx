import type { SetStoreFunction } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { generateFormMetaAttributes } from "../../functions/generateFormMetaAttributes";

export function modifyFieldMetaAllFields(
  attribute: FieldAttribute,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  formStoreVertex: Vertex<FormStoreObject>,
  ignoreTable?: boolean,
) {
  attribute.labelKey = "::'key'||::'P.key'||::'P.id'";
  attribute.valueKey = "id";
  attribute.childrenKey = "attributes";
  attribute.options = () =>
    generateFormMetaAttributes(
      graph,
      setGraph,
      graph.vertexes[formStoreVertex?.P.formDataId!],
      ignoreTable,
    ).attributes;
  return attribute;
}
