import { type JSX, useContext, For, Show, type JSXElement, createMemo } from "solid-js";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "../context";
import { CenterDiv, ContainerLabel, IconifyIcon } from "./CssUtils";
import "~/css/componentUtilCSS.css";

export const ToggleButton = (props: {
  options: { key: JSX.Element; value: string; icon?: string }[];
  label: JSXElement;
  onChangeInput: any;
  isAddToClass: boolean;
  name: string;
  isLabelOnTop: boolean;
}) => {
  const [cssState, setCssState] = useContext(CssEditorContext);
  const [state, setState] = useContext(CssStateContext);
  const [cssDefault, setCssDefault] = useContext(CssDefaultEditorContext);
  const selected = () => cssState[state() || '']?.[props.name] || cssDefault[state() ?? '']?.[props.name] || '';
  const isSelected = (option: any) => selected() === option.value;

  const isDefaultValue = createMemo(() => selected() !== cssDefault[state() ?? '']?.[props.name] && selected() !== '');


  const Content = () => (
    <div
      class={`inline-flex b:1px|solid|#ccc r:5 overflow:hidden ${!props.isLabelOnTop && props.label ? "w:50%" : "w:100%"
        }`}
    >
      <For each={props.options}>
        {(option) => {
          return (
            <div
              onClick={() => {
                if (props.onChangeInput) {
                  props.onChangeInput(option.value);
                }
                if (props.isAddToClass) {
                  setCssState(state(), { [props.name]: option.value });
                }
              }}
              class={`f:14 p:2|5 flex ai:center cursor:pointer w:-webkit-fill-available jc:center
                                     bg:${isSelected(option)
                  ? "#e0e7f3"
                  : "transparent"
                }
                 color:${isSelected(option) ? "#5252f1" : "black"
                }
                 r:${props.options.indexOf(option) === 0
                  ? "5|0|0|5"
                  : props.options.indexOf(option) ===
                    props.options.length - 1
                    ? "0|5|5|0"
                    : "0"
                }`}
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
    <Show
      when={props.isLabelOnTop}
      fallback={
        <Show when={props.label} fallback={<Content />}>
          <CenterDiv>
            <ContainerLabel onIconClick={() => setCssState(state(), { [props.name]: cssDefault[props.name] })} showIcon={isDefaultValue()} title={props.label} />
            <Content />
          </CenterDiv>
        </Show>
      }
    >
      <div class={"w:full"}>
        <ContainerLabel onIconClick={() => setCssState(state(), { [props.name]: cssDefault[props.name] })} showIcon={isDefaultValue()} title={props.label} />
        <Content />
      </div>
    </Show>
  );
};
