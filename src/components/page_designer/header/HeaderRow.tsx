import { Icon } from "@iconify-icon/solid";
import { createSignal, Show } from "solid-js";
import { useDesignerLayoutStore } from "../LayoutContext";
import { LeftIcons } from "./LeftIcons";
import { ResizeViewButtons } from "./ResizeViewButtons";
import { MiddleSectionButtons } from "./MiddleSectionButtons";
import { SaveButton } from "./SaveButton";
import { PreviewButton } from "./PreviewButton";
import { ExportSection } from "./ExportSection";

export function HeaderRow() {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <header class="h:50px" style={{ "grid-area": "header" }}>
      <div class="flex-grow:1 min-w:400 grid ji:center">
        <div class="ai:center align-items:center bg:#f3f3f4 display:flex flex h:49px jc:space-between mb:5 p:10 r:7 w:99%">
          <LeftIcons />
          <div>
            <Show when={layoutStore.selectedSection === "build"}>
              <div class="flex ai:center w:150 ml:38%">
                <ResizeViewButtons />
                <Icon
                  class="ml:10"
                  icon="solar:settings-linear"
                  height={22}
                  width={22}
                  onClick={() => setLayoutStore("selectedSection", "setting")}
                />
              </div>
            </Show>
            <Show when={layoutStore.selectedSection === "setting"}>
              <MiddleSectionButtons />
            </Show>
          </div>
          <div class="ai:center justify-content:space-between flex gap:5">
            <SaveButton />
            <PreviewButton />
            <ExportSection setOpenDialog={setOpenDialog} openDialog={openDialog} />
          </div>
        </div>
      </div>
    </header>
  );
}
