import type {Store} from "solid-js/store";

import type {GraphInterface, Id, Vertex} from "~/lib/graph/graph";

import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";

export function addPropsToLayoutRow(
  graph: Store<GraphInterface>,
  txnId: number,
  layoutRowId: Id,
  componentVertex: Vertex,
) {
  const propVertexes = getSelectionOptions(graph, () => 0, "->$0Prop", [componentVertex]);
  if (propVertexes.vertexes) {
    const initialValues = propVertexes.vertexes.reduce(
      (acc, curr) => {
        if (typeof curr.P.value === "boolean") {
          acc[curr.P.key] = curr.P.value;
        } else if (curr.P.value) {
          acc[curr.P.key] = curr.P.value;
        }
        return acc;
      },
      {} as { [key: string]: any },
    );
    // TODO: This has no effect so commenting it.
    // replaceVertexProperties(txnId, layoutRowId, initialValues);
  }
}