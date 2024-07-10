import { Icon } from "@iconify-icon/solid";
import jsep from "jsep";
import { For, Show, createMemo, createSignal } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { ZIndex, } from "~/components/ZIndex";
import { evaluate } from "~/lib/expression_eval";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { RulesModal } from "../properties/rules/RulesModal";
import { AddNewState } from "./AddNewState";

export function Rules() {
return (
    <div class="w-full">
      <Header />
      <RulesList />
    </div>
  );
}

function Header() {
  let buttonRef: HTMLButtonElement;
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [showRuleSettings, setShowRuleSettings] = createSignal(false);
  const onDisplayAllRules = () => {
    setShowRuleSettings(true);
  };

  const addNewRule = () => {
    setShowDropdown(true);
  };
  return <>
    <h2>Rules:</h2>
    <div class="flex ai:center jc:space-between">
      <button class="bg:blue-50 color:white mb:2 p:2 r:5" onClick={addNewRule} ref={buttonRef!}>
        Add New Rule
      </button>
      <Show when={showDropdown()}>
        <ZIndex>
          <DropdownMenu class="r:5" onClickOutside={() => setShowDropdown(false)} parentRef={buttonRef!}>
            <AddNewState onClose={() => setShowDropdown(false)} />
          </DropdownMenu>
        </ZIndex>
      </Show>
      <button class="bg:blue-50 color:white mb:2 p:2 r:5" onClick={onDisplayAllRules}>
        All Rules
      </button>
      <Show when={showRuleSettings()}>
        <ZIndex>
          <RulesModal toggleModal={() => setShowRuleSettings(false)} />
        </ZIndex>
      </Show>
    </div>
  </>;
}

function RulesList() {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const [selectedRule, setSelectedRule] = createSignal<Vertex | null>(null);
  const rules = createMemo(() => {
    if (layoutStore.formData?.formData) {
      return (
        evaluate(jsep("->Rule"), { graph, setGraph, vertexes: [layoutStore.formData.formData] }) || []
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

  return <>
    <For each={rules()}>
      {(rule) => (
        <div class="flex ai:center bg:gray-20:hover jc:space-between p:2">
          <span>{rule.P.name}</span>
          <button class="" onClick={() => openRuleSettings(rule)}>
            <Icon
              class={"cursor:pointer opacity:.5 opacity:1:hover"}
              height={22}
              icon={"mingcute:settings-5-line"}
              width={22} />
          </button>
        </div>
      )}
    </For>
    <Show when={selectedRule()}>
      <ZIndex>
        <RulesModal selectedRule={selectedRule()} toggleModal={closeRuleSettings} />
      </ZIndex>
    </Show>
  </>;
}