import { Icon } from "@iconify-icon/solid";
import { Show } from "solid-js";
import { reconcile } from "solid-js/store";

import { useCssEditor } from "./context";

export function ResetButton() {
  const [cssState, setCssState] = useCssEditor();

  return (
    <Show when={Object.entries(cssState).length}>
      <div class="flex jc:end p:10|0">
        <button onClick={() => setCssState(reconcile({}))} style={{ display: "flex" }}>
          <Icon icon="mdi:close" /> Reset
        </button>
      </div>
    </Show>
  );
}
