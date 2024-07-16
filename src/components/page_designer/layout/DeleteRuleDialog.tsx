import { For } from "solid-js";
import { reconcile } from "solid-js/store";

import { useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../LayoutContext";
import { SimpleWithDismissButton } from "../settings/rules/SimpleModal";

export function DeleteRuleDialog() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  return <SimpleWithDismissButton
    closeButtonText="Close"
    description={`The Attribute or its children are used in following rules. please delete them before deleting attribute.`}
    onClose={() => setLayoutStore("usedAttrs", reconcile({}))}
    title="Delete Attribute"
  >
    <div class="mt:1rem">
      <For each={Object.keys(layoutStore.usedAttrs)}>
        {(attr) => <div class="lh:1.25rem color:rgb(185,28,28) f:0.875rem mt:0.5rem">
          <ul class="space-y:0.25rem list-style-type:disc pl:1.25rem" role="list">
            <li>The attribute {graph.vertexes[attr].P.name} is used in following rules: {layoutStore.usedAttrs[attr].map(rule => graph.vertexes[rule].P.name)}.</li>
          </ul>
        </div>}
      </For>
    </div>
  </SimpleWithDismissButton>;
}