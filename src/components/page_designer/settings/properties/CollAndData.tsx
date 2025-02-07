import type { SetStoreFunction } from "solid-js/store";

import { type Accessor, onCleanup } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SelectField } from "~/components/fields/SelectField";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { evalExpression } from "~/lib/expression_eval";
import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { PROPERTIES } from "../../../styled/constants/constant";
import {
  useDesignerFormIdContext,
} from "../../context/LayoutContext";

export function CollAndData() {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

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
  const collMetaVertex = evalExpression("->Attr", {
    graph,
    setGraph,
    vertexes: [metaVertex],
  }) ?? [];
  const onCollectionChange = handleCollectionChange(
    graph,
    setGraph,
    formStoreVertex,
    collMetaVertex,
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
            meta={collMetaVertex![2]}
            noLabel
            title={""}
            txnId={formStoreVertex()?.P.txnId}
          />
          {/* 
            <Icon icon="mdi:information-outline" noobserver class="ml:2 cursor:pointer" title="Either Expression or 'Collection and Data' is required. If Expression is configured, it will be used; otherwise, Collection and Data will be used."/>
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
        meta={collMetaVertex![0]}
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
        meta={collMetaVertex![1]}
        title={"Select Data"}
        txnId={formStoreVertex()?.P.txnId}
      />
    </>
  );
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
