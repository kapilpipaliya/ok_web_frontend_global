import { Icon } from "@iconify-icon/solid";
import jsep from "jsep";
import { For, Show, createMemo, createSignal } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { ZIndex } from "~/components/ZIndex";
import { evaluate } from "~/lib/expression_eval";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";
import { deleteRow } from "~/lib/graph/mutate/deleteRow";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { RulesModal } from "../properties/rules/RulesModal";
import { AddNewRule } from "./AddNewRule";
import { SimpleWithDismissButton } from "./SimpleModal";

export function Rules() {
  return (
    <div class="w-full">
      <Header />
      <RulesList />
    </div>
  );
}
function AddNewRuleButton() {
  let buttonRef: HTMLButtonElement;
  const [showDropdown, setShowDropdown] = createSignal(false);

  const addNewRule = () => {
    setShowDropdown(true);
  };
  return (
    <>
      <button
        class="bg:blue-50 color:white mb:2 p:2 r:5"
        onClick={addNewRule}
        ref={buttonRef!}
      >
        Add New Rule
      </button>
      <Show when={showDropdown()}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={() => setShowDropdown(false)}
            parentRef={buttonRef!}
          >
            <AddNewRule onClose={() => setShowDropdown(false)} />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
function DisplayAllRules() {
  const [showRuleSettings, setShowRuleSettings] = createSignal(false);
  const onDisplayAllRules = () => {
    setShowRuleSettings(true);
  };
  return (
    <>
      <button
        class="bg:blue-50 color:white mb:2 p:2 r:5"
        onClick={onDisplayAllRules}
      >
        All Rules
      </button>
      <Show when={showRuleSettings()}>
        <ZIndex>
          <RulesModal
            closeModal={() => setShowRuleSettings(false)}
            onSubmit={() => setShowRuleSettings(false)}
          />
        </ZIndex>
      </Show>
    </>
  );
}

function Header() {
  return (
    <>
      <h2>Rules:</h2>
      <div class="flex ai:center jc:space-between">
        <AddNewRuleButton />
        <DisplayAllRules />
      </div>
    </>
  );
}

function RulesList() {
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [selectedRule, setSelectedRule] = createSignal<Vertex | null>(null);
  const [selectedRuleToDelete, setSelectedRuleToDelete] = createSignal<Vertex | null>(null);
  const rules = createMemo(() => {
    if (layoutStore.formData?.formData) {
      return (
        evaluate(jsep("->Rule"), {
          graph,
          setGraph,
          vertexes: [layoutStore.formData.formData],
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
  }

  const ruleUsageCount = (rule: Vertex) => {
    let count = 0;
    for (const key in rule.IN) {
      for (const edge of rule.IN[key]) {
        if (graph.edges[edge].id !== rule.id) {
          count += 1;
        }
      }
    }
    return count;
  }

  const unhighlightRule = () => {
    setLayoutStore("multiHighlight", []);
  }
  const removeAllConditions = (rule: Vertex) => {
    const conditions = evaluate(jsep("->$0Cond"), {
      graph,
      setGraph,
      vertexes: [rule],
    }) || [];
    for (const condition of conditions) {
      deleteRow(condition, false, graph, setGraph, layoutStore.formData.txnId);
    }
  }
  const deleteRule = (rule: Vertex) => {
    removeAllConditions(rule);
    deleteRow(rule, false, graph, setGraph, layoutStore.formData.txnId);
    setSelectedRuleToDelete(null);
  }
  return (
    <>
      <For each={rules()}>
        {(rule) => (
          <div class="flex bg:gray-20:hover jc:space-between p:2" onMouseEnter={() => highlightRule(rule)} onMouseLeave={() => unhighlightRule()}>
            <span class="flex:1">{rule.P.name}</span>
            <div class="flex gap:2">
              <button class="flex ai:center" onClick={() => openRuleSettings(rule)}>
                <Icon
                  class={"cursor:pointer opacity:.5 opacity:1:hover"}
                  height={22}
                  icon={"mingcute:settings-5-line"}
                  width={22}
                />
              </button>
              <button class="flex ai:center color:red" onClick={() => setSelectedRuleToDelete(rule)}>
                <Icon
                  class={"cursor:pointer opacity:.5 opacity:1:hover"}
                  height={22}
                  icon={"mage:trash"}
                  width={22}
                />
              </button>
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
        <ZIndex>
          <SimpleWithDismissButton
            confirmButtonText="Delete"
            description={`Are you sure you want to delete this rule?`}
            onClose={() => setSelectedRuleToDelete(null)}
            onConfirm={() => deleteRule(selectedRuleToDelete()!)}
            title="Delete Rule"
          >
            <div class="mt:1rem">
              <p>The rule is used at {ruleUsageCount(selectedRuleToDelete()!)} places. It will be removed from all places where it is used.</p>
            </div>
          </SimpleWithDismissButton>
        </ZIndex>
      </Show>
    </>
  );
}
