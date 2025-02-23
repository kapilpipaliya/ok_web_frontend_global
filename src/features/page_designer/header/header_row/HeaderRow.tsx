import type { JSX } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useGraph, type Vertex } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SelectThemeButton } from "~/pages/theme_menu/SelectThemeButton";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
} from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { LeftIcons } from "../left/LeftIcons";
import { SaveAllButton } from "../right/SaveAllButton";
import { ToggleButtons } from "../right/ToggleButtons";

export function HeaderRow(props: {
  class?: string;
  style?: JSX.CSSProperties;
}) {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const _layoutStore = () =>
    graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <header
      class={`flex bg:base-5 jc:space-between r:7 ${props.class}`}
      style={props.style}
    >
      <LeftIcons />

      <div class="flex ai:center gap:2">
        <ToggleButtons />
        <SaveAllButton />
        <SelectThemeButton />
        <UserDropdownMenuDisplay />
      </div>
    </header>
  );
}
