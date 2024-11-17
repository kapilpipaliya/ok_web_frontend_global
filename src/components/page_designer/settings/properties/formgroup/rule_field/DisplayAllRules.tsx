import { createSignal, Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { ZIndex } from "~/components/ZIndex";

import { RulesModal } from "../../../../rules/RulesModal";

export function DisplayAllRules() {
  const [showRuleSettings, setShowRuleSettings] = createSignal(false);

  const onDisplayAllRules = () => {
    setShowRuleSettings(true);
  };

  return (
    <>
      <IconButton
        class={"opacity:.5 opacity:1:hover"}
        icon={"mingcute:settings-5-line"}
        onClick={onDisplayAllRules}
        size={22}
      />

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
