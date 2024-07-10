import { Icon } from "@iconify-icon/solid";
import jsep from "jsep";
import { For, Show, createMemo, createSignal } from "solid-js";

import { ZIndex, } from "~/components/ZIndex";
import { evaluate } from "~/lib/expression_eval";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { RulesModal } from "../properties/rules/RulesModal";

export function Rules() {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  const [showRuleSettings, setShowRuleSettings] = createSignal(false);
  const [selectedRule, setSelectedRule] = createSignal<Vertex | null>(null);
  const [displayAllRules, setDisplayAllRules] = createSignal(false);
  const rules = createMemo(() => {
    if (layoutStore.formData?.formData) {
      return (
        evaluate(jsep("->Rules"), { graph, setGraph, vertexes: [layoutStore.formData.formData] }) || []
      ).sort((a: Vertex, b: Vertex) => a.P.pos - b.P.pos);
    }
    return [];
  });

  const openRuleSettings = (rule: Vertex) => {
    setSelectedRule(rule);
    setDisplayAllRules(false);
    setShowRuleSettings(true);
  };

  const closeRuleSettings = () => {
    setSelectedRule(null);
    setShowRuleSettings(false);
  };

  const addNewRule = () => {
    setDisplayAllRules(true);
    setShowRuleSettings(true);
  };

  return (
    <div class="w-full">
      <h2>Rules:</h2>
      <button class="bg:blue-50 color:white mb:2 p:2 r:5" onClick={addNewRule}>
        Add New Rule
      </button>
      <For each={rules()}>
        {(rule) => (
          <div class="justify-between items-center p-2 border-b flex">
            <span>{rule.P.name}</span>
            <button class="" onClick={() => openRuleSettings(rule)}>
              <Icon
                class={"cursor:pointer mr:5px opacity:.5 opacity:1:hover"}
                height={22}
                icon={"mingcute:settings-5-line"}
                width={22} />
            </button>
          </div>
        )}
      </For>
      <Show when={showRuleSettings()}>
        <ZIndex>
        <RulesModal displayAllRules={displayAllRules()} selectedRule={selectedRule()} toggleModal={closeRuleSettings} />
        </ZIndex>
      </Show>
    </div>
  );
}