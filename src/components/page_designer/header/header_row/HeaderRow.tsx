import { Show } from "solid-js";

import { UserDropdownMenuDisplay } from "~/pages/admin_layout/DropdownMenuDisplay";
import { SelectThemeButton } from "~/pages/admin_layout/theme/SelectThemeButton";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { PageLayoutObject, useDesignerFormIdContext } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { LeftIcons } from "../left/LeftIcons";
import { MiddleSectionButtons } from "../../layout/page_tabbar/MiddleSectionButtons";
import { ResizeViewButtons } from "../../layout/page_tabbar/ResizeViewButtons";
import { UndoRedoIcons } from "../../layout/page_tabbar/UndoRedoIcons";
import { ShareButton } from "../../layout/page_tabbar/ShareButton";
import { PreviewButton } from "../../layout/page_tabbar/PreviewButton";
import { RightToggleButton } from "../right/RightToggleButton";
import { SaveAllButton } from "../right/SaveAllButton";
import { DebugInfo } from "../../layout/page_tabbar/DebugInfo";
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

      <div class="flex ai:center gap:5">
        <Show when={!layoutStore().isRightOpen || layoutStore().isSmallScreen}>
          <RightToggleButton />
        </Show>
        <SaveAllButton />
        <SelectThemeButton />
        <UserDropdownMenuDisplay />
      </div>
    </header>
  );
}
