import { type JSX, Show } from "solid-js";
import { Stepper } from "./Stepper";
import { UndoRedoIcons } from "./UndoRedoIcons";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { RenderLeftToggleButton } from "./RenderLeftToggleButton";
import { RenderRightToggleButton } from "./RenderRightToggleButton";

export function LayoutGridRowOne(): JSX.Element {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <div class={`grid ${(layoutStore.isLeftOpen && layoutStore.isRightOpen)
      ? 'grid-cols:1'
      : (!layoutStore.isLeftOpen && !layoutStore.isRightOpen)
        ? 'grid-cols:3'
        : 'grid-cols:2'} gap:4px`}>
      <Show when={!layoutStore.isLeftOpen || layoutStore.isSmallScreen}>
        <RenderLeftToggleButton />
      </Show>
      <div class="ai:center flex gap:5 p:8 jc:center">
        <UndoRedoIcons />
        <Show when={location.pathname.includes("/admin/Form/")}>
          <Stepper />
        </Show>
      </div>
      <Show when={!layoutStore.isRightOpen || layoutStore.isSmallScreen}>
        <RenderRightToggleButton />
      </Show>
    </div>


  );
}
