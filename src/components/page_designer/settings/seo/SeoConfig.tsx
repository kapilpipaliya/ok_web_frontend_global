import type { SetStoreFunction } from "solid-js/store";

import { createUniqueId, For, Match, onCleanup, Switch } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { PROPERTIES } from "../../../styled/constants/constant";
import { PageLayoutObject, useDesignerLayoutStore } from "../../context/LayoutContext";
import { Label } from "../properties/formgroup/Label";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";

export function SEOFormGroupProperties() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const vertexIds = createVertexIds();

  const metaTxnId = generateNewTxnId(graph, setGraph);
  createVertices(vertexIds, metaTxnId, graph, setGraph);
  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  function metaAttributes() {
    return [
      graph.vertexes[vertexIds.seoTitle],
      graph.vertexes[vertexIds.seoDescription],
    ];
  }

  return (
    <For each={metaAttributes()}>
      {(metaVertex) => {
        return (
          <div>
            <div
              class={"flex ai:center gap:2 justify-content:space-between mt:6"}
            >
              <span class="f:15 flex:.5">
                <Label meta={metaVertex} />
              </span>
              <span class="f:15 flex:1">
                <Switch>
                  <Match when={true}>
                    <DynamicComponent
                      data={graph.vertexes[formStoreVertex()?.P.formDataId!]}
                      isNoPermissionCheck={true}
                      isRealTime={false}
                      meta={metaVertex}
                      txnId={formStoreVertex()?.P.txnId}
                    />
                  </Match>
                </Switch>
              </span>
            </div>
          </div>
        );
      }}
    </For>
  );
}

function createVertexIds() {
  return {
    seoDescription: `seoDescriptionVertex${createUniqueId()}`,
    seoTitle: `seoTitleVertex${createUniqueId()}`,
  };
}

function createVertices(
  vertexIds: ReturnType<typeof createVertexIds>,
  txnId: number,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  const vertices: ({
    attributes?: FieldAttribute[];
  } & Omit<Vertex, "IN" | "L" | "OUT">)[] = [
    {
      id: vertexIds.seoTitle,
      P: {
        class: PROPERTIES.Css.TextField,
        componentName: "TextInput",
        displayName: "SEO Title",
        key: "seoTitle",
      },
    },
    {
      id: vertexIds.seoDescription,
      P: {
        class: PROPERTIES.Css.TextField,
        componentName: "TextArea",
        displayName: "SEO Description",
        key: "seoDescription",
      },
    },
  ];

  vertices.forEach((vertex) => {
    const newVertexInstance = newVertex(vertex.id, ["MetaTemp"], vertex.P);
    addNewVertex(txnId, newVertexInstance, graph, setGraph);
    if (vertex.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[vertex.id],
        vertex.attributes,
      );
    }
  });
}
