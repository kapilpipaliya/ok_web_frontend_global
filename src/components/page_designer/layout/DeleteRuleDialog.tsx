import { For, Show } from "solid-js";
import { reconcile } from "solid-js/store";

import { GraphInterface, Id, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../LayoutContext";
import { SimpleWithDismissButton } from "../settings/rules/SimpleModal";

// Helper function to get attribute names from IDs
const getAttributeNames = (graph: GraphInterface, ids: Array<Id | number>): string[] => {
  return ids.map(id => graph.vertexes[id]?.P.name).filter(name => name !== undefined);
};

const AttributeList = (props: { attributes: string[], title: string }) => (
  <Show when={props.attributes.length > 0}>
    <div class="lh:1.25rem color:rgb(185,28,28) f:0.875rem mt:0.5rem">
      <ul class="space-y:0.25rem list-style-type:disc pl:1.25rem" role="list">
        <li>
          {props.title} {props.attributes.join(", ")}.
        </li>
      </ul>
    </div>
  </Show>
);

export function DeleteRuleDialog() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();

  const nameKeyAttributes = () => getAttributeNames(graph, layoutStore.usedAttrsInNameKeys);
  const uniqueConstraintAttributes = () => getAttributeNames(graph, layoutStore.usedAttrsInUniqueConstraints);

  return (
    <SimpleWithDismissButton
      closeButtonText="Close"
      description="The Attribute or its children are used in the following rules or constraints. Please delete them before deleting the attribute."
      onClose={() => {
        setLayoutStore("usedAttrsInRules", reconcile({}));
        setLayoutStore("usedAttrsInNameKeys", reconcile([]));
        setLayoutStore("usedAttrsInUniqueConstraints", reconcile([]));
      }}
      title="Delete Attribute"
    >
      <div class="mt:1rem">
        <For each={Object.keys(layoutStore.usedAttrsInRules)}>
          {(attr) => (
            <div class="lh:1.25rem color:rgb(185,28,28) f:0.875rem mt:0.5rem">
              <ul class="space-y:0.25rem list-style-type:disc pl:1.25rem" role="list">
                <li>
                  The attribute {graph.vertexes[attr]?.P.name} is used in the following rules: {layoutStore.usedAttrsInRules[attr].map(rule => graph.vertexes[rule]?.P.name).join(", ")}.
                </li>
              </ul>
            </div>
          )}
        </For>
        <AttributeList attributes={nameKeyAttributes()} title="The following attributes are used in name keys:" />
        <AttributeList attributes={uniqueConstraintAttributes()} title="The following attributes are used in unique constraints:" />
      </div>
    </SimpleWithDismissButton>
  );
}
