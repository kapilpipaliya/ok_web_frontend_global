import { Icon } from "@iconify-icon/solid";
import { type Accessor, createSignal } from "solid-js";

import type { DataEditorField } from "../../../constants/FieldSchemaType";

import { CssPropertyRowContent } from "./CssPropertyRowContent";
import { CssPropertyRowSettings } from "./CssPropertyRowSettings";

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
      <div class="flex ai:center b:1px|solid|#ccc cursor:pointer mb:3px p:6 r:4">
        <Icon
          class="cursor:pointer mr:8"
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
          class="cursor:pointer fg:error mr:8"
          icon="ph:x-circle"
          noobserver
          onClick={() => props.deleteOption(props.index())}
        />
      </div>
      <CssPropertyRowSettings
        meta={props.meta}
        openMenu={openMenu}
        option={props.option}
        rowIndex={props.index()}
      />
    </>
  );
}
