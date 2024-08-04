import type { SetStoreFunction } from "solid-js/store";

import { onCleanup } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SelectField } from "~/components/fields/SelectField";
import {DynamicComponent} from "~/components/form/DynamicComponent";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { type GraphInterface, type Vertex, useGraph } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { type PageLayoutObject, useDesignerLayoutStore } from "../../LayoutContext";
import { PROPERTIES } from "./constant";

function initializeMetaVertex(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  const metaVertexId = graph.newVertexId;
  const metaTxnId = graph.newTxnId;

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["Attr"], {
      label: "Attr",
      name: "Attr",
      type: "Attr",
    }),
    graph,
    setGraph
  );

  return { metaTxnId, metaVertexId };
}

function createFieldAttributes(graph: GraphInterface, layoutStore: PageLayoutObject): FieldAttribute[] {
  return [
    {
      collection: "g:'ALL_LABELS'",
      componentName: "SelectBox",
      displayName: "Collection",
      name: "collection",
      saveValue: true,
    },
    {
      // collection: `g:'{{->$0Coll::'P.${IdAttr}'}}'`,
      collection: () =>
        graph.vertexes[layoutStore.selectedId]?.P?.collection
          ? `g:'${graph.vertexes[layoutStore.selectedId]?.P?.collection}'`
          : "",
      componentName: "SelectBox",
      name: "data",
    },
    {
      class: PROPERTIES.Css.TextBox,
      componentName: "TextBox",
      name: "data",
    },
  ];
}

function handleCollectionChange(graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, layoutStore: PageLayoutObject, collMetaVertex: Vertex[]) {
  return (value: string) => {
    setValueGlobal(
      graph,
      setGraph,
      layoutStore.formStore[0].txnId,
      collMetaVertex[0],
      graph.vertexes[layoutStore.selectedId],
      value,
      false
    );
    setSelectionValue(
      layoutStore.formStore[0].txnId,
      graph.vertexes[layoutStore.selectedId],
      graph,
      setGraph,
      collMetaVertex[1],
      undefined
    );
  };
}

export function CollAndData() {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const { metaTxnId, metaVertexId } = initializeMetaVertex(graph, setGraph);
  const attributes = createFieldAttributes(graph, layoutStore);

  addMetaVertexes(graph, setGraph, metaTxnId, graph.vertexes[metaVertexId], attributes);

  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });

  const metaVertex = graph.vertexes[metaVertexId];
  const collMetaVertex = getSelectionOptions(graph, setGraph, "->Attr", [metaVertex]);
  const onCollectionChange = handleCollectionChange(graph, setGraph, layoutStore, collMetaVertex.vertexes);

  return (
    <>
      <div class="flex">
        <span class="flex:.5 mt:5">Expression: </span>
        <div class="flex ai:center f:15 flex:1">
          <DynamicComponent
            componentName={"TextBox"}
            data={graph.vertexes[layoutStore.selectedId]}
            disabled={false}
            isNoPermissionCheck={true}
            meta={collMetaVertex.vertexes![2]}
            title={""}
            txnId={layoutStore.formStore[0].txnId}
          />
          {/* 
            <Icon icon="mdi:information-outline" class="ml:2 cursor:pointer" title="Either Expression or 'Collection and Data' is required. If Expression is configured, it will be used; otherwise, Collection and Data will be used."/>
          */}
        </div>
      </div>

      <div class="text-center mb:2 mt:2">OR</div>
      <span class="flex:.5 mt:5">Collection:</span>
      <SelectField
        componentName={"SelectBox"}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        isRealTime={false}
        meta={collMetaVertex.vertexes![0]}
        setValue={onCollectionChange}
        title={"Select Collection"}
        txnId={layoutStore.formStore[0].txnId}
      />
      <span class="flex:.5 mt:5">Data:</span>
      <SelectField
        componentName={"TagBox"}
        data={graph.vertexes[layoutStore.selectedId]}
        disabled={false}
        isRealTime={false}
        meta={collMetaVertex.vertexes![1]}
        title={"Select Data"}
        txnId={layoutStore.formStore[0].txnId}
      />
    </>
  );
}
