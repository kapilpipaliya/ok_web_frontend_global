import { type JSX, Show } from "solid-js";
import { Stepper } from "./Stepper";
import { UndoRedoIcons } from "./UndoRedoIcons";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { RenderLeftToggleButton } from "./RenderLeftToggleButton";
import { RenderRightToggleButton } from "./RenderRightToggleButton";


export function LayoutGridRowOne(): JSX.Element {
  const [store, setStore] = useDesignerLayoutStore();
  return (
    <div class={`grid ${(store.isLeftOpen && store.isRightOpen)
      ? 'grid-cols:1'
      : (!store.isLeftOpen && !store.isRightOpen)
        ? 'grid-cols:3'
        : 'grid-cols:2'} gap:4px`}>
      <Show when={!store.isLeftOpen || store.isSmallScreen}>
        <RenderLeftToggleButton />
      </Show>
      <div class="ai:center flex gap:5 p:8 jc:center">
        <UndoRedoIcons />
        <Show when={location.pathname.includes("/admin/Form/")}>
          <Stepper />
        </Show>
      </div>
      <Show when={!store.isRightOpen || store.isSmallScreen}>
        <RenderRightToggleButton />
      </Show>
    </div>


  );
}
