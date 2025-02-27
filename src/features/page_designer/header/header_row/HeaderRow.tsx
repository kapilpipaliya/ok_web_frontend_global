import type { JSX } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useGraph, type Vertex } from "~/lib/graph/graph";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { SelectThemeButton } from "~/pages/theme_menu/SelectThemeButton";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
} from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { HomeIcon } from "../left/HomeIcon";
import { SaveAllButton } from "../right/SaveAllButton";
import { ToggleButtons } from "../right/ToggleButtons";
import { API } from "~/lib/api/endpoints";

interface HeaderProps {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

const RightSection = () => {
  return (
    <div class="flex ai:center gap:2">
      <ToggleButtons />
      <SaveAllButton />
      <SelectThemeButton />
      <UserDropdownMenuDisplay />
    </div>
  );
};

export function Header(props: HeaderProps) {
  return (
    <header
      class={`${SETTINGS_CONSTANTS.HEADER_MENU_CLASS} ${props.class}`}
      style={props.style}
    >
      {props.children}
    </header>
  );
}

export function HeaderRow(props: HeaderProps) {
  return (
    <Header class={props.class} style={props.style}>
      <HomeIcon url={API.urls.admin.root} />
      <RightSection />
    </Header>
  );
}
