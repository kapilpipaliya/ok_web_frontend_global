import { onCleanup, useContext, } from "solid-js";

import type { FieldAttribute } from "~/lib/FormMetadataType";

import { ExpressionBuilder } from "~/components/ExpressionBuilder";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { GraphContext } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getNewGraphId, getNewTxnId, revertTransaction } from "~/lib/graph/transaction";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { PROPERTIES } from "./constant";

export function CollAndData() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();

  const metaVertexId = getNewGraphId();
  const metaTxnId = getNewTxnId(graph, setGraph);

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["MetaAttr"], {
      label: "Attr",
      name: "Attr",
      type: "Attr",
    }),
    graph,
    setGraph,
  );

  const attributes: FieldAttribute[] = [
    {
      collection: "g:'ALL_LABELS'",
      component: "SelectBox",
      displayName: "Collection",
      name: "collection",
      saveValue: true
    },
    {
      collection: () => graph.vertexes[layoutStore.selectedId]?.P?.collection ? `g:'${graph.vertexes[layoutStore.selectedId]?.P?.collection}'` : "",
      component: "SelectBox",
      name: "data",
    },
    {
      class: PROPERTIES.Css.TextBox,
      component: "TextBox",
      name: "data"
    },
  ];

  addMetaVertexes(graph, setGraph, metaTxnId, graph.vertexes[metaVertexId], attributes);

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const metaVertex = graph.vertexes[metaVertexId];
  const collMetaVertex = getSelectionOptions(graph, setGraph, "->MetaAttr", [metaVertex]);

  const handleCollectionChange = (value: string) => {
    setValueGlobal(
      graph,
      setGraph,
      layoutStore.formData.txnId,
      collMetaVertex.vertexes![0],
      graph.vertexes[layoutStore.selectedId],
      value,
      false,
    )
    setSelectionValue(
      layoutStore.formData.txnId,
      graph.vertexes[layoutStore.selectedId],
     
      graph,
      setGraph,
      collMetaVertex.vertexes![1],
      undefined,
    );
  };

  return (
    <>

      <div class="flex">
        <span class="flex:.5 mt:5">Expression: </span>
        <div class="flex ai:center f:15 flex:1">
          <GenericInputField
            component={"TextBox"}
            data={graph.vertexes[layoutStore.selectedId]}
            disabled={false}
            meta={collMetaVertex.vertexes![2]}
            title={""}
            txnId={layoutStore.formData.txnId}
          />
          <ExpressionBuilder
            component={"TextBox"}
            content={graph.vertexes[layoutStore.selectedId]?.P.data || ""}
            data={graph.vertexes[layoutStore.selectedId]}
            meta={collMetaVertex.vertexes![2]}
            setValue={(value) =>
              setValueGlobal(
                graph,
                setGraph,
                layoutStore.formData.txnId,
                collMetaVertex.vertexes![2],
                graph.vertexes[layoutStore.selectedId],
                value,
                false,
              )
            }
            title={""}
            txnId={layoutStore.formData.txnId}
          />
          {/* <Tooltip content="Either Expression or 'Collection and Data' is required. If Expression is configured, it will be used; otherwise, Collection and Data will be used." trigger="hover">
          <Icon icon="mdi:information-outline" class="ml:2 cursor:pointer" />
        </Tooltip> */}
        </div>

      </div>

      <div class="text-center mb:2 mt:2">OR</div>
      <span class="flex.5 mt:5">Collection:</span>
      <SelectInputField
        component={"SelectBox"}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        isRealTime={false}
        meta={collMetaVertex.vertexes![0]}
        setValue={handleCollectionChange}
        title={"Select Collection"}
        txnId={layoutStore.formData.txnId}
      />
      <span class="flex.5 mt:5">Data:</span>
      <SelectInputField
        component={"SelectBox"}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        isRealTime={false}
        meta={collMetaVertex.vertexes![1]}
        title={"Select Data"}
        txnId={layoutStore.formData.txnId}
      />
    </>
  );
}
