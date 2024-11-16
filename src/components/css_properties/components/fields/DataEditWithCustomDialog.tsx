import { Icon } from "@iconify-icon/solid";
import { type Accessor, For } from "solid-js";

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

export const DataEditWithCustomDialog = (props: Readonly<DataEditorField>) => {
  const [, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [parentItems] = useRenderContext();
  const meta = getLastItem(
    parentItems?.meta || [],
  ) as Accessor<DataEditorField>;

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
    <div
      class={
        "b:1px|solid|lightgray color:#333 my:6 p:.2rem|.3rem position:relative r:5 w:-webkit-fill-available"
      }
    >
      <div
        class={`${
          (props.value || []).length > 0
            ? "bb:1px|solid|lightgrey m:1 pb:5"
            : ""
        } flex ai:center jc:space-between mb:6px`}
      >
        <LabelWrapper />
        <Icon
          class={"cursor:pointer"}
          icon={"lets-icons:add-round"}
          onClick={addOption}
        />
      </div>
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
    </div>
  );
};
