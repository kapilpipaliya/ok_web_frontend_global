import { Icon } from "@iconify-icon/solid";
import { path } from "rambda";
import { type Accessor, For } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { DataEditorField } from "../constants/FieldSchemaType";
import type { ShadowAttributes } from "../utils/generate/generateBoxShadow";
import type { FilterAttributes } from "../utils/generate/generateFilter";
import type { TextShadowAttributes } from "../utils/generate/generateTextShadow";
import type { TransformAttributes } from "../utils/generate/generateTransform";
import type { TransitionAttributes } from "../utils/generate/generateTransition";

import {
  useCssDefaultEditor,
  useCssEditor,
  useCssState,
} from "../CssEditorContext";
import { useRenderContext } from "../RenderContext";
import { LabelWrapper } from "./LabelWrapper";
import { CssPropertyRow } from "./shadow_editor/CssPropertyRow";

export const DataEditWithCustomDialog = () => {
  const [parentItems] = useRenderContext();
  const meta = getLastItem(parentItems?.meta || []) as Accessor<DataEditorField>;
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();

  const selectedValue = ():
    | FilterAttributes[]
    | ShadowAttributes[]
    | TextShadowAttributes[]
    | TransformAttributes[]
    | TransitionAttributes[] => {
    const projections = [state() || "", ...(meta().projections ?? []), meta().name];
    return path(projections, cssState) || path(projections, cssDefault) || [];
  };

  const addOption = () => {
    setCssState(state(), ...(meta().projections ?? []), {
      [meta().name]: [...selectedValue(), {}],
    });
  };

  const deleteOption = (index: number) => {
    const currentOptions = [...selectedValue()];
    currentOptions.splice(index, 1);
    setCssState(state(), ...(meta().projections ?? []), {
      [meta().name]: currentOptions,
    });
  };

  return (
    <div
      class={
        "b:1px|solid|lightgray color:#333 my:6 p:.2rem|.3rem position:relative r:5 w:-webkit-fill-available"
      }
    >
      <div
        class={`${
          selectedValue().length > 0 ? "bb:1px|solid|lightgrey m:1 pb:5" : ""
        } flex ai:center jc:space-between mb:6px`}
      >
        <LabelWrapper />
        <Icon
          class={"cursor:pointer"}
          icon={"lets-icons:add-round"}
          onClick={addOption}
        />
      </div>
      <For each={selectedValue() as unknown as { [key: string]: string }[]}>
        {(option, i) => (
          <CssPropertyRow
            deleteOption={deleteOption}
            index={i}
            label={meta().label}
            meta={meta()}
            option={option}
          />
        )}
      </For>
    </div>
  );
};
