import { path } from "rambda";
import { For, Match, Switch, } from "solid-js";

import type { ToggleField } from "../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../CssEditorContext";
import { CenterDiv } from "./CenterDiv";
import { IconifyIcon } from "./IconifyIcon";
import { LabelWrapper } from "./LabelWrapper";

export const ToggleButton = () => {
  const meta = useComponentMeta() as ToggleField;
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();
  const selectedValue = () =>
    {
      const projections = [state() || "", ...(meta.projections ?? []), meta.name];
      return path(projections, cssState) ||
        path(projections, cssDefault) ||
        "";
    };
  const isSelected = (option: any) => selectedValue() === option.value;

  const Content = () => (
    <div
      class={`${
        !meta.isLabelOnTop && meta.label ? "w:50%" : "w:100%"
      } inline-flex b:1px|solid|#ccc overflow:hidden r:5`}
    >
      <For each={meta.options}>
        {(option) => {
          return (
            <div
              class={`flex ai:center bg:${
                isSelected(option) ? "#e0e7f3" : "transparent"
              } color:${isSelected(option) ? "#5252f1" : "black"} cursor:pointer f:14 jc:center
                                     p:2|5
                 r:${
                   meta.options.indexOf(option) === 0
                     ? "5|0|0|5"
                     : meta.options.indexOf(option) ===
                         meta.options.length - 1
                       ? "0|5|5|0"
                       : "0"
                 }
                 w:-webkit-fill-available`}
              onClick={() => {
                if (meta.onChangeInput) {
                  meta.onChangeInput(option.value);
                }
                if (meta.isAddToClass ?? true) {
                  setCssState(state(), ...(meta.projections ?? []), { [meta.name]: option.value });
                }
              }}
            >
              {option.icon ? (
                <IconifyIcon icon={option.key} />
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
      <Match when={meta.isLabelOnTop}>
        <div class={"w:full"}>
          <LabelWrapper/>
          <Content />
        </div>
      </Match>
      <Match when={meta.label}>
        <CenterDiv>
        <LabelWrapper/>
          <Content />
        </CenterDiv>
      </Match>
      <Match when={true}>
        <Content />
      </Match>
    </Switch>
  );
};
