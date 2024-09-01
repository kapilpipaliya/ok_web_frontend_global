import type { SetStoreFunction } from "solid-js/store";

import { createUniqueId, For, Match, onCleanup, Switch } from "solid-js";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { type GraphInterface, useGraph, type Vertex } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/createMeta";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { PROPERTIES } from "../../../constants/constant";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { Label } from "../properties/formgroup/Label";

export function SEOFormGroupProperties() {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const vertexIds = createVertexIds();

  const metaTxnId = graph.newTxnId;
  createVertices(vertexIds, metaTxnId, graph, setGraph);
  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
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
                      data={layoutStore.formStore[0].formData}
                      isNoPermissionCheck={true}
                      isRealTime={false}
                      meta={metaVertex}
                      txnId={layoutStore.formStore[0].txnId}
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
        componentName: "SystemString",
        displayName: "SEO Title",
        key: "seoTitle",
      },
    },
    {
      id: vertexIds.seoDescription,
      P: {
        class: PROPERTIES.Css.TextField,
        componentName: "SystemTextArea",
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
