import { Icon } from "@iconify-icon/solid";
import { type JSX, splitProps } from "solid-js";
import { As } from "~/components/As";
import { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { css } from "~/lib/styles";

export function SearchBar(
  props: Readonly<
    JSX.InputHTMLAttributes<HTMLInputElement> & {
      handleChange: (value: string) => void;
    }
  >,
) {
  const [_local, inputProps] = splitProps(props, ["handleChange"]);
  return (
    <As as="div" css={css`
  /* lh: 28px; */
  display: flex;
  align-items: center;
  padding: 5px 0px;
  position: relative;
  width: 100%;
`}>
      <As as={Icon}
        css={(args: FunctionArgumentType) => css`
  color: ${args.theme.var.color.base_80};
  padding-left: 6px;
  position: absolute;
`}
        height={18}
        icon="ph:magnifying-glass"
        noobserver
        width={18}
      />
      <As as="input"
        css={css`
  line-height: 28px;
  border: 1px solid \${args.theme.var.color.base_40};
  color: \${args.theme.var.color.base};
  font-size: 14px;
  height: 40px;
  padding: 0 1rem 0 1.8rem;
  border-radius: 8px;
  transition: 0.3s ease;
  width: 100%;
  &:focus {
    outline: none;
    border-color: \${args.theme.var.color.primary};
    background-color: white;
  }
  &::placeholder {
    color: \${args.theme.var.color.base_60};
  }
`}
        onInput={(e) => props.handleChange(e.target.value)}
        type="search"
        value={props.value}
        {...inputProps}
      />
    </As>
  );
}
