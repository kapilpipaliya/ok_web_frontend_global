import type { SetStoreFunction } from "solid-js/store";

import { Accessor, onCleanup } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SelectField } from "~/components/fields/SelectField";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { PROPERTIES } from "../../../styled/constants/constant";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";

function initializeMetaVertex(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const metaVertexId = generateNewVertexId(graph, setGraph);
  const metaTxnId = generateNewTxnId(graph, setGraph);

  addNewVertex(
    metaTxnId,
    newVertex(metaVertexId, ["Attr"], {
      key: "Attr",
      label: "Attr",
      type: "Attr",
    }),
    graph,
    setGraph,
  );

  return { metaTxnId, metaVertexId };
}

function createFieldAttributes(
  graph: GraphInterface,
  formStoreVertex: Accessor<Vertex<FormStoreObject>>,
): FieldAttribute[] {
  return [
    {
      collection: "g:'ALL_LABELS'",
      componentName: "Select",
      displayName: "Collection",
      key: "collection",
      saveValue: true,
    },
    {
      collection: () =>
        graph.vertexes[formStoreVertex()?.P.selectedId]?.P?.collection
          ? `g:'${graph.vertexes[formStoreVertex()?.P.selectedId]?.P?.collection}'`
          : "",
      componentName: "Select",
      key: "data",
    },
    {
      class: PROPERTIES.Css.TextField,
      componentName: "TextInput",
      key: "expression",
    },
  ];
}

function handleCollectionChange(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  layoutStore: () => PageLayoutObject,
  formStoreVertex: () => Vertex<FormStoreObject>,
  collMetaVertex: Vertex[],
) {
  return (value: string) => {
    setValueGlobal(
      graph,
      setGraph,
      formStoreVertex()?.P.txnId,
      collMetaVertex[0],
      graph.vertexes[formStoreVertex()?.P.selectedId],
      value,
      false,
    );
    setSelectionValue(
      formStoreVertex()?.P.txnId,
      graph.vertexes[formStoreVertex()?.P.selectedId],
      graph,
      setGraph,
      collMetaVertex[1],
      undefined,
    );
  };
}

export function CollAndData() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const { metaTxnId, metaVertexId } = initializeMetaVertex(graph, setGraph);
  const attributes = createFieldAttributes(graph, formStoreVertex);

  addMetaVertexes(
    graph,
    setGraph,
    metaTxnId,
    graph.vertexes[metaVertexId],
    attributes,
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  const metaVertex = graph.vertexes[metaVertexId];
  const collMetaVertex = getSelectionOptions(graph, setGraph, "->Attr", [
    metaVertex,
  ]);
  const onCollectionChange = handleCollectionChange(
    graph,
    setGraph,
    layoutStore,
    formStoreVertex,
    collMetaVertex.vertexes,
  );

  return (
    <>
      <div class="flex">
        <span class="flex:.5 mt:5">Expression: </span>
        <div class="flex ai:center f:15 flex:1">
          <DynamicComponent
            data={graph.vertexes[formStoreVertex()?.P.selectedId]}
            disabled={false}
            isNoPermissionCheck={true}
            meta={collMetaVertex.vertexes![2]}
            noLabel
            title={""}
            txnId={formStoreVertex()?.P.txnId}
          />
          {/* 
            <Icon icon="mdi:information-outline" class="ml:2 cursor:pointer" title="Either Expression or 'Collection and Data' is required. If Expression is configured, it will be used; otherwise, Collection and Data will be used."/>
          */}
        </div>
      </div>

      <div class="text-center mb:2 mt:2">OR</div>
      <span class="flex:.5 mt:5">Collection:</span>
      <SelectField
        componentName={"Select"}
        data={graph.vertexes[formStoreVertex()?.P.selectedId]}
        disabled={false}
        isRealTime={false}
        meta={collMetaVertex.vertexes![0]}
        onChange={onCollectionChange}
        title={"Select Collection"}
        txnId={formStoreVertex()?.P.txnId}
      />
      <span class="flex:.5 mt:5">Data:</span>
      <SelectField
        componentName={"MultiSelect"}
        data={graph.vertexes[formStoreVertex()?.P.selectedId]}
        disabled={false}
        isRealTime={false}
        meta={collMetaVertex.vertexes![1]}
        title={"Select Data"}
        txnId={formStoreVertex()?.P.txnId}
      />
    </>
  );
}
