import {type GraphInterface, IdAttr, type Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction} from "solid-js/store";
import type {FieldAttribute} from "~/lib/FormMetadataType";
import type {CellContext} from "@tanstack/solid-table";
import { selectedValue } from "../fields/selectedValue";
import {getSelectionOptions} from "~/lib/graph/get/sync/traverse";
import { collectionNameDisplayExpr } from "./collectionNameDisplayExpr";

export function getSelectValue(props: {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  attribute: FieldAttribute;
  info: CellContext<any, any>;
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
      collectionNameDisplayExpr(
        props.graph,
        props.attribute.props?.collection
      ) ||
      `::'P.${IdAttr}'`
    ).vertexes;
  }
  return "";
}