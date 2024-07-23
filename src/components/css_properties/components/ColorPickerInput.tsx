import { path } from "rambda";
import { type JSX, Match, Switch } from "solid-js";

import type { ColorPickerField } from "../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../CssEditorContext";
import { Container } from "./Container";
import { LabelWrapper } from "./LabelWrapper";

export const ColorPickerInput = () => {
  const [cssState, setCssState] = useCssEditor();
  const [cssDefault] = useCssDefaultEditor();
  const [state] = useCssState();
  const meta = useComponentMeta() as ColorPickerField;
  const selectedValue = (): string =>
    {
      const projections = [state() || "", ...(meta.projections ?? []), meta.name];
      return path(projections, cssState) ||
        path(projections, cssDefault) ||
        "";
    };

  const handleChange: JSX.InputEventHandlerUnion<
    HTMLInputElement,
    InputEvent
  > = (event) => {
    if (meta.onChangeInput) {
      meta.onChangeInput(event.target.value);
    }
    if (meta.isAddToClass ?? true) {
      setCssState(state(), ...(meta.projections ?? []), { [meta.name]: event.target.value });
    }
  };



  const Content = () => (
    <div class="flex ai:center b:1px|solid|lightgrey p:5 r:5">
      <input
        class="b:none bg:#ffffff cursor:pointer; h:25px mr:10 p:0 r:5 w:30px"
        onInput={handleChange}
        type="color"
        value={selectedValue()}
      />
      <input
        class="b:none f:14 outline:none w:100%"
        onInput={handleChange}
        placeholder="Enter color code"
        type="text"
        value={selectedValue()}
      />
    </div>
  );



  return (
    <Container>
      <Switch>
        <Match when={meta.isLabelOnTop}>
          <div class={"w:full"}>
            <LabelWrapper />
            <Content />
          </div>
        </Match>
        <Match when={meta.label}>
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
