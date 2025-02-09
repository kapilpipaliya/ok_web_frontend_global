import { onCleanup } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useGraph } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

export function generateTableInputMeta(metaAttribute: FieldAttribute) {
  const [graph, setGraph] = useGraph();
  const metaVertexId = generateNewVertexId(graph, setGraph);
  const metaTxnId = generateNewTxnId(graph, setGraph);

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["Attr"], metaAttribute),
    graph,
    setGraph,
  );
  if (metaAttribute.attributes) {
    addMetaVertexes(
      graph,
      setGraph,
      metaTxnId,
      graph.vertexes[metaVertexId],
      metaAttribute.attributes,
    );
  }
  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  return { metaVertexId };
}
