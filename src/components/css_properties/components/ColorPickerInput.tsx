import { Show, createMemo, useContext } from "solid-js";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "../context";
import { Container, ContainerLabel } from "./CssUtils";
import "~/css/componentUtilCSS.css";

export const ColorPickerInput = (props: {
  isLabelOnTop: boolean;
  name: string;
  onChangeInput: any;
  isAddToClass: boolean;
  label: any;
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
        type="color"
        class="color-picker__input-color mr:10 cursor:pointer; h:25px w:30px r:5 p:0 bg:#ffffff b:none"
        value={selected()}
        onInput={handleChange}
      />
      <input
        type="text"
        class="b:none w:100% f:14 outline:none"
        value={selected()}
        placeholder="Enter color code"
        onInput={handleChange}
      />
    </div>
  );

  return (
    <Container>
      <Show
        when={props.isLabelOnTop}
        fallback={
          <Show when={props.label} fallback={<Content />}>
            <div class={"w:100% flex jc:space-between ai:center"}>
              <ContainerLabel onIconClick={() => setCssState(state(),{ [props.name]: cssDefault[state() ?? '']?.[props.name]})} showIcon={isDefaultValue()} title={props.label} />
              <Content />
            </div>
          </Show>
        }
      >
        <div class={"w:full"}>
          <ContainerLabel onIconClick={() => setCssState(state(),{ [props.name]: cssDefault[state() ?? '']?.[props.name]})} showIcon={isDefaultValue()} title={props.label} />
          <Content />
        </div>
      </Show>
    </Container>
  );
};
