import { type JSX, Show } from "solid-js";

import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";

import { LeftToggleButton } from "./LeftToggleButton";
import { RightToggleButton } from "./RightToggleButton";
import { UndoRedoIcons } from "./UndoRedoIcons";
import { FormStepper } from "./form_stepper/FormStepper";

export function LayoutGridRowOne(): JSX.Element {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <div class={`${(layoutStore.isLeftOpen && layoutStore.isRightOpen)
      ? 'grid-cols:1'
      : (!layoutStore.isLeftOpen && !layoutStore.isRightOpen)
        ? 'grid-cols:3'
        : 'grid-cols:2'} grid gap:4px`}>
      <Show when={!layoutStore.isLeftOpen || layoutStore.isSmallScreen}>
        <LeftToggleButton />
      </Show>
      <div class="flex ai:center gap:5 jc:center p:8">
        <UndoRedoIcons />
        <Show when={location.pathname.includes("/admin/Form/")}>
          <FormStepper />
        </Show>
      </div>
      <Show when={!layoutStore.isRightOpen || layoutStore.isSmallScreen}>
        <RightToggleButton />
      </Show>
    </div>


  );
}
