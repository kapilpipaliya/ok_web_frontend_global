import { Show } from "solid-js";

import { FormContext } from "~/components/form/FormContext";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { LeftIcons } from "../left/LeftIcons";
import { MiddleSectionButtons } from "../middle/MiddleSectionButtons";
import { ResizeViewButtons } from "../middle/ResizeViewButtons";
import { UndoRedoIcons } from "../middle/UndoRedoIcons";
import { ExportSection } from "../right/ExportSection";
import { PreviewButton } from "../right/PreviewButton";
import { RightToggleButton } from "../right/RightToggleButton";
import { SaveIconButton } from "../right/SaveIconButton";
import { DebugInfo } from "./DebugInfo";


export function HeaderRow() {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <header class="flex bg:#f3f3f4 jc:space-between r:7">
      <LeftIcons />

      <Show when={layoutStore.selectedSection === "build"}>
        <div class="flex ai:center gap:6">
          <UndoRedoIcons />
          <ResizeViewButtons />
          {/* <SettingPageIcon /> */}
        </div>
      </Show>
      <DebugInfo />
      <Show when={layoutStore.selectedSection === "setting"}>
        <div class="flex ai:center">
          <MiddleSectionButtons />
        </div>
      </Show>

      <div class="flex ai:center gap:5">
        <Show when={!layoutStore.isRightOpen || layoutStore.isSmallScreen}>
          <RightToggleButton />
        </Show>
        <FormContext.Provider value={[layoutStore.formStore]}>
          <SaveIconButton />
        </FormContext.Provider>
        <PreviewButton />
        <ExportSection />
      </div>
    </header>
  );
}
