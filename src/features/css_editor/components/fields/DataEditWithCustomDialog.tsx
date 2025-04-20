import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { DataEditorField } from "../../constants/FieldSchemaType";
import type { ShadowAttributes } from "../../utils/generate/generateBoxShadow";
import type { FilterAttributes } from "../../utils/generate/generateFilter";
import type { TextShadowAttributes } from "../../utils/generate/generateTextShadow";
import type { TransformAttributes } from "../../utils/generate/generateTransform";
import type { TransitionAttributes } from "../../utils/generate/generateTransition";

import { useCssEditor } from "../../context/CssEditorContext";
import { useCssState } from "../../context/CssStateContext";
import { useRenderContext } from "../../context/RenderContext";
import { LabelWrapper } from "./LabelWrapper";
import { CssPropertyRow } from "./shadow_editor/CssPropertyRow";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

export const DataEditWithCustomDialog = (props: Readonly<DataEditorField>) => {
  const [, setCssState] = useCssEditor();
  const [state] = useCssState();
  const parentItems = useRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () =>
    parentRenderContext()?.context.meta as unknown as DataEditorField;

  type Value =
    | FilterAttributes[]
    | ShadowAttributes[]
    | TextShadowAttributes[]
    | TransformAttributes[]
    | TransitionAttributes[];

  const addOption = () => {
    setCssState(state(), props.key, [...(props.value || []), {}]);
  };

  const deleteOption = (index: number) => {
    const currentOptions = [...(props.value as Value)];
    currentOptions.splice(index, 1);
    setCssState(state(), props.key, currentOptions);
  };

  return (
    <As
      as="div"
      css={(args) => css`
        border: 1px solid ${args.theme.var.color.secondary};
        color: ${args.theme.var.color.secondary};
        margin: 6px 0;
        padding: 0.2rem 0.3rem;
        position: relative;
        border-radius: 5px;
        width: -webkit-fill-available;
      `}
    >
      <As
        as="div"
        css={css`
          ${(props.value || []).length > 0 ? "border-bottom: 1px solid lightgrey; margin: 1px; padding-bottom: 5px;" : ""}
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        `}
      >
        <LabelWrapper meta={meta()} />
        <As as="span" css={css`cursor: pointer;`}>
          <Icon icon={"ph:plus-circle"} noobserver onClick={addOption} />
        </As>
      </As>
      <For each={props.value as unknown as { [key: string]: string }[]}>
        {(option, i) => (
          <CssPropertyRow
            deleteOption={deleteOption}
            index={i}
            label={props.label}
            meta={meta()}
            option={option}
          />
        )}
      </For>
    </As>
  );
};
