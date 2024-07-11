import { For, Match, Switch, createMemo } from "solid-js";

import type { ToggleField } from "../constants/FieldType";

import { useCssDefaultEditor, useCssEditor, useCssState } from "../context";
import { CenterDiv } from "./CenterDiv";
import { ContainerLabel } from "./ContainerLabel";
import { IconifyIcon } from "./IconifyIcon";

export const ToggleButton = (props: ToggleField) => {
  const [cssState, setCssState] = useCssEditor();
  const [state, setState] = useCssState();
  const [cssDefault, setCssDefault] = useCssDefaultEditor();
  const selected = () =>
    cssState[state() || ""]?.[props.name] ||
    cssDefault[state() ?? ""]?.[props.name] ||
    "";
  const isSelected = (option: any) => selected() === option.value;

  const isDefaultValue = createMemo(
    () =>
      selected() !== cssDefault[state() ?? ""]?.[props.name] &&
      selected() !== "",
  );

  const Content = () => (
    <div
      class={`${
        !props.isLabelOnTop && props.label ? "w:50%" : "w:100%"
      } inline-flex b:1px|solid|#ccc overflow:hidden r:5`}
    >
      <For each={props.options}>
        {(option) => {
          return (
            <div
              class={`flex ai:center bg:${
                isSelected(option) ? "#e0e7f3" : "transparent"
              } color:${isSelected(option) ? "#5252f1" : "black"} cursor:pointer f:14 jc:center
                                     p:2|5
                 r:${
                   props.options.indexOf(option) === 0
                     ? "5|0|0|5"
                     : props.options.indexOf(option) ===
                         props.options.length - 1
                       ? "0|5|5|0"
                       : "0"
                 }
                 w:-webkit-fill-available`}
              onClick={() => {
                if (props.onChangeInput) {
                  props.onChangeInput(option.value);
                }
                if (props.isAddToClass) {
                  setCssState(state(), { [props.name]: option.value });
                }
              }}
            >
              {option.icon ? (
                <IconifyIcon icon={option.key as string} />
              ) : (
                option.key
              )}
            </div>
          );
        }}
      </For>
    </div>
  );

  return (
    <Switch>
      <Match when={props.isLabelOnTop}>
        <div class={"w:full"}>
          <ContainerLabel
            info={props.name}
            onIconClick={() =>
              setCssState(state(), { [props.name]: cssDefault[props.name] })
            }
            showIcon={isDefaultValue()}
            title={props.label}
          />
          <Content />
        </div>
      </Match>
      <Match when={props.label}>
        <CenterDiv>
          <ContainerLabel
            info={props.name}
            onIconClick={() =>
              setCssState(state(), { [props.name]: cssDefault[props.name] })
            }
            showIcon={isDefaultValue()}
            title={props.label}
          />
          <Content />
        </CenterDiv>
      </Match>
      <Match when={true}>
        <Content />
      </Match>
    </Switch>
  );
};
