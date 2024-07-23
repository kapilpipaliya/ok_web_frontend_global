import { Icon } from "@iconify-icon/solid";
import { type Accessor, createSignal } from "solid-js";

import { ZIndex } from "~/components/ZIndex";

import type { DataEditorField } from "../../constants/FieldType";

import { PropertyRowContent } from "./PropertyRowContent";
import { PropertyRowPopup } from "./PropertyRowPopup";

export interface PickedOptionProps {
  deleteOption: (index: number) => void;
  index: Accessor<number>;
  label: string;
  meta: DataEditorField
  option: { [key: string]: any };
}

export function PropertyRow(props: Readonly<PickedOptionProps>) {
  const openMenu = createSignal(false);
  return (
    <div class="flex ai:center b:1px|solid|#ccc cursor:pointer mb:3px p:5px r:4px">
      <Icon
        class="cursor:pointer mr:8"
        icon="icon-park-outline:more-one"
        onClick={() => openMenu[1](true)} />
      <PropertyRowContent
        index={props.index}
        label={props.label}
        meta={props.meta}
        openPopup={openMenu[1]}
        option={props.option} />
      <Icon
        class="cursor:pointer fg:red mr:8"
        icon="mdi:close"
        onClick={() => props.deleteOption(props.index())} />
      <ZIndex>
        <PropertyRowPopup
          meta={props.meta}
          openMenu={openMenu}
          option={props.option}
          rowIndex={props.index()} />
      </ZIndex>
    </div>
  );
}
