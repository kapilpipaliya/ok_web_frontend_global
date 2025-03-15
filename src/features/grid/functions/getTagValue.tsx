import type { CellContext } from "@tanstack/solid-table";
import type { SetStoreFunction } from "solid-js/store";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { evalExpression } from "~/lib/expression_eval";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";

import { selectedValue } from "../../../lib/graph/get/sync/edge/selectedValue";
import { formNameDisplayExprFromVertex } from "./formNameDisplayExprFromVertex";

export function getTagValue(
  props: Readonly<{
    attribute: FieldAttribute;
    graph: GraphInterface;
    info: CellContext<any, any>;
    setGraph: SetStoreFunction<GraphInterface>;
  }>,
) {
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
      const text = evalExpression(
        props.attribute.displayExpr ||
          formNameDisplayExprFromVertex(
            props.graph,
            props.attribute.collection,
          ) ||
          `::'P.${IdAttr}'`,
        {
          graph: props.graph,
          setGraph: props.setGraph,
          vertexes: [props.graph.vertexes[v]],
        },
      );
      textArray.push(text);
    }
    return textArray.join(", ");
  }
  return "";
}
