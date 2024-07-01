import { Show, createMemo, useContext } from "solid-js";

import "~/css/componentUtilCSS.css";

import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "../context";
import { Container, ContainerLabel } from "./CssUtils";

export const ColorPickerInput = (props: {
  infoLink?: string;
  isAddToClass: boolean;
  isLabelOnTop: boolean;
  label: any;
  name: string;
  onChangeInput: any;
}) => {
  const [cssState, setCssState] = useContext(CssEditorContext);
     const [cssDefault, setCssDefault] = useContext(CssDefaultEditorContext);
  const [state, setState] = useContext(CssStateContext);
  const selected = () => cssState[state() || '']?.[props.name] || cssDefault[state() ?? '']?.[props.name] || '';

  const handleChange = (event: any) => {
    if (props.onChangeInput) {
      props.onChangeInput(event.target.value);
    }
    if (props.isAddToClass) {
      setCssState(state(),{[props.name]: event.target.value});
    }
  };
  const isDefaultValue = createMemo(() => selected() !== cssDefault[state() ?? '']?.[props.name] && selected() !== '#000000');

  const Content = () => (
    <div class="flex ai:center b:1px|solid|lightgrey p:5 r:5">
      <input
        class="color-picker__input-color b:none bg:#ffffff cursor:pointer; h:25px mr:10 p:0 r:5 w:30px"
        onInput={handleChange}
        type="color"
        value={selected()}
      />
      <input
        class="b:none f:14 outline:none w:100%"
        onInput={handleChange}
        placeholder="Enter color code"
        type="text"
        value={selected()}
      />
    </div>
  );

  return (
    <Container>
      <Show
        fallback={
          <Show fallback={<Content />} when={props.label}>
            <div class={"flex ai:center jc:space-between w:100%"}>
              <ContainerLabel info={props.name} onIconClick={() => setCssState(state(),{ [props.name]: cssDefault[state() ?? '']?.[props.name]})} showIcon={isDefaultValue()} title={props.label} />
              <Content />
            </div>
          </Show>
        }
        when={props.isLabelOnTop}
      >
        <div class={"w:full"}>
          <ContainerLabel info={props.name} onIconClick={() => setCssState(state(),{ [props.name]: cssDefault[state() ?? '']?.[props.name]})} showIcon={isDefaultValue()} title={props.label} />
          <Content />
        </div>
      </Show>
    </Container>
  );
};
