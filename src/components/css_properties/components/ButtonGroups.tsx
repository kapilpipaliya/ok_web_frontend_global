import { type JSX, useContext, For, Show, createMemo } from "solid-js";
import { CustomTooltip } from "~/components/Tooltip";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "../context";
import { CenterDiv, ContainerLabel, IconifyIcon } from "./CssUtils";
import "~/css/componentUtilCSS.css";

export const ButtonGroups = (props: {
  options: {
    key: JSX.Element;
    value: string;
    tooltip?: string;
    icon?: boolean;
  }[];
  name: string;
  label: any;
  isLabelOnTop: boolean;
  infoLink?: string;
  isAddToClass?: boolean;
  onChangeInput?: any;
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
                  type="radio"
                  name={props.name}
                  checked={selected() === option.value}
                  onChange={(e) => handleChange(e, option)}
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
      when={props.isLabelOnTop}
      fallback={
        <Show when={props.label} fallback={<Content />}>
          <CenterDiv>
            <ContainerLabel info={props.name} title={props.label} showIcon={isDefaultValue()} onIconClick={() => setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })} />
            <Content />
          </CenterDiv>
        </Show>
      }
    >
      <div class={"w:full"}>
        <ContainerLabel info={props.name} title={props.label} showIcon={isDefaultValue()} onIconClick={() => setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })} />
        <Content />
      </div>
    </Show>
  );
};
