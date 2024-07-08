import { Icon } from "@iconify-icon/solid";
import { Show, createSignal } from "solid-js";

import { FormContext } from "~/lib/contexts";

import { useDesignerLayoutStore } from "../LayoutContext";
import { LeftIcons } from "./left/LeftIcons";
import { LeftToggleButton } from "./left/LeftToggleButton";
import { MiddleSectionButtons } from "./middle/MiddleSectionButtons";
import { ResizeViewButtons } from "./middle/ResizeViewButtons";
import { UndoRedoIcons } from "./middle/UndoRedoIcons";
import { ExportSection } from "./right/ExportSection";
import { PreviewButton } from "./right/PreviewButton";
import { RightToggleButton } from "./right/RightToggleButton";
import { SaveIconButton } from "./right/SaveIconButton";

export function HeaderRow() {
  // const [graph] = useGraph();
  const [openDialog, setOpenDialog] = createSignal(false);
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();

  return (
    <header class="grid-area:header h:50px">
      <div class="grid flex-grow:1 ji:center min-w:400">
        <div class="flex ai:center bg:#f3f3f4 h:49px jc:space-between mb:5 p:10 r:7 w:99%">
          <LeftIcons />
          <Show when={!layoutStore.isLeftOpen || layoutStore.isSmallScreen}>
            <LeftToggleButton />
          </Show>
          <div>
            <Show when={layoutStore.selectedSection === "build"}>
              <div class="flex ai:center ml:38% w:150">
                <UndoRedoIcons />
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
            {/* <Show when={layoutStore.formData.txnId}>
              <div class="flex flex:row gap:2">
                <span>Txn ID: {layoutStore.formData.txnId}</span>
                <span>Steps: {graph.transactions.get(layoutStore.formData.txnId)?.steps.length}</span>
                <span>Submitted Step: {graph.transactions.get(layoutStore.formData.txnId)?.submittedIndex}</span>
                <span>Active Undo Point: {graph.transactions.get(layoutStore.formData.txnId)?.activeUndoIndex}</span>
                <span>Undo Points: {graph.transactions.get(layoutStore.formData.txnId)?.undoStepIndexes.join(", ")}</span>
              </div>
            </Show> */}
            <Show when={layoutStore.selectedSection === "setting"}>
              <MiddleSectionButtons />
            </Show>
          </div>
          <div class="flex ai:center gap:5 justify-content:space-between">
            <Show when={!layoutStore.isRightOpen || layoutStore.isSmallScreen}>
              <RightToggleButton />
            </Show>
            <FormContext.Provider value={layoutStore.formData}><SaveIconButton /></FormContext.Provider>
            <PreviewButton />
            <ExportSection openDialog={openDialog} setOpenDialog={setOpenDialog} />
          </div>
        </div>
      </div>
    </header>
  );
}
