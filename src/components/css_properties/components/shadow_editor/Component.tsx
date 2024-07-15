import { type Accessor, type JSX, Match, type Setter, Switch } from "solid-js";

import type { DataEditorField } from "../../constants/FieldType";

import { generateBoxShadow } from "../../utils/generateBoxShadow";
import { generateFilter } from "../../utils/generateFilter";
import { generateTextShadow } from "../../utils/generateTextShadow";
import { generateTransform } from "../../utils/generateTransform";
import { generateTransition } from "../../utils/generateTransition";

export interface ComponentProps {
  centerComponent?: JSX.Element;
  index: Accessor<number>;
  label: string;
  meta: DataEditorField
  openPopup: Setter<boolean>;
  option: { [key: string]: any };
}
export function Component(props: Readonly<ComponentProps>) {
  return (
    <Switch>
      <Match when={props.meta.name === "box-shadow"}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(true)} type="button">
          {generateBoxShadow([props.option], true)}
        </button>
        <div class={`bg:#fff box-shadow:${generateBoxShadow([props.option])} h:20px mr:10 r:5 w:20px`} />
      </Match>
      <Match when={props.meta.name === "text-shadow"}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(true)} type="button">
          {generateTextShadow([props.option], true)}
        </button>
        <div class={`bg:#fff h:20px mr:10 r:5 text-shadow:${generateTextShadow([props.option])} w:20px`} />
      </Match>
      <Match when={props.meta.name === "filter"}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(true)} type="button">
          {generateFilter([props.option], true)}
        </button>
      </Match>
      <Match when={props.meta.name === "transition"}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(true)} type="button">
            {generateTransition([props.option], true)}
        </button>
      </Match>
      <Match when={props.meta.name === "transform"}>
        <button class="f:14 flex:1 mr:8px" onClick={() => props.openPopup(true)} type="button">
          {generateTransform([props.option], true)}
        </button>
      </Match>
      <Match when={props.centerComponent}>{props.centerComponent}</Match>
    </Switch>
  );
}
