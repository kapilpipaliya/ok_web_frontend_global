
import { Show, createSignal } from "solid-js";

import { IconButton } from "~/components/IconButton";
import { FormContext } from "~/lib/contexts";

import { useDesignerLayoutStore } from "../LayoutContext";
import { LeftIcons } from "./left/LeftIcons";
import { MiddleSectionButtons } from "./middle/MiddleSectionButtons";
import { ResizeViewButtons } from "./middle/ResizeViewButtons";
import { UndoRedoIcons } from "./middle/UndoRedoIcons";
import { ExportSection } from "./right/ExportSection";
import { PreviewButton } from "./right/PreviewButton";
import { RightToggleButton } from "./right/RightToggleButton";
import { SaveIconButton } from "./right/SaveIconButton";

const SettingPageIcon = () => {
  const [, setLayoutStore] = useDesignerLayoutStore();
  return <IconButton
    class="b:1px|solid|lightgrey bg:white color:grey color:#000:hover cursor:pointer jc:center p:6 r:7"
    icon="solar:settings-linear"
    onClick={() => setLayoutStore("selectedSection", "setting")}
    size={22}
  />
}
export function HeaderRow() {
  // const [graph] = useGraph();
  const [openDialog, setOpenDialog] = createSignal(false);
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
        <div class="flex ai:center">
          <MiddleSectionButtons />
        </div>
      </Show>

      <div class="flex ai:center gap:5">
        <Show when={!layoutStore.isRightOpen || layoutStore.isSmallScreen}>
          <RightToggleButton />
        </Show>
        <FormContext.Provider value={layoutStore.formData}>
          <SaveIconButton />
        </FormContext.Provider>
        <PreviewButton />
        <ExportSection openDialog={openDialog} setOpenDialog={setOpenDialog} />
      </div>
    </header>
  );
}
