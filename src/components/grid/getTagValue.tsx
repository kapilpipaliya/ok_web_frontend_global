import {GraphInterface, IdAttr, Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction} from "solid-js/store";
import type {FieldAttribute} from "~/lib/FormMetadataType";
import type {CellContext} from "@tanstack/solid-table";
import {selectedValue} from "~/components/fields/SelectInputField";
import {getSelectionOptions} from "~/lib/graph/get/sync/traverse";

export const getTagValue = (props: {
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
  attribute: FieldAttribute;
  info: CellContext<any, any>;
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
        [props.graph.vertexes[v]],
        props.attribute.props?.displayExpr || `::'P.${IdAttr}'`,
      ).vertexes;
      textArray.push(text);
    }
    return textArray.join(", ");
  }
  return "";
};