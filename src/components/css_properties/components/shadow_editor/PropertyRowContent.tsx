import { type Accessor, type JSX, Match, type Setter, Switch } from "solid-js";

import type { DataEditorField } from "../../constants/FieldType";

import { type ShadowAttributes, generateBoxShadow } from "../../utils/generate/generateBoxShadow";
import { generateFilter } from "../../utils/generate/generateFilter";
import { type TextShadowAttributes, generateTextShadow } from "../../utils/generate/generateTextShadow";
import { generateTransform } from "../../utils/generate/generateTransform";
import { generateTransition } from "../../utils/generate/generateTransition";

export interface ComponentProps {
  centerComponent?: JSX.Element;
  index: Accessor<number>;
  label: string;
  meta: DataEditorField;
  openPopup: Setter<boolean>;
  option: { [key: string]: any };
}

export function PropertyRowContent(props: Readonly<ComponentProps>) {
  const handleButtonClick = () => {
    props.openPopup(v => !v);
  };

  return (
    <Switch>
      <Match when={props.meta.name === "box-shadow"}>
        <RenderButton
          label={generateBoxShadow([props.option as ShadowAttributes], true)}
          onClick={handleButtonClick}
        />
        <RenderPreview class={`box-shadow:${generateBoxShadow([props.option as ShadowAttributes])}`} />
      </Match>
      <Match when={props.meta.name === "text-shadow"}>
        <RenderButton
          label={generateTextShadow([props.option as TextShadowAttributes], true)}
          onClick={handleButtonClick}
        />
        <RenderPreview class={`text-shadow:${generateTextShadow([props.option as TextShadowAttributes])}`} />
      </Match>
      <Match when={props.meta.name === "filter"}>
        <RenderButton
          label={generateFilter([props.option], true)}
          onClick={handleButtonClick}
        />
      </Match>
      <Match when={props.meta.name === "transition"}>
        <RenderButton
          label={generateTransition([props.option], true)}
          onClick={handleButtonClick}
        />
      </Match>
      <Match when={props.meta.name === "transform"}>
        <RenderButton
          label={generateTransform([props.option], true)}
          onClick={handleButtonClick}
        />
      </Match>
      <Match when={props.centerComponent}>{props.centerComponent}</Match>
    </Switch>
  );
}

function RenderButton(props: { label: string; onClick: () => void }) {
  return (
    <button class="f:14 flex:1 mr:8px" onClick={props.onClick} type="button">
      {props.label}
    </button>
  );
}

function RenderPreview(props: { class: string }) {
  return <div class={`${props.class} bg:#fff h:20px mr:10 r:5 w:20px`} />;
}