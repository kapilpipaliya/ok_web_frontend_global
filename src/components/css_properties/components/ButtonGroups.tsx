import { type JSX, useContext, For, Show, createMemo } from "solid-js";
import { CustomTooltip } from "~/components/Tooltip";
import { CssEditorContext } from "../context";
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
  isAddToClass?: boolean;
  onChangeInput?: any;
}) => {
  const [cssState, setCssState] = useContext(CssEditorContext);
  const selected = () => cssState[props.name] ?? props.options[0].value;
  const handleChange = (
    e: any,
    option: { key: JSX.Element; value: string },
  ) => {
    if (props.onChangeInput) {
      props.onChangeInput(option.value);
    }
    if (props.isAddToClass) {
      setCssState(props.name, option.value);
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

  const isDefaultValue = createMemo(() => selected() !== props.options[0].value);

  return (
    <Show
      when={props.isLabelOnTop}
      fallback={
        <Show when={props.label} fallback={<Content />}>
          <CenterDiv>
            <ContainerLabel title={props.label} showIcon={isDefaultValue()} onIconClick={() => setCssState(props.name, props.options[0].value)} />
            <Content />
          </CenterDiv>
        </Show>
      }
    >
      <div class={"w:full"}>
        <ContainerLabel title={props.label} showIcon={isDefaultValue()} onIconClick={() => setCssState(props.name, props.options[0].value)} />
        <Content />
      </div>
    </Show>
  );
};
