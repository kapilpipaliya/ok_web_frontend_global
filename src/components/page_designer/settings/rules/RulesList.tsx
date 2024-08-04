import jsep from "jsep";
import { For, Show, createMemo, createSignal } from "solid-js";

import { IconButton } from "~/components/IconButton";
import { ZIndex } from "~/components/ZIndex";
import { evaluate } from "~/lib/expression_eval";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";

import { SimpleWithDismissButton } from "../../../SimpleModal";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { RulesModal } from "../../rules/RulesModal";


export function RulesList() {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [selectedRule, setSelectedRule] = createSignal<Vertex | null>(null);
  const [selectedRuleToDelete, setSelectedRuleToDelete] = createSignal<Vertex | null>(null);
  const rules = createMemo(() => {
    if (layoutStore.formStore[0]?.formData) {
      return (
        evaluate(jsep("->Rule"), {
          graph,
          setGraph,
          vertexes: [layoutStore.formStore[0].formData],
        }) || []
      ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
    }
    return [];
  });

  const openRuleSettings = (rule: Vertex) => {
    setSelectedRule(rule);
  };

  const closeRuleSettings = () => {
    setSelectedRule(null);
  };

  const highlightRule = (rule: Vertex) => {
    const incomingIds: Id[] = [];
    for (const key in rule.IN) {
      for (const edge of rule.IN[key]) {
        incomingIds.push(graph.edges[edge].S);
      }
    }
    setLayoutStore("multiHighlight", incomingIds);
  };

  const ruleUsageCount = (rule: Vertex) => {
    const count: Id[] = [];
    for (const key in rule.IN) {
      for (const edge of rule.IN[key]) {
        if (graph.edges[edge].S !== layoutStore.formStore[0].formData.id) {
          count.push(graph.edges[edge].S);
        }
      }
    }
    return count;
  };

  const unhighlightRule = () => {
    setLayoutStore("multiHighlight", []);
  };
  const removeAllConditions = (rule: Vertex) => {
    const conditions = evaluate(jsep("->$0Cond"), {
      graph,
      setGraph,
      vertexes: [rule],
    }) || [];
    for (const condition of conditions) {
      deleteRow(condition, false, graph, setGraph, layoutStore.formStore[0].txnId);
    }
  };
  const deleteRule = (rule: Vertex) => {
    removeAllConditions(rule);
    deleteRow(rule, false, graph, setGraph, layoutStore.formStore[0].txnId);
    setSelectedRuleToDelete(null);
  };
  const DeleteConfirmDialog = () => {
    const ruleUsage = createMemo(() => ruleUsageCount(selectedRuleToDelete()!));
    return <ZIndex>
      <SimpleWithDismissButton
        closeButtonText="Cancel"
        confirmButtonText="Delete"
        description={`Are you sure you want to delete this rule?`}
        onClose={() => setSelectedRuleToDelete(null)}
        onConfirm={() => deleteRule(selectedRuleToDelete()!)}
        title="Delete Rule"
      >
        <div class="mt:1rem">
          <p>The rule is used at {ruleUsage().length} attributes. It will be removed from all places where it is used.</p>
          <For each={ruleUsage()}>
            {(id) => <div>{graph.vertexes[id].P.name}</div>}
          </For>
        </div>
      </SimpleWithDismissButton>
    </ZIndex>;
  };
  return (
    <>

      <For each={rules()}>
        {(rule, index) => (
          <div class="lh:1.25rem flex align-items:center b:1px|solid|lightgrey bg:gray-10:hover color:rgb(55,65,81) f:0.875rem jc:space-between px:1rem py:0.5rem" classList={{
            "bt:none": index() != 0
          }} onMouseEnter={() => highlightRule(rule)}
            onMouseLeave={() => unhighlightRule()}
          >
            <span class="flex:1">{rule.P.name} ({ruleUsageCount(rule).length} usage{ruleUsageCount(rule).length > 1 ? "s" : ""})</span>
            <div class="flex gap:2">
              <IconButton class="cursor:pointer opacity:.5 opacity:1:hover" icon="mingcute:settings-5-line" onClick={() => openRuleSettings(rule)} size={22} title="Edit Rule" type="button" />
              <IconButton class="cursor:pointer opacity:.5 opacity:1:hover" icon="mage:trash" onClick={() => setSelectedRuleToDelete(rule)} size={22} title="Delete Rule" type="button" />
            </div>
          </div>
        )}
      </For>
      <Show when={selectedRule()}>
        <ZIndex>
          <RulesModal
            closeModal={closeRuleSettings}
            onSubmit={() => closeRuleSettings()}
            selectedRule={selectedRule()} />
        </ZIndex>
      </Show>
      <Show when={selectedRuleToDelete()}>
        <DeleteConfirmDialog />
      </Show>
    </>
  );
}
