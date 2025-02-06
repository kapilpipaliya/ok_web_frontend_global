import { createMemo, For, Match, Show, Switch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { IconButton } from "~/components/styled/IconButton";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import { useDesignerFormIdContext } from "../../context/LayoutContext";

export function ComponentVariantsInput(props: { compVertex: Vertex; dataVertex: Vertex; setPropertyValue: (meta: Vertex, value: any) => void; }) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const variants = createMemo(() => {
    return evalExpression("->$0Variant", { graph, setGraph, vertexes: [props.compVertex] }) as Vertex[];
  });

  // createEffect(() => {
  //   if (variants().length === 0) {
  //     // Fetch variants data if not already loaded
  //     fetchComponentData([graph.vertexes[formStoreVertex()?.P.selectedComponent]], graph, setGraph);
  //   }
  // });
  return (
    <div class="">
      <For each={variants()}>
        {(variant) => {
          const options = createMemo(() => {
            return evalExpression("->$0Option", {
              graph,
              setGraph,
              vertexes: [variant]
            }) as Vertex[];
          });
          return (
            <div class="flex ai:center gap:2 justify-content:space-between mt:6">
              <span class="f:15 flex:.5">{variant.P.label || variant.P.key}</span>
              <div class="flex f:15 flex:1 gap:1px">
                <Switch>
                  <Match when={options()}>
                    <select
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.value)}
                      value={props.dataVertex.P[variant.P.key] || ""}
                    >
                      <option value="">Select...</option>
                      <For each={options()}>
                        {(option) => (
                          <option value={option.P.value}>{option.P.key}</option>
                        )}
                      </For>
                    </select>
                  </Match>
                  <Match when={variant.P.type?.toLowerCase() === "boolean"}>
                    <input
                      checked={props.dataVertex.P[variant.P.key] || false}
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.checked)}
                      type="checkbox" />
                  </Match>
                  <Match when={variant.P.type?.toLowerCase() === "number" || variant.P.type?.toLowerCase() === "date"}>
                    <input
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      onChange={(e) => props.setPropertyValue(variant,
                        variant.P.type?.toLowerCase() === "number" ? Number(e.currentTarget.value) : e.currentTarget.value
                      )}
                      type={variant.P.type?.toLowerCase()}
                      value={props.dataVertex.P[variant.P.key] || ""} />
                  </Match>
                  <Match when={true}>
                    <input
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.value)}
                      type="text"
                      value={props.dataVertex.P[variant.P.key] || ""} />
                  </Match>
                </Switch>
                <Show when={props.dataVertex.P[variant.P.key] !== undefined && props.dataVertex.P[variant.P.key] !== null}>
                  <IconButton
                    class="color:red"
                    icon="ph:x"
                    onClick={() => props.setPropertyValue(variant, null)}
                    size={16}
                  />
                </Show>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
