import { Show } from "solid-js";

import type { Id } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import {
  headerIconButtonClass,
  toolBarClass,
} from "~/pages/constants/constant";

import { DebugInfo } from "../page_tabbar/DebugInfo";
import { PreviewButton } from "../page_tabbar/PreviewButton";
import { RefreshButton } from "../page_tabbar/RefreshButton";
import { ResizeViewButtons } from "../page_tabbar/ResizeViewButtons";
import { SaveIconButton } from "../page_tabbar/SaveIconButton";
import { ShareButton } from "../page_tabbar/ShareButton";
import { UndoRedoIcons } from "../page_tabbar/UndoRedoIcons";

export function PageTabBar(props: {
  formStoreId: Id;
  handleRefresh: () => void;
  onClose?: () => void;
  openIndex: number;
  previewsLength?: number;
}) {
  return (
    <header class={toolBarClass}>
      <div class="flex ai:center gap:6">
        <UndoRedoIcons formStoreId={props.formStoreId} />
        <ResizeViewButtons
          formStoreId={props.formStoreId}
          openIndex={props.openIndex}
        />
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
        <RefreshButton handleRefresh={props.handleRefresh} />
        <ShareButton formStoreId={props.formStoreId} />
        <Show when={props.previewsLength && props.previewsLength > 1}>
          <IconButton
            class={headerIconButtonClass}
            icon="ph:x-circle"
            onClick={props.onClose}
            title="Close Tab"
          />
        </Show>
      </div>
    </header>
  );
}
