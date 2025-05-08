import { createMemo, For, Match, Show, Switch } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph } from "~/lib/graph/GraphContext";
import { PROPERTIES } from "~/pages/settings/constants";
import { TextInputField } from "~/components/fields/TextInputField";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function ComponentVariantsInput(props: {
  compVertex: Vertex;
  dataVertex: Vertex;
  setPropertyValue: (meta: Vertex, value: any) => void;
}) {
  const [graph, setGraph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const variants = createMemo(() => {
    return evalExpression("->$0Variant", {
      graph,
      setGraph,
      vertexes: [props.compVertex],
    }) as Vertex[];
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
              vertexes: [variant],
            }) as Vertex[];
          });
          return (
            <As
              as="div"
              css={css`
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
`}
            >
              <As
                as="span"
                css={css`
  font-size: 15px;
  flex: 0.5;
`}
              >
                {variant.P.label || variant.P.key}
                {variant.P.defValue !== undefined &&
                  variant.P.defValue !== null && (
                    <As
                      as="span"
                      css={css`
                    color: #888;
                    font-size: 13px;
                  `}
                    >
                      {" "}
                      ({String(variant.P.defValue)})
                    </As>
                  )}
              </As>
              <As
                as="div"
                css={css`
  display: flex;
  font-size: 15px;
  flex: 1;
  gap: 1px;
`}
              >
                <Switch>
                  <Match when={options() && options().length > 0}>
                    <As
                      as="select"
                      css={[
                        PROPERTIES.Css.TextFieldCss,
                        css`
  flex: 1;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 1px;
  padding-bottom: 1px;
  border: 1px solid #ccc;
  border-radius: 4px;
`,
                      ]}
                      onChange={(e) =>
                        props.setPropertyValue(variant, e.currentTarget.value)
                      }
                      value={props.dataVertex.P[variant.P.key] || ""}
                    >
                      <option value="">Select...</option>
                      <For each={options()}>
                        {(option) => (
                          <option value={option.P.value}>{option.P.key}</option>
                        )}
                      </For>
                    </As>
                  </Match>
                  <Match when={!options() || options().length === 0}>
                    <As
                      as={TextInputField}
                      css={css`
  flex: 1;
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 1px;
  padding-bottom: 1px;
  border: 1px solid #ccc;
  border-radius: 4px;
`}
                      onChange={(value) =>
                        props.setPropertyValue(variant, value)
                      }
                      type={
                        variant.P.type === "boolean"
                          ? "checkbox"
                          : variant.P.type === "number"
                            ? "number"
                            : variant.P.type === "date"
                              ? "date"
                              : "text"
                      }
                      value={props.dataVertex.P[variant.P.key] || ""}
                    />
                  </Match>
                </Switch>
                <Show
                  when={
                    props.dataVertex.P[variant.P.key] !== undefined &&
                    props.dataVertex.P[variant.P.key] !== null
                  }
                >
                  <IconButton
                    css={css`
  color: \${args.theme.var.color.error};
  border: none;
  background-color: transparent;
`}
                    icon="ph:x"
                    onClick={() => props.setPropertyValue(variant, null)}
                    size={16}
                  />
                </Show>
              </As>
            </As>
          );
        }}
      </For>
    </div>
  );
}
