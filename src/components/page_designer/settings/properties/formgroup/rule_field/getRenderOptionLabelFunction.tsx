import { Show, createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { RulesModal } from "~/components/page_designer/rules/RulesModal";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/IconButton";
import { ZIndex } from "~/components/ZIndex";

export function getRenderOptionLabelFunction(component: typeof RulesModal) {
  return function renderOptionLabel(option: Vertex) {
    const [isOpenRule, setIsOpenRule] = createSignal(false);

    return (
      <div class="flex ai:center gap:4">
        <span>{option.P.name}</span>
        <IconButton
          class="center-content flex"
          icon={"mingcute:settings-5-line"}
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
