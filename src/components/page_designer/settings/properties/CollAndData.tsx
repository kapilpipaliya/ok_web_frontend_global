import { onCleanup, useContext, } from "solid-js";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import { getNewGraphId, getNewTxnId, revertTransaction } from "~/lib/graph/transaction";
import type { FieldAttribute } from "~/lib/FormMetadataType";
import { getChildVertexes } from "~/lib/graph/get/sync/traverse";
import { GraphContext } from "~/lib/graph/graph";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { ExpressionBuilder } from "~/components/ExpressionBuilder";
import { PROPERTIES } from "./constant";

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
      name: "collection",
      displayName: "Collection",
      component: "SelectBox",
      collection: "g:'ALL_LABELS'",
      saveValue: true
    },
    {
      name: "data",
      component: "SelectBox",
      collection: () => graph.vertexes[layoutStore.selectedId]?.P?.collection ? `g:'${graph.vertexes[layoutStore.selectedId]?.P?.collection}'` : "",
    },
    {
      name: "data",
      component: "TextBox",
      class: PROPERTIES.Css.TextBox
    },
  ];

  addMetaVertexes(graph, setGraph, metaTxnId, graph.vertexes[metaVertexId], attributes);

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const metaVertex = graph.vertexes[metaVertexId];
  const collMetaVertex = getChildVertexes(graph, ["MetaAttr"], [metaVertex]);

  const handleCollectionChange = (value: any) => {
    setValueGlobal(
      graph,
      setGraph,
      layoutStore.formData.txnId,
      collMetaVertex.vertexes?.[0]!,
      graph.vertexes[layoutStore.selectedId],
      value,
      false,
    )
    setValueGlobal(
      graph,
      setGraph,
      layoutStore.formData.txnId,
      collMetaVertex.vertexes?.[1]!,
      graph.vertexes[layoutStore.selectedId],
      null,
      false,
    );
  };

  return (
    <>

      <div class="flex">
        <span class="flex:.5 mt:5">Expression: </span>
        <div class="flex flex:1 f:15 ai:center">
          <GenericInputField
            txnId={layoutStore.formData.txnId}
            title={""}
            meta={collMetaVertex.vertexes?.[2]!}
            data={graph.vertexes[layoutStore.selectedId]}
            disabled={false}
            component={"TextBox"}
          />
          <ExpressionBuilder
            content={graph.vertexes[layoutStore.selectedId]?.P.data || ""}
            meta={collMetaVertex.vertexes?.[2]!}
            data={graph.vertexes[layoutStore.selectedId]}
            title={""}
            txnId={layoutStore.formData.txnId}
            component={"TextBox"}
            setValue={(value) =>
              setValueGlobal(
                graph,
                setGraph,
                layoutStore.formData.txnId,
                collMetaVertex.vertexes?.[2]!,
                graph.vertexes[layoutStore.selectedId],
                value,
                false,
              )
            }
          />
          {/* <Tooltip content="Either Expression or 'Collection and Data' is required. If Expression is configured, it will be used; otherwise, Collection and Data will be used." trigger="hover" class="z:21!">
          <Icon icon="mdi:information-outline" class="ml:2 cursor:pointer" />
        </Tooltip> */}
        </div>

      </div>

      <div class="text-center mt:2 mb:2">OR</div>
      <span class="flex.5 mt:5">Collection:</span>
      <SelectInputField
        txnId={layoutStore.formData.txnId}
        title={"Collection:"}
        meta={collMetaVertex.vertexes?.[0]!}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        component={"SelectBox"}
        isRealTime={false}
        setValue={handleCollectionChange}
      />
      <span class="flex.5 mt:5">Data:</span>
      <SelectInputField
        txnId={layoutStore.formData.txnId}
        title={"Data:"}
        meta={collMetaVertex.vertexes?.[1]!}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        component={"SelectBox"}
        isRealTime={false}
      />
    </>
  );
}
