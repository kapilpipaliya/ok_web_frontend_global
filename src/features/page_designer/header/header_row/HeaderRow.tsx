import { createSignal, type JSX, Show } from "solid-js";

import { UserDropdownMenuDisplay } from "~/pages/auth_menu/DropdownMenuDisplay";
import {
  SETTINGS_CONSTANTS,
  headerIconButtonCss,
} from "~/pages/settings/constants";
import { SelectThemeButton } from "~/pages/theme_menu/SelectThemeButton";
import { IconButton } from "~/components/styled/IconButton";

import { HomeIconButton } from "../../../../components/styled/buttons/HomeIconButton";
import { ExportOpenedButton } from "../right/ExportOpenedButton";
import { ImportOpenedButton } from "../right/ImportOpenedButton";
import { SaveAllButton } from "../right/SaveAllButton";
import { ToggleButtons } from "../right/ToggleButtons";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

import type { CssType } from "~/components/form/type/CssType";

interface HeaderProps {
  children?: JSX.Element;
  css?: CssType;
  style?: JSX.CSSProperties;
}

const RightSection = () => {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
}\`;`}
    >
      <ToggleButtons />
      <ImportOpenedButton />
      <ExportOpenedButton />
      <SaveAllButton />
      <SelectThemeButton />
      <UserDropdownMenuDisplay />
    </As>
  );
};

export function Header(props: HeaderProps) {
  return (
    <As
      as="header"
      css={[SETTINGS_CONSTANTS.HEADER_MENU_CSS, ...ensureArray(props.css)]}
      style={props.style}
    >
      {props.children}
    </As>
  );
}

export function HeaderRow(props: HeaderProps) {
  const [expanded, setExpanded] = createSignal(false);

  return (
    <Header
      css={[
        `return \`._id {
          position: fixed;
          top: 8px;
          right: 8px;
          z-index: 1000;
          align-items: center;
          gap: 2px;
          padding: 4px;
          box-shadow: 0 2px 10px oklch(0 0 0 / 0.12);
          background-color: \${args.theme.var.color.background_light_100};
          border: 1px solid \${args.theme.var.color.border};
          border-radius: 8px;
          justify-content: flex-start;
          width: auto;
          max-width: calc(100vw - 16px);
          overflow-x: auto;
        }\`;`,
        ...ensureArray(props.css),
      ]}
      style={props.style}
    >
      <IconButton
        css={headerIconButtonCss}
        icon={expanded() ? "ph:x" : "ph:dots-three"}
        onClick={() => setExpanded(!expanded())}
        size={22}
        title={expanded() ? "Collapse toolbar" : "Expand toolbar"}
        tooltipGroup="header-expand"
      />
      <Show when={expanded()}>
        <HomeIconButton />
        <RightSection />
      </Show>
    </Header>
  );
}
