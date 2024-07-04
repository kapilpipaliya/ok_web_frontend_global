import type {CellContext} from "@tanstack/solid-table";
import type {SetStoreFunction} from "solid-js/store";

import type {FieldAttribute} from "~/lib/FormMetadataType";

import {getSelectionOptions} from "~/lib/graph/get/sync/traverse";
import {type GraphInterface, IdAttr, type Vertex} from "~/lib/graph/graph";

import { selectedValue } from "../fields/selectedValue";
import { formNameDisplayExprFromVertex } from "./formNameDisplayExprFromVertex";

export function getSelectNameValue(props: {
  attribute: FieldAttribute;
  graph: GraphInterface;
  info: CellContext<any, any>;
  setGraph: SetStoreFunction<GraphInterface>;
}) {
  const vertex = selectedValue(
    {
      P: props.attribute,
    } as unknown as Vertex,
    props.info.row.original,
    props.graph
  );
  if (vertex[0]) {
    return getSelectionOptions(
      props.graph,
      props.setGraph,
      [props.graph.vertexes[vertex[0]]],
      props.attribute.props?.displayExpr ||
      formNameDisplayExprFromVertex(
        props.graph,
        props.attribute.props?.collection
      ) ||
      `::'P.${IdAttr}'`
    ).vertexes;
  }
  return "";
}