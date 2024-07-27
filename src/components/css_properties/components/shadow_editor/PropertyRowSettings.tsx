
import { type Accessor, For, type JSX, type Setter, Show } from "solid-js";

import { IconButton } from "~/components/IconButton";
import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import type { DataEditorField } from "../../constants/FieldType";

export interface PopupProps {
  children?: JSX.Element;
  meta: DataEditorField
  openMenu: [Accessor<boolean>, Setter<boolean>];
  option: { [key: string]: any };
  rowIndex: number;
}

export function PropertyRowSettings(props: Readonly<PopupProps>) {

  const Header = () => {
    const closeMenu = () => {
      props.openMenu[1](false);
    };
    return (
      <div class={"flex ai:center cursor:pointer jc:space-between mb:5"} onClick={closeMenu} >
        <div class={"f:15 font-weight:bold"}>{props.meta.dialogLabel}</div>
        <IconButton class={"fg:grey p:3"} icon={"ooui:collapse"} onClick={closeMenu} size={16}/>
      </div>
    );
  };

  return (
    <Show when={props.openMenu[0]()}>
      <div
        class={`b:1px|solid|#ccc bg:#fff p:6 r:4`}
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
