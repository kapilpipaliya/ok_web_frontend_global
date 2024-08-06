import { path } from "rambda";
import { For, type JSX, Match, Switch, } from "solid-js";

import { CustomTooltip } from "~/components/Tooltip";

import type { ButtonGroupField } from "../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../CssEditorContext";
import { CenterDiv } from "./CenterDiv";
import { IconifyIcon } from "./IconifyIcon";
import { LabelWrapper } from "./LabelWrapper";

export const ButtonGroups = () => {
  const meta = useComponentMeta() as ButtonGroupField;
  const [cssDefault] = useCssDefaultEditor();
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const selectedValue = () =>
    {
      const projections = [state() || "", ...(meta.projections ?? []), meta.name];
      return path(projections, cssState) ||
        path(projections, cssDefault) ||
        "";
    };
  const handleChange = (
    _e: Event,
    option: { key: JSX.Element; value: string },
  ) => {
    if (meta.onChangeInput) {
      meta.onChangeInput(option.value);
    }
    if (meta.isAddToClass ?? true) {
      setCssState(state(), ...(meta.projections ?? []), { [meta.name]: option.value });
    }
  };

  const Content = () => (
    <div class="flex border:1px|solid|rgb(211,211,211) box-shadow:0|0|0px|1px|rgba(0,0,0,0.06) box:border f:14px flex:wrap min-w:max position:relative px:4px py:2px r:0.3rem w:100%">
      <For each={meta.options}>
        {(option) => {
          return (
            <label class="flex:1 text:center">
              <CustomTooltip message={option.tooltip ?? option.value}>
                <input
                  checked={selectedValue() === option.value}
                  class={'hidden'}
                  name={meta.name}
                  onChange={(e) => handleChange(e, option)}
                  type="radio"
                />
                <span
                  class={`${selectedValue() === option.value ? "bb:1px|solid|rgb(0,0,255) fg:rgb(0,0,255)" : ""} flex align-items:center border:none cursor:pointer jc:center p:4px text:rgb(128,128,128) transition:all|.15s|ease-in-out`}
                >
                  {option.icon ? (
                    <IconifyIcon icon={option.key} />
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

  return (
    <Switch>
      <Match when={meta.isLabelOnTop}>
        <div class={"w:full"}>
          <LabelWrapper />
          <Content />
        </div>
      </Match>
      <Match when={meta.label}>
        <CenterDiv>
          <LabelWrapper />
          <Content />
        </CenterDiv>
      </Match>
      <Match when={true}>
        <Content />
      </Match>
    </Switch>
  );
};
