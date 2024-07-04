import { For, type JSX, Match, Switch, createMemo, useContext } from "solid-js";

import { CustomTooltip } from "~/components/Tooltip";

import type { ButtonGroupField } from "../constants/FieldType";

import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "../context";
import { CenterDiv } from "./CenterDiv";
import { ContainerLabel } from "./ContainerLabel";
import { IconifyIcon } from "./IconifyIcon";

export const ButtonGroups = (props: Omit<ButtonGroupField, 'component'>) => {
  const [cssDefault] = useContext(CssDefaultEditorContext);
  const [cssState, setCssState] = useContext(CssEditorContext);
  const [state] = useContext(CssStateContext);
  const selected = () => cssState[state() || '']?.[props.name] || cssDefault[state() || '']?.[props.name] || '';
  const handleChange = (
    e: Event,
    option: { key: JSX.Element; value: string },
  ) => {
    if (props.onChangeInput) {
      props.onChangeInput(option.value);
    }
    if (!props.isAddToClass==false) {
      setCssState(state(), { [props.name]: option.value });
    }
  };

  const Content = () => (
    <div class="flex border:1px|solid|rgb(211,211,211) box-shadow:0|0|0px|1px|rgba(0,0,0,0.06) box:border f:14px flex:wrap min-w:max position:relative px:4px py:2px r:0.3rem" style="width: 100%;">
      <For each={props.options}>
        {(option) => {
          return (
            <label class="flex:1 text:center">
              <CustomTooltip message={option.tooltip ?? option.value}>
                <input
                  checked={selected() === option.value}
                  class={`hidden`}
                  name={props.name}
                  onChange={(e) => handleChange(e, option)}
                  type="radio"
                />
                <span class={`${selected() === option.value ? 'bb:1px|solid|rgb(0,0,255) fg:rgb(0,0,255)' : ''} flex align-items:center border:none cursor:pointer jc:center p:4px text:rgb(128,128,128) transition:all|.15s|ease-in-out`}>
                  {option.icon ? (
                    <IconifyIcon icon={option.key as string} />
                  ) : (
                    option.key
                  )}
                </span>
              </CustomTooltip>
            </label>
          );
        }}
      </For>
    </div>
  );

  const isDefaultValue = createMemo(() => selected() !== cssDefault[state() ?? '']?.[props.name] && selected() !== '');
  return (
    <Switch>
      <Match when={props.isLabelOnTop}>
        <div class={"w:full"}>
          <ContainerLabel info={props.name} onIconClick={() => setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })} showIcon={isDefaultValue()} title={props.label} />
          <Content />
        </div>
      </Match>
      <Match when={props.label}>
        <CenterDiv>
          <ContainerLabel info={props.name} onIconClick={() => setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })} showIcon={isDefaultValue()} title={props.label} />
          <Content />
        </CenterDiv>
      </Match>
      <Match when={true}>
        <Content />
      </Match>
    </Switch>
  );
};

