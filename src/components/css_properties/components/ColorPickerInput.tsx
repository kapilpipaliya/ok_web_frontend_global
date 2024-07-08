import { type JSX, Match, Switch, createMemo } from "solid-js";

import type { ColorPickerField } from "../constants/FieldType";

import { useCssDefaultEditor, useCssEditor, useCssState } from "../context";
import { Container } from "./Container";
import { ContainerLabel } from "./ContainerLabel";

export const ColorPickerInput = (props: Omit<ColorPickerField, 'component'>) => {
  const [cssState, setCssState] = useCssEditor();
  const [cssDefault] = useCssDefaultEditor();
  const [state] = useCssState();
  const selected = () => cssState[state() || '']?.[props.name] || cssDefault[state() ?? '']?.[props.name] || '';

  const handleChange: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    if (props.onChangeInput) {
      props.onChangeInput(event.target.value);
    }
    if (props.isAddToClass) {
      setCssState(state(), { [props.name]: event.target.value });
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

  const Label = () => (
    <ContainerLabel
      info={props.name}
      onIconClick={() => setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })}
      showIcon={isDefaultValue()}
      title={props.label}
    />
  );

  return (
    <Container>
      <Switch>
        <Match when={props.isLabelOnTop}>
          <div class={"w:full"}>
            <Label /><Content />
          </div>
        </Match>
        <Match when={props.label}>
          <div class={"flex ai:center jc:space-between w:100%"}>
            <Label />
            <Content />
          </div>
        </Match>
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    </Container>
  );
};
