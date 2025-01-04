import type { SetStoreFunction } from "solid-js/store";

import type { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";
import type { FormStoreObject } from "~/components/form/FormContext";

import { generateFormMetaAttributes } from "../../functions/generateFormMetaAttributes";

export function modifyFieldMetaAllFields(
  attribute: FieldAttribute,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStoreId: Id,
  ignoreTable?: boolean,
) {
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  attribute.labelKey = "::'key'||::'P.key'||::'P.id'";
  attribute.valueKey = "id";
  attribute.childrenKey = "attributes";
  attribute.options = () =>
    generateFormMetaAttributes(
      graph,
      setGraph,
      graph.vertexes[formStoreVertex().P.formDataId!],
      ignoreTable,
    ).attributes;
  return attribute;
}
