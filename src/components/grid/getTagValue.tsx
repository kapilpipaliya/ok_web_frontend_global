import type { CellContext } from "@tanstack/solid-table";
import type { SetStoreFunction } from "solid-js/store";

import type { FieldAttribute } from "~/lib/FormMetadataType";

import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";

import { selectedValue } from "../fields/selectedValue";

// seems like not correct, test it.
export const getTagValue = (props: {
  attribute: FieldAttribute;
  graph: GraphInterface;
  info: CellContext<any, any>;
  setGraph: SetStoreFunction<GraphInterface>;
}) => {
  const vertex = selectedValue(
    {
      P: props.attribute,
    } as unknown as Vertex,
    props.info.row.original,
    props.graph,
  );
  if (vertex) {
    const textArray = [];
    for (const v of vertex) {
      const text = getSelectionOptions(
        props.graph,
        props.setGraph,
        props.attribute.props?.displayExpr || `::'P.${IdAttr}'`,
        [props.graph.vertexes[v]],
      ).vertexes;
      textArray.push(text);
    }
    return textArray.join(", ");
  }
  return "";
};
