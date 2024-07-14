import { Icon } from "@iconify-icon/solid";
import {
  For,
  createMemo,
  createSignal,
} from "solid-js";

import type { DataEditorField } from "../constants/FieldType";

import { useCssDefaultEditor, useCssEditor, useCssState } from "../context";
import { ContainerLabel } from "./ContainerLabel";
import { PickedOption } from "./shadow_editor/PickedOption";

export const DataEditWithCustomDialog = (
  props: Omit<DataEditorField, "component">,
) => {
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();

  const selected = () =>
    cssState[state() || ""]?.[props.name] ||
    cssDefault[state() ?? ""]?.[props.name] ||
    "";

  const addOption = () => {
    if (props.label.includes("Text Shadow") || props.label.includes("Box Shadow")) {
      const currentOptions = selected() ? selected().split(",") : [];
      currentOptions.push("0|0|5|0|#000|inset");
      const newValue = currentOptions.join(",");
      setCssState(state(), { [props.name]: newValue });
    } else if (props.label.includes("Filter")) {
      const currentOptions = selected() ? selected().split("|") : [];
      currentOptions.push("blur(3px)");
      const newValue = currentOptions.join("|");
      setCssState(state(), { [props.name]: newValue });
    } else if (props.label.includes("Transition")) {
      const currentOptions = selected() ? selected().split(",") : [];
      currentOptions.push("opacity|1s|ease|0s");
      const newValue = currentOptions.join(",");
      setCssState(state(), { [props.name]: newValue });
    } else if (props.label.includes("Transform")) {
      const currentOptions = selected() ? selected().split("|") : [];
      currentOptions.push("rotate(10deg)");
      const newValue = currentOptions.join("|");
      setCssState(state(), { [props.name]: newValue });
    }
  };

  const getOptions = () => {
    if (props.label.includes("Shadow") || props.label.includes("Transition")) {
      return (selected() && selected().split(",")) || [];
    }
    if (props.label.includes("Filter") || props.label.includes("Transform")) {
      return (selected() && selected().split("|")) || [];
    }
    return [];
  };

  const isDefaultValue = createMemo(
    () =>
      selected() !== cssDefault[state() ?? ""]?.[props.name] &&
      selected() !== "",
  );



  const deleteOption = (index: number) => {
    if (props.label.includes("Shadow") || props.label.includes("Transition")) {
      const data = selected()
        .split(",")
        .filter((_, i) => i !== index);
      setCssState(state(), { [props.name]: data.join(",") });
    } else if (props.label.includes("Filter")) {
      const data = selected()
        .split("|")
        .filter((_, i) => i !== index);
      setCssState(state(), { [props.name]: data.join("|") });
    } else if (props.label.includes("Transform")) {
      const data = selected()
        .split("|")
        .filter((_, i) => i !== index);
      setCssState(state(), { [props.name]: data.join("|") });
    }
  };

  const openPopup = (index: number) => {
    props.openMenu[1](index);
  };

  const closePopup = () => {
    props.openMenu[1](null);
  };

  return (
    <div
      class={
        "b:1px|solid|lightgray color:#333 m:10px p:.2rem|.3rem position:relative r:5 w:-webkit-fill-available"
      }
    >
      <div
        class={`${
          getOptions().length > 0 ? "bb:1|solid|lightgrey m:1 pb:5" : ""
        } flex ai:center jc:space-between mb:6px`}
      >
        <ContainerLabel
          info={props.name}
          onResetIconClick={resetValues}
          showResetIcon={isDefaultValue()}
          title={props.label}
        />
        <Icon
          class={"cursor:pointer"}
          icon={"lets-icons:add-round"}
          onClick={addOption}
        />
      </div>
      <For each={getOptions()}>
        {(option, i) => (
          <PickedOption
            deleteOption={deleteOption}
            index={i}
            label={props.label}
            openPopup={openPopup}
            option={option}
          />
        )}
      </For>
    </div>
  );
};
