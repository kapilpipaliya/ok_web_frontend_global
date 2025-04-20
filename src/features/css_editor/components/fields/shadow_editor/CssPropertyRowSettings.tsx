import { type Accessor, For, type JSX, type Setter, Show } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { DynamicCSSComponent } from "~/features/css_editor/components/DynamicCssComponent";
import { useCssState } from "~/features/css_editor/context/CssStateContext";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

import type { DataEditorField } from "../../../constants/FieldSchemaType";

export interface CssPropertyRowSettingsProps {
  children?: JSX.Element;
  meta: DataEditorField;
  openMenu: [Accessor<boolean>, Setter<boolean>];
  option: { [key: string]: any };
  rowIndex: number;
}

export function CssPropertyRowSettings(
  props: Readonly<CssPropertyRowSettingsProps>,
) {
  const [state] = useCssState();
  const Header = () => {
    const closeMenu = () => {
      props.openMenu[1](false);
    };
    return (
      <As
        as="div"
        css={css`
          display: flex;
          align-items: center;
          cursor: pointer;
          justify-content: space-between;
          margin-bottom: 5px;
        `}
        onClick={closeMenu}
      >
        <As 
          as="div" 
          css={css`
            font-size: 15px;
            font-weight: bold;
          `}
        >
          {props.meta.dialogLabel}
        </As>
        <IconButton
          css={css`
            color: grey;
            padding: 3px;
            background-color: transparent;
            border: none;
          `}
          icon={"ooui:collapse"}
          onClick={closeMenu}
          size={16}
        />
      </As>
    );
  };

  return (
    <Show when={props.openMenu[0]()}>
      <As
        as="div"
        css={css`
          border: 1px solid #ccc;
          padding: 6px;
          border-radius: 4px;
        `}
      >
        <Header />

        <For each={props.meta.children || []}>
          {(meta) => {
            return (
              <DynamicCSSComponent
                meta={{
                  ...meta,
                  projections: [state(), props.meta.key, props.rowIndex],
                }}
              />
            );
          }}
        </For>
      </As>
    </Show>
  );
}
