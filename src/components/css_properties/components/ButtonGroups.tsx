import { For, type JSX, Show, createMemo, useContext } from "solid-js";

import { CustomTooltip } from "~/components/Tooltip";
import "~/css/componentUtilCSS.css";

import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "../context";
import { CenterDiv, ContainerLabel, IconifyIcon } from "./CssUtils";

export const ButtonGroups = (props: {
  infoLink?: string;
  isAddToClass?: boolean;
  isLabelOnTop: boolean;
  label: any;
  name: string;
  onChangeInput?: any;
  options: {
    icon?: boolean;
    key: JSX.Element;
    tooltip?: string;
    value: string;
  }[];
}) => {
  const [cssDefault, setCssDefault] = useContext(CssDefaultEditorContext);
  const [cssState, setCssState] = useContext(CssEditorContext);
  const [state, setState] = useContext(CssStateContext);
  const selected = () => cssState[state() || '']?.[props.name] || cssDefault[state() || '']?.[props.name] || '';
  const handleChange = (
    e: any,
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
    <div class={"radio-inputs w:100%"}>
      <For each={props.options}>
        {(option, index) => {
          return (
            <label class={"radio"}>
              <CustomTooltip message={option.tooltip ?? option.value}>
                <input
                  checked={selected() === option.value}
                  name={props.name}
                  onChange={(e) => handleChange(e, option)}
                  type="radio"
                />
                <span class={"name"}>
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
    <Show
      fallback={
        <Show fallback={<Content />} when={props.label}>
          <CenterDiv>
            <ContainerLabel info={props.name} onIconClick={() => setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })} showIcon={isDefaultValue()} title={props.label} />
            <Content />
          </CenterDiv>
        </Show>
      }
      when={props.isLabelOnTop}
    >
      <div class={"w:full"}>
        <ContainerLabel info={props.name} onIconClick={() => setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })} showIcon={isDefaultValue()} title={props.label} />
        <Content />
      </div>
    </Show>
  );
};
