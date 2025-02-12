import { type JSX, splitProps } from "solid-js";

import type { ColorPickerField } from "../../constants/FieldSchemaType";

export const ColorPickerInput = (props: Readonly<ColorPickerField>) => {
  const [local, others] = splitProps(props, ["componentName", "onChange"]);
  let inputRef: HTMLInputElement | undefined;

  const handleChange: JSX.InputEventHandlerUnion<
    HTMLInputElement,
    InputEvent
  > = (event) => {
    const target = event.target as HTMLInputElement;
    local.onChange?.(target.value);
  };

  return (
    <div
      class={`${props.isLabelOnTop ? "" : "max-w:50% w:50%"} flex ai:center b:1px|solid|secondary p:5 r:5`}
    >
      <label // NOSONAR
        class={`b:1px|solid|secondary bg:${props.value || "base-200"} cursor:pointer h:25px mr:10 r:5 w:30px`}
        onClick={() => inputRef?.click()}
      >
        <input
          id="color-input"
          ref={inputRef}
          {...others}
          class="h:0 mt:30px w:0"
          onInput={handleChange}
          type="color"
          value={props.value || ""}
        />
      </label>

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
};
