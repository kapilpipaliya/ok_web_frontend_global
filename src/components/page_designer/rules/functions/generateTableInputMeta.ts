
import { onCleanup } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { useGraph } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

export function generateTableInputMeta(metaAttribute: FieldAttribute) {
  const [graph, setGraph] = useGraph();
  const metaVertexId = graph.newVertexId;
  const metaTxnId = graph.newTxnId;

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["Attr"], metaAttribute),
    graph,
    setGraph,
  );
  addMetaVertexes(
    graph,
    setGraph,
    metaTxnId,
    graph.vertexes[metaVertexId],
    metaAttribute.attributes!,
  );
  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  return { metaVertexId };
}
