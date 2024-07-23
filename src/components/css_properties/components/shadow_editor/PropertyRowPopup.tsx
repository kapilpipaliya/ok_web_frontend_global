import { Icon } from "@iconify-icon/solid";
import { type Accessor, For, type JSX, type Setter, Show } from "solid-js";

import { useZIndex } from "~/components/ZIndex";
import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import type { DataEditorField } from "../../constants/FieldType";

export interface PopupProps {
  children?: JSX.Element;
  meta: DataEditorField
  openMenu: [Accessor<boolean>, Setter<boolean>];
  option: { [key: string]: any };
  rowIndex: number;
}

export function PropertyRowPopup(props: Readonly<PopupProps>) {
  const zIndex = useZIndex();

  const Header = () => {
    return (
      <div class={"flex ai:center jc:space-between mb:5"}>
        <div class={"f:15 font-weight:bold"}>{props.meta.dialogLabel}</div>
        <Icon class={"fg:grey"} icon={"mdi:close"} onClick={() => props.openMenu[1](false)} />
      </div>
    );
  };

  return (
    <Show when={props.openMenu[0]()}>
      <div
        class={`b:1px|solid|#ccc bg:#fff mr:100px p:10px position:absolute r:10px w:280px z:${zIndex}`}
      >
        <Header />

        <For each={Object.entries(props.meta.children)}>
          {([sectionName, properties], index) => {
            return <DynamicCSSComponent value={{ ...properties, isAddToClass: true, projections: [props.meta.name, props.rowIndex] }} />;
          }}
        </For>
      </div>
    </Show>
  );
}
