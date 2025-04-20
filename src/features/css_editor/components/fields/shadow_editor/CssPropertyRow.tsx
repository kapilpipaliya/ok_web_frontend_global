import { Icon } from "@iconify-icon/solid";
import { type Accessor, createSignal } from "solid-js";

import type { DataEditorField } from "../../../constants/FieldSchemaType";

import { CssPropertyRowContent } from "./CssPropertyRowContent";
import { CssPropertyRowSettings } from "./CssPropertyRowSettings";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export interface CssPropertyRowProps {
  deleteOption: (index: number) => void;
  index: Accessor<number>;
  label: string;
  meta: DataEditorField;
  option: { [key: string]: any };
}

export function CssPropertyRow(props: Readonly<CssPropertyRowProps>) {
  const openMenu = createSignal(false);
  return (
    <>
      <As
        as="div"
        css={css`
  display: flex;
  align-items: center;
  border: 1px solid #3b82f6;
  cursor: pointer;
  margin-bottom: 3px;
  padding: 6px;
  border-radius: 4px;
`}
      >
        <Icon
          css={css`
  cursor: pointer;
  margin-right: 8px;
`}
          icon="ph:dots-three-outline-fill"
          noobserver
          onClick={() => openMenu[1](true)}
        />
        <CssPropertyRowContent
          index={props.index}
          label={props.label}
          meta={props.meta}
          openPopup={openMenu[1]}
          option={props.option}
        />
        <Icon
          css={css`
  cursor: pointer;
  color: \${args.theme.var.color.error};
  margin-right: 8px;
`}
          icon="ph:x-circle"
          noobserver
          onClick={() => props.deleteOption(props.index())}
        />
      </As>
      <CssPropertyRowSettings
        meta={props.meta}
        openMenu={openMenu}
        option={props.option}
        rowIndex={props.index()}
      />
    </>
  );
}
