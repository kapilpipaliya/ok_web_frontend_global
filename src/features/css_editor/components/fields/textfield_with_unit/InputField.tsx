import { splitProps } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

import { getValueWithoutUnits } from "../../../../../lib/data_structure/number/getValueWithoutUnits";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

export interface InputFieldProps {
  handleChange: (event: Event) => void;
  inputProps?: {
    min?: number;
    max?: number;
    step?: number;
  };
  label?: string;
  onFocus?: () => void;
  placeholder?: string;
  type?: string;
  value?: string;
  css?: string | string[];
}

export const InputField = (props: Readonly<InputFieldProps>) => {
  const [local, others] = splitProps(props, [
    "value",
    "handleChange",
    "label",
    "type",
    "placeholder",
    "inputProps",
    "onFocus",
    "css",
  ]);

  const InnerInput = () => (
    <As
      as="input"
      css={[
        ...ensureArray(local.css),
        css`
        width: 100%;
        border: none;
        outline: none;
        padding: 5px;
        background: transparent;
      `,
      ]}
      onChange={local.handleChange}
      onFocus={local.onFocus}
      placeholder={local.type === "number" ? "0" : (local.placeholder ?? "")}
      type={local.type ?? "text"}
      value={
        local.type === "number"
          ? getValueWithoutUnits(local.value)
          : local.value || ""
      }
      {...local.inputProps}
      {...others}
    />
  );

  return <InnerInput />;
};
