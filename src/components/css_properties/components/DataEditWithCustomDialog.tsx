import { Icon } from "@iconify-icon/solid";
import { path } from "rambda";
import {
  For,
} from "solid-js";

import type { DataEditorField } from "../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../context";
import { LabelWrapper } from "./LabelWrapper";
import { PropertyRow } from "./shadow_editor/PropertyRow";

export const DataEditWithCustomDialog = () => {
  const meta = useComponentMeta() as DataEditorField;
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();

  const selectedValue = () =>
    {
      const projections = [state() || "", ...(meta.projections ?? []), meta.name];
      return path(projections, cssState) ||
        path(projections, cssDefault) ||
        []
    };

  const addOption = () => {
    setCssState(state(), ...(meta.projections ?? []), { [meta.name]: [...selectedValue(), {}] });
  };


  const deleteOption = (index: number) => {
    const currentOptions = [...selectedValue()] as { [key: string]: string }[];
    currentOptions.splice(index, 1);
    setCssState(state(), ...(meta.projections ?? []), { [meta.name]: currentOptions });
  };

  return (
    <div
      class={
        "b:1px|solid|lightgray color:#333 m:10px p:.2rem|.3rem position:relative r:5 w:-webkit-fill-available"
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
          <PropertyRow
            deleteOption={deleteOption}
            index={i}
            label={meta.label}
            meta={meta}
            option={option}
          />
        )}
      </For>
    </div>
  );
};
