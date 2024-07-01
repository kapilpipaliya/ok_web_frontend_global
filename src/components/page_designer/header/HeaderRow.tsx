import { Icon } from "@iconify-icon/solid";
import { Show, createSignal } from "solid-js";

import { useDesignerLayoutStore } from "../LayoutContext";
import { ExportSection } from "./ExportSection";
import { LeftIcons } from "./LeftIcons";
import { MiddleSectionButtons } from "./MiddleSectionButtons";
import { PreviewButton } from "./PreviewButton";
import { ResizeViewButtons } from "./ResizeViewButtons";
import { SaveButton } from "./SaveButton";

export function HeaderRow() {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <header class="h:50px" style={{ "grid-area": "header" }}>
      <div class="grid flex-grow:1 ji:center min-w:400">
        <div class="flex ai:center bg:#f3f3f4 h:49px jc:space-between mb:5 p:10 r:7 w:99%">
          <LeftIcons />
          <div>
            <Show when={layoutStore.selectedSection === "build"}>
              <div class="flex ai:center ml:38% w:150">
                <ResizeViewButtons />
                <Icon
                  class="ml:10"
                  height={22}
                  icon="solar:settings-linear"
                  onClick={() => setLayoutStore("selectedSection", "setting")}
                  width={22}
                />
              </div>
            </Show>
            <Show when={layoutStore.selectedSection === "setting"}>
              <MiddleSectionButtons />
            </Show>
          </div>
          <div class="flex ai:center gap:5 justify-content:space-between">
            <SaveButton />
            <PreviewButton />
            <ExportSection openDialog={openDialog} setOpenDialog={setOpenDialog} />
          </div>
        </div>
      </div>
    </header>
  );
}
