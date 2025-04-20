import { type Accessor, type JSX, Match, type Setter, Switch } from "solid-js";

import type { DataEditorField } from "../../../constants/FieldSchemaType";

import {
  generateBoxShadow,
  type ShadowAttributes,
} from "../../../utils/generate/generateBoxShadow";
import {
  type FilterAttributes,
  generateFilter,
} from "../../../utils/generate/generateFilter";
import {
  generateTextShadow,
  type TextShadowAttributes,
} from "../../../utils/generate/generateTextShadow";
import {
  generateTransform,
  type TransformAttributes,
} from "../../../utils/generate/generateTransform";
import {
  generateTransition,
  type TransitionAttributes,
} from "../../../utils/generate/generateTransition";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

export interface CssPropertyRowContentProps {
  centerComponent?: JSX.Element;
  index: Accessor<number>;
  label: string;
  meta: DataEditorField;
  openPopup: Setter<boolean>;
  option: { [key: string]: any };
}

export function CssPropertyRowContent(
  props: Readonly<CssPropertyRowContentProps>,
) {
  const handleButtonClick = () => {
    props.openPopup((v) => !v);
  };

  return (
    <Switch>
      <Match when={props.meta.key === "box-shadow"}>
        <RenderButton
          label={generateBoxShadow([props.option as ShadowAttributes], true)}
          onClick={handleButtonClick}
        />
        <RenderPreview
          previewCss={css`box-shadow:${generateBoxShadow([props.option as ShadowAttributes])}`}
        />
      </Match>
      <Match when={props.meta.key === "text-shadow"}>
        <RenderButton
          label={generateTextShadow(
            [props.option as TextShadowAttributes],
            true,
          )}
          onClick={handleButtonClick}
        />
        <RenderPreview
          previewCss={css`text-shadow:${generateTextShadow([props.option as TextShadowAttributes])}`}
        />
      </Match>
      <Match when={props.meta.key === "filter"}>
        <RenderButton
          label={generateFilter([props.option as FilterAttributes], true)}
          onClick={handleButtonClick}
        />
      </Match>
      <Match when={props.meta.key === "backdrop-filter"}>
        <RenderButton
          label={generateFilter([props.option as FilterAttributes], true)}
          onClick={handleButtonClick}
        />
      </Match>
      <Match when={props.meta.key === "transition"}>
        <RenderButton
          label={generateTransition(
            [props.option as TransitionAttributes],
            true,
          )}
          onClick={handleButtonClick}
        />
      </Match>
      <Match when={props.meta.key === "transform"}>
        <RenderButton
          label={generateTransform([props.option as TransformAttributes], true)}
          onClick={handleButtonClick}
        />
      </Match>
      <Match when={props.centerComponent}>{props.centerComponent}</Match>
    </Switch>
  );
}

function RenderButton(props: { label: string; onClick: () => void }) {
  return (
    <As 
      as="button" 
      css={css`
        flex: 1;
        font-size: 14px;
        margin-right: 8px;
      `} 
      onClick={props.onClick} 
      type="button"
    >
      {props.label}
    </As>
  );
}

function RenderPreview(props: { previewCss: string }) {
  return (
    <As 
      as="div" 
      css={css`
        ${props.previewCss};
        height: 20px;
        margin-right: 10px;
        border-radius: 5px;
        width: 20px;
      `}
    />
  );
}
