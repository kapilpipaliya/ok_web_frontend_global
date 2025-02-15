import { createSignal, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { RulesModal } from "~/features/page_designer/rules/RulesModal";
import type { Vertex } from "~/lib/graph/graph";

import { ZIndex } from "~/components/fields/ZIndex";
import { IconButton } from "~/components/styled/IconButton";

export function getRenderOptionLabelFunction(component: typeof RulesModal) {
  return function renderOptionLabel(option: Vertex) {
    const [isOpenRule, setIsOpenRule] = createSignal(false);

    return (
      <div class="flex ai:center gap:4">
        <span>{option.P.key}</span>
        <IconButton
          class="center-content flex"
          icon={"ph:gear"}
          iconClass={"opacity:.5 opacity:1:hover"}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpenRule(true);
          }}
          size={22}
        />
        <Show when={isOpenRule()}>
          <ZIndex>
            <Dynamic
              closeModal={() => setIsOpenRule(false)}
              component={component}
              onSubmit={() => setIsOpenRule(false)}
              selectedRule={option}
            />
          </ZIndex>
        </Show>
      </div>
    );
  };
}
