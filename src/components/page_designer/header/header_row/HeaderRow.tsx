

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useGraph, type Vertex } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/admin_layout/DropdownMenuDisplay";
import { SelectThemeButton } from "~/pages/admin_layout/theme/SelectThemeButton";

import { type PageLayoutObject, useDesignerFormIdContext } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { LeftIcons } from "../left/LeftIcons";
import { SaveAllButton } from "../right/SaveAllButton";
import { ToggleButtons } from "../right/ToggleButtons";

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
        <ToggleButtons />
        <SaveAllButton />
        <SelectThemeButton />
        <UserDropdownMenuDisplay />
      </div>
    </header>
  );
}
