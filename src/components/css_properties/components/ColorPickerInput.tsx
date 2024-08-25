import { type JSX, Match, splitProps, Switch } from "solid-js";

import type { ColorPickerField } from "../constants/FieldSchemaType";

import { Container } from "./Container";
import { LabelWrapper } from "./LabelWrapper";

export const ColorPickerInput = (props: Readonly<ColorPickerField>) => {
  const [local, others] = splitProps(props, ["componentName", "onChange"]);

  const handleChange: JSX.InputEventHandlerUnion<
    HTMLInputElement,
    InputEvent
  > = (event) => {
    const target = event.target as HTMLInputElement;
    local.onChange?.(target.value);
  };

  const Content = () => (
    <div class="flex ai:center b:1px|solid|lightgrey p:5 r:5">
      <input
        {...others}
        class="b:none bg:#ffffff cursor:pointer; h:25px mr:10 p:0 r:5 w:30px"
        onInput={handleChange}
        type="color"
        value={props.value || ""}
      />
      <input
        {...others}
        class="b:none f:14 outline:none w:100%"
        onInput={handleChange}
        placeholder="Enter color code"
        type="text"
        value={props.value || ""}
      />
    </div>
  );

  return (
    <Container>
      <Switch>
        <Match when={props.isLabelOnTop}>
          <div class={"w:full"}>
            <LabelWrapper />
            <Content />
          </div>
        </Match>
        <Match when={props.label}>
          <div class={"flex ai:center jc:space-between w:100%"}>
            <LabelWrapper />
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
