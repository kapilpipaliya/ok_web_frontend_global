import { For, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { SimpleWithDismissButton } from "~/components/styled/modal/SimpleModal";
import { type GraphInterface, useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import { useDesignerFormIdContext } from "../context/LayoutContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

const getAttributeNames = (
  graph: GraphInterface,
  ids: Array<Id | number>,
): string[] => {
  return ids
    .map((id) => graph.vertexes[id]?.P.key)
    .filter((key) => key !== undefined);
};

const AttributeList = (
  props: Readonly<{ attributes: string[]; title: string }>,
) => (
  <Show when={props.attributes.length > 0}>
    <As as="div" css={css`
  color: rgb(185,28,28);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`}>
      <As as="ul" css={css`
  list-style-type: disc;
  padding-left: 1.25rem;
`}>
        <li>
          {props.title} {props.attributes.join(", ")}.
        </li>
      </As>
    </As>
  </Show>
);

export function DeleteAttributeDialog() {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const nameKeyAttributes = () =>
    getAttributeNames(graph, formStoreVertex()?.P.usedAttrsInNameKeys);
  const uniqueConstraintAttributes = () =>
    getAttributeNames(graph, formStoreVertex()?.P.usedAttrsInUniqueConstraints);

  const handleClose = () => {
    mergeVertexProperties<FormStoreObject>(0, formStoreId!, graph, setGraph, {
      shouldContainAtLeastOneForm: false,
      usedAttrsInNameKeys: [],
      usedAttrsInRules: {},
      usedAttrsInUniqueConstraints: [],
    });
  };

  const descriptionParts = [
    "The attribute or its children are used in the following rules or constraints.",
    formStoreVertex()?.P.usedAttrsInRules &&
    Object.keys(formStoreVertex()?.P.usedAttrsInRules ?? {}).length > 0
      ? "Please delete them from the rules before deleting the attribute."
      : "",
    formStoreVertex()?.P.usedAttrsInNameKeys &&
    formStoreVertex()?.P.usedAttrsInNameKeys.length > 0
      ? "Please delete them from the key keys before deleting the attribute."
      : "",
    formStoreVertex()?.P.usedAttrsInUniqueConstraints &&
    formStoreVertex()?.P.usedAttrsInUniqueConstraints.length > 0
      ? "Please delete them from the unique constraints before deleting the attribute."
      : "",
    formStoreVertex()?.P.shouldContainAtLeastOneForm
      ? "Additionally, ensure that at least one form attribute is present."
      : "",
  ]
    .filter((part) => part !== "")
    .join(" ");

  return (
    <SimpleWithDismissButton
      closeButtonText="Close"
      description={descriptionParts}
      onClose={handleClose}
      title="Delete Attribute"
    >
      <As as="div" css={css`
  margin-top: 1rem;
`}>
        <For each={Object.keys(formStoreVertex()?.P.usedAttrsInRules)}>
          {(attr) => (
            <As as="div" css={css`
  color: rgb(185,28,28);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`}>
              <As as="ul" css={css`
  list-style-type: disc;
  padding-left: 1.25rem;
`}>
                <li>
                  The attribute {graph.vertexes[attr]?.P.key} is used in the
                  following rules:{" "}
                  {formStoreVertex()
                    ?.P.usedAttrsInRules[attr].map(
                      (rule) => graph.vertexes[rule]?.P.key,
                    )
                    .join(", ")}
                  .
                </li>
              </As>
            </As>
          )}
        </For>
        <AttributeList
          attributes={nameKeyAttributes()}
          title="The following attributes are used in key keys:"
        />
        <AttributeList
          attributes={uniqueConstraintAttributes()}
          title="The following attributes are used in unique constraints:"
        />
        <Show when={formStoreVertex()?.P.shouldContainAtLeastOneForm}>
          <As as="div" css={css`
  color: \${args.theme.var.color.error};
  font-size: 0.875rem;
  margin-top: 0.5rem;
`}>
            Error: At least one form attribute should be present.
          </As>
        </Show>
      </As>
    </SimpleWithDismissButton>
  );
}
