import { type JSX, splitProps } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

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
    <As
      as="div"
      css={args => css`
        ${props.isLabelOnTop ? "" : "max-width: 50%; width: 50%;"}
        display: flex;
        align-items: center;
        border: 1px solid ${args.theme.var.color.secondary};
        padding: 5px;
        border-radius: 5px;
      `}
    >
      <As
        as="label"
        css={args => css`
          border: 1px solid ${args.theme.var.color.secondary};
          background: ${props.value || args.theme.var.color.base_10};
          cursor: pointer;
          height: 25px;
          margin-right: 10px;
          border-radius: 5px;
          width: 30px;
        `}
        onClick={() => inputRef?.click()}
      >
        <As
          as="input"
          css={css`
            height: 0;
            margin-top: 30px;
            width: 0;
          `}
          id="color-input"
          onInput={handleChange}
          ref={inputRef}
          type="color"
          value={props.value || ""}
          {...others}
        />
      </As>

      <As
        as="input"
        css={css`
          border: none;
          font-size: 14px;
          outline: none;
          width: 100%;
        `}
        onInput={handleChange}
        placeholder="Enter color code"
        type="text"
        value={props.value || ""}
        {...others}
      />
    </As>
  );
};
