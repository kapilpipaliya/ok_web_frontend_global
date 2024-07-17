import type { SetStoreFunction } from "solid-js/store";

import { createWritableMemo } from "@solid-primitives/memo";
import {
  For,
  Match,
  Switch,
  createUniqueId,
  onCleanup,
} from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { type GraphInterface, type Vertex, useGraph } from "~/lib/graph/graph";
import {
  addNewVertex,
  deleteVertex,
  newVertex,
} from "~/lib/graph/mutate/vertex";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { PROPERTIES } from "../properties/constant";
import { Label } from "../properties/formgroup/Label";

export function SEOFormGroupProperties() {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();

  const vertexIds = createVertexIds();

  createVertices(vertexIds, graph, setGraph);

  function metaAttributes() {
    return [
      graph.vertexes[vertexIds.seoTitle],
      graph.vertexes[vertexIds.seoDescription],
    ];
  }

  onCleanup(() => {
    cleanupVertices(vertexIds, graph, setGraph);
  });

  return (
    <>
      <For each={metaAttributes()}>
        {(metaVertex) => {
          const [meta, setMeta] = useMetaMemo(metaVertex);
          const P = { ...meta().P };
          const v = { ...metaVertex, P };
          setMeta(v);

          return (
            <div>
              <div
                class={`flex ai:center gap:2 justify-content:space-between mt:6`}
              >
                <span class="f:15 flex:.5">
                  <Label metaVertex={metaVertex} />
                </span>
                <span class="f:15 flex:1">
                  <Switch>
                    <Match when={true}>
                      <DynamicComponent
                        componentName={metaVertex.P.componentName}
                        data={layoutStore.formData.formData}
                        isRealTime={false}
                        meta={metaVertex}
                        txnId={layoutStore.formData.txnId}
                      />
                    </Match>
                  </Switch>

                </span>
              </div>
            </div>
          );
        }}
      </For>
    </>
  );
}

function createVertexIds() {
  return {
    seoDescription: `seoDescriptionVertex${createUniqueId()}`,
    seoTitle: `seoTitleVertex${createUniqueId()}`,
  };
}

function createVertices(vertexIds: ReturnType<typeof createVertexIds>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>,) {
  addNewVertex(0, newVertex(vertexIds.seoTitle, ["MetaTemp"], createVertexMeta("SEO Title", "seoTitle", { class: PROPERTIES.Css.TextBox, componentName: "TextBox" })), graph, setGraph);
  addNewVertex(0, newVertex(vertexIds.seoDescription, ["MetaTemp"], createVertexMeta("SEO Description", "seoDescription", { class: PROPERTIES.Css.TextBox, componentName: "TextArea" })), graph, setGraph);
}

function createVertexMeta(displayName: string, name: string, other: Record<string, any> = {}) {
  return { displayName, name, ...other };
}

function cleanupVertices(vertexIds: ReturnType<typeof createVertexIds>, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  Object.values(vertexIds).forEach(id => deleteVertex(0, id, graph, setGraph));
}

function useMetaMemo(metaVertex: Vertex) {
  return createWritableMemo(() => {
    if (["seoDescription", "seoTitle"].includes(metaVertex.P.name)) {
      return { ...metaVertex };
    }
    const form = FormMetaData.Comp;
    const propAttribute = form.attributes.find(
      (attr) => attr.name === "Prop",
    )!;
    const valueAttribute = propAttribute.attributes!.find(
      (attr) => attr.name === "value",
    )!;
    const P = {
      ...metaVertex.P,
      componentName: valueAttribute.componentName,
      meta: valueAttribute.meta,
    };
    return { ...metaVertex, P };
  });
}
