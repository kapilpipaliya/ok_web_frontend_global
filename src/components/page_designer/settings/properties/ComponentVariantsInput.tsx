import { createMemo, For, Switch, Match, Show } from "solid-js";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { PROPERTIES } from "~/components/styled/constants/constant";
import { evalExpression } from "~/lib/expression_eval";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { IconButton } from "~/components/styled/IconButton";

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
                      value={props.dataVertex.P[variant.P.key] || ""}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.value)}
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
                      type="checkbox"
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      checked={props.dataVertex.P[variant.P.key] || false}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.checked)} />
                  </Match>
                  <Match when={variant.P.type?.toLowerCase() === "number" || variant.P.type?.toLowerCase() === "date"}>
                    <input
                      type={variant.P.type?.toLowerCase()}
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      value={props.dataVertex.P[variant.P.key] || ""}
                      onChange={(e) => props.setPropertyValue(variant,
                        variant.P.type?.toLowerCase() === "number" ? Number(e.currentTarget.value) : e.currentTarget.value
                      )} />
                  </Match>
                  <Match when={true}>
                    <input
                      type="text"
                      class={`${PROPERTIES.Css.TextField} flex-1 px:2 py:1 border rounded`}
                      value={props.dataVertex.P[variant.P.key] || ""}
                      onChange={(e) => props.setPropertyValue(variant, e.currentTarget.value)} />
                  </Match>
                </Switch>
                <Show when={props.dataVertex.P[variant.P.key] !== undefined && props.dataVertex.P[variant.P.key] !== null}>
                  <IconButton
                    icon="ph:x"
                    class="color:red"
                    size={16}
                    onClick={() => props.setPropertyValue(variant, null)}
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
