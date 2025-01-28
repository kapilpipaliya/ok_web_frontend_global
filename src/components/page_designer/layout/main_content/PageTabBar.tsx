import { Id } from "~/lib/graph/graph";
import { DebugInfo } from "../page_tabbar/DebugInfo";
import { PreviewButton } from "../page_tabbar/PreviewButton";
import { ResizeViewButtons } from "../page_tabbar/ResizeViewButtons";
import { SaveIconButton } from "../page_tabbar/SaveIconButton";
import { ShareButton } from "../page_tabbar/ShareButton";
import { UndoRedoIcons } from "../page_tabbar/UndoRedoIcons";


export function PageTabBar(props: { formStoreId: Id; openIndex: number; }) {
  return (
    <header class="flex bg:#f3f3f4 gap:6 r:7">

      <div class="flex ai:center gap:6">
        <UndoRedoIcons formStoreId={props.formStoreId} />
        <ResizeViewButtons formStoreId={props.formStoreId} openIndex={props.openIndex} />
        {/* <SettingPageIcon /> */}
      </div>

      <DebugInfo formStoreId={props.formStoreId} />
      {/* <Show when={layoutStore().selectedSection === "setting"}>
              <div class="flex ai:center">
                <MiddleSectionButtons />
              </div>
            </Show> */}
      <div class="flex ai:center gap:6">
        <SaveIconButton formStoreId={props.formStoreId} />
        <PreviewButton formStoreId={props.formStoreId} />
        <ShareButton formStoreId={props.formStoreId} />
      </div>
    </header>
  );
}
