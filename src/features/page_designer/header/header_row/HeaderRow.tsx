import type { JSX } from "solid-js";

import { API } from "~/lib/api/endpoints";
import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { SelectThemeButton } from "~/pages/theme_menu/SelectThemeButton";

import { HomeIcon } from "../left/HomeIcon";
import { SaveAllButton } from "../right/SaveAllButton";
import { ToggleButtons } from "../right/ToggleButtons";

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
      <HomeIcon />
      <RightSection />
    </Header>
  );
}
