import { Show } from "solid-js";

import { UserDropdownMenuDisplay } from "~/pages/admin_layout/DropdownMenuDisplay";
import { SelectThemeButton } from "~/pages/admin_layout/theme/SelectThemeButton";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { PageLayoutObject, useDesignerFormIdContext } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { LeftIcons } from "../left/LeftIcons";
import { MiddleSectionButtons } from "../middle/MiddleSectionButtons";
import { ResizeViewButtons } from "../middle/ResizeViewButtons";
import { UndoRedoIcons } from "../middle/UndoRedoIcons";
import { ExportSection } from "../right/ExportSection";
import { PreviewButton } from "../right/PreviewButton";
import { RightToggleButton } from "../right/RightToggleButton";
import { SaveIconButton } from "../right/SaveIconButton";
import { DebugInfo } from "./DebugInfo";
import { FormContext, FormStoreObject } from "~/components/form/context/FormContext";

export function HeaderRow() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <header class="flex bg:#f3f3f4 jc:space-between r:7">
      <LeftIcons />

      <Show when={layoutStore().selectedSection === "build"}>
        <div class="flex ai:center gap:6">
          <UndoRedoIcons />
          <ResizeViewButtons />
          {/* <SettingPageIcon /> */}
        </div>
      </Show>
      <DebugInfo />
      <Show when={layoutStore().selectedSection === "setting"}>
        <div class="flex ai:center">
          <MiddleSectionButtons />
        </div>
      </Show>

      <div class="flex ai:center gap:5">
        <Show when={!layoutStore().isRightOpen || layoutStore().isSmallScreen}>
          <RightToggleButton />
        </Show>
        <Show when={formStoreVertex()}>
          <FormContext.Provider value={formStoreId!}>
            <SaveIconButton />
          </FormContext.Provider>
        </Show>
        <PreviewButton />
        <ExportSection />
        <SelectThemeButton />
        <UserDropdownMenuDisplay />
      </div>
    </header>
  );
}
