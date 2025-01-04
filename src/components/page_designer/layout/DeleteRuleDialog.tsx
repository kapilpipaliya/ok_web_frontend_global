import { For, Show } from "solid-js";
import { reconcile } from "solid-js/store";

import { type GraphInterface, type Id, useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { FormStoreObject } from "~/components/form/FormContext";
import { PageLayoutObject } from "../context/LayoutContext";

import { SimpleWithDismissButton } from "../../styled/SimpleModal";
import { useDesignerLayoutStore } from "../context/LayoutContext";

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
    <div class="lh:1.25rem color:rgb(185,28,28) f:0.875rem mt:0.5rem">
      <ul class="space-y:0.25rem list-style-type:disc pl:1.25rem">
        <li>
          {props.title} {props.attributes.join(", ")}.
        </li>
      </ul>
    </div>
  </Show>
);

export function DeleteAttributeDialog() {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const nameKeyAttributes = () =>
    getAttributeNames(graph, layoutStore().usedAttrsInNameKeys);
  const uniqueConstraintAttributes = () =>
    getAttributeNames(graph, layoutStore().usedAttrsInUniqueConstraints);

  const handleClose = () => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      usedAttrsInRules: reconcile({}),
      usedAttrsInNameKeys: reconcile([]),
      usedAttrsInUniqueConstraints: reconcile([]),
      shouldContainAtLeastOneForm: false,
    });
  };

  const descriptionParts = [
    "The attribute or its children are used in the following rules or constraints.",
    layoutStore().usedAttrsInRules &&
    Object.keys(layoutStore().usedAttrsInRules).length > 0
      ? "Please delete them from the rules before deleting the attribute."
      : "",
    layoutStore().usedAttrsInNameKeys &&
    layoutStore().usedAttrsInNameKeys.length > 0
      ? "Please delete them from the key keys before deleting the attribute."
      : "",
    layoutStore().usedAttrsInUniqueConstraints &&
    layoutStore().usedAttrsInUniqueConstraints.length > 0
      ? "Please delete them from the unique constraints before deleting the attribute."
      : "",
    layoutStore().shouldContainAtLeastOneForm
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
      <div class="mt:1rem">
        <For each={Object.keys(layoutStore().usedAttrsInRules)}>
          {(attr) => (
            <div class="lh:1.25rem color:rgb(185,28,28) f:0.875rem mt:0.5rem">
              <ul class="space-y:0.25rem list-style-type:disc pl:1.25rem">
                <li>
                  The attribute {graph.vertexes[attr]?.P.key} is used in the
                  following rules:{" "}
                  {layoutStore().usedAttrsInRules[attr]
                    .map((rule) => graph.vertexes[rule]?.P.key)
                    .join(", ")}
                  .
                </li>
              </ul>
            </div>
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
        <Show when={layoutStore().shouldContainAtLeastOneForm}>
          <div class="lh:1.25rem color:red f:0.875rem mt:0.5rem">
            Error: At least one form attribute should be present.
          </div>
        </Show>
      </div>
    </SimpleWithDismissButton>
  );
}
