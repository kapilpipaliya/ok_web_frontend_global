import { createSignal, Show } from "solid-js";

import { ZIndex } from "~/components/ZIndex";

import { RulesModal } from "../../rules/RulesModal";

export function DisplayAllRules() {
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
            onSubmit={() => setShowRuleSettings(false)} />
        </ZIndex>
      </Show>
    </>
  );
}
