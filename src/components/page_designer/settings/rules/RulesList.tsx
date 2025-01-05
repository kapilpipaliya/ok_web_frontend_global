import { createMemo, createSignal, For, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { IconButton } from "~/components/styled/IconButton";
import { evalExpression } from "~/lib/expression_eval";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";

import { SimpleWithDismissButton } from "../../../styled/SimpleModal";
import { PageLayoutObject, useDesignerLayoutStore } from "../../context/LayoutContext";
import { RulesModal } from "../../rules/RulesModal";
import { FormStoreObject } from "~/components/form/FormContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function RulesList() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const [selectedRule, setSelectedRule] = createSignal<null | Vertex>(null);
  const [selectedRuleToDelete, setSelectedRuleToDelete] =
    createSignal<null | Vertex>(null);

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const rules = createMemo(() => {
    if (formStoreVertex().P.formDataId) {
      return (
        evalExpression("->Rule", {
          graph,
          setGraph,
          vertexes: [graph.vertexes[formStoreVertex().P.formDataId!]],
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
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      multiHighlight: incomingIds
    });
  };

  const ruleUsageCount = (rule: Vertex) => {
    const count: Id[] = [];
    for (const key in rule.IN) {
      for (const edge of rule.IN[key]) {
        if (graph.edges[edge].S !== formStoreVertex().P.formDataId) {
          count.push(graph.edges[edge].S);
        }
      }
    }
    return count;
  };

  const unhighlightRule = () => {
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      multiHighlight: []
    });
  };

  const removeAllConditions = (rule: Vertex) => {
    const conditions =
      evalExpression("->$0Cond", {
        graph,
        setGraph,
        vertexes: [rule],
      }) || [];
    for (const condition of conditions) {
      deleteRow(
        condition,
        false,
        graph,
        setGraph,
        formStoreVertex().P.txnId,
      );
    }
  };

  const deleteRule = (rule: Vertex) => {
    removeAllConditions(rule);
    deleteRow(rule, false, graph, setGraph, formStoreVertex().P.txnId);
    setSelectedRuleToDelete(null);
  };

  const DeleteConfirmDialog = () => {
    const ruleUsage = createMemo(() => ruleUsageCount(selectedRuleToDelete()!));
    return (
      <ZIndex>
        <SimpleWithDismissButton
          closeButtonText="Cancel"
          confirmButtonText="Delete"
          description={"Are you sure you want to delete this rule?"}
          onClose={() => setSelectedRuleToDelete(null)}
          onConfirm={() => deleteRule(selectedRuleToDelete()!)}
          title="Delete Rule"
        >
          <div class="mt:1rem">
            <p>
              The rule is used at {ruleUsage().length} attributes. It will be
              removed from all places where it is used.
            </p>
            <For each={ruleUsage()}>
              {(id) => <div>{graph.vertexes[id].P.key}</div>}
            </For>
          </div>
        </SimpleWithDismissButton>
      </ZIndex>
    );
  };

  return (
    <>
      <For each={rules()}>
        {(rule, index) => (
          <div
            class="lh:1.25rem flex align-items:center b:1px|solid|lightgrey bg:gray-10:hover color:rgb(55,65,81) f:0.875rem jc:space-between px:1rem py:0.5rem"
            classList={{
              "bt:none": index() !== 0,
            }}
            onMouseEnter={() => highlightRule(rule)}
            onMouseLeave={() => unhighlightRule()}
          >
            <span class="flex:1">
              {rule.P.key} ({ruleUsageCount(rule).length} usage
              {ruleUsageCount(rule).length > 1 ? "s" : ""})
            </span>
            <div class="flex gap:2">
              <IconButton
                class="cursor:pointer opacity:.5 opacity:1:hover"
                icon="mingcute:settings-5-line"
                onClick={() => openRuleSettings(rule)}
                size={22}
                title="Edit Rule"
                type="button"
              />
              <IconButton
                class="cursor:pointer opacity:.5 opacity:1:hover"
                icon="mage:trash"
                onClick={() => setSelectedRuleToDelete(rule)}
                size={22}
                title="Delete Rule"
                type="button"
              />
            </div>
          </div>
        )}
      </For>
      <Show when={selectedRule()}>
        <ZIndex>
          <RulesModal
            closeModal={closeRuleSettings}
            onSubmit={() => closeRuleSettings()}
            selectedRule={selectedRule()}
          />
        </ZIndex>
      </Show>
      <Show when={selectedRuleToDelete()}>
        <DeleteConfirmDialog />
      </Show>
    </>
  );
}
