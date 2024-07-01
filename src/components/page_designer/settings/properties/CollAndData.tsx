import { onCleanup, useContext } from "solid-js";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import { getNewGraphId, getNewTxnId, revertTransaction } from "~/lib/graph/transaction";
import type { FieldAttribute } from "~/lib/FormMetadataType";
import { getChildVertexes } from "~/lib/graph/get/sync/traverse";
import { GraphContext } from "~/lib/graph/graph";
import { useDesignerLayoutStore } from "../../LayoutContext";

export function CollAndData() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();

  const metaVertexId = getNewGraphId();
  const metaTxnId = getNewTxnId(graph, setGraph);

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["MetaAttr"], {
      name: "Attr",
      type: "Attr",
      label: "Attr",
    }),
    graph,
    setGraph,
  );

  const attributes: FieldAttribute[] = [
    {
      name: "coll",
      displayName: "Collection",
      // TODO: The value should be saved in the vertex not in the edge
      component: "SelectBox",
      collection: "g:'ALL_LABELS'",
      parentLabel: "Coll",
      saveValue: true
    },
    {
      name: "data",
      component: "SelectBox",
      // collection: `g:'{{->$0Coll::'P.${IdAttr}'}}'`,
      collection: `g:'{{::'P.coll'}}'`,
    },
    {
      name: "data",
      component: "TextBox",
    },
  ];

  addMetaVertexes(graph, setGraph, metaTxnId, graph.vertexes[metaVertexId], attributes);

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const metaVertex = graph.vertexes[metaVertexId];
  const collMetaVertex = getChildVertexes(graph, ["MetaAttr"], [metaVertex]);

  return (
    <>
      <br />
      <span class="float:left mt:5">Collection:</span>
      <SelectInputField
        txnId={layoutStore.formData.txnId}
        title={"Collection:"}
        meta={collMetaVertex.vertexes?.[0]!}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        component={"SelectBox"}
        isRealTime={false}
      />
      <span class="float:left mt:5">Data:</span>
      <SelectInputField
        txnId={layoutStore.formData.txnId}
        title={"Data:"}
        meta={collMetaVertex.vertexes?.[1]!}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        component={"SelectBox"}
        isRealTime={false}
      />
      <span class="float:left mt:5">Expression:</span>
      <GenericInputField
        txnId={layoutStore.formData.txnId}
        title={""}
        meta={collMetaVertex.vertexes?.[2]!}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        component={"TextBox"}
      />
    </>
  );
}
