import { createWritableMemo } from "@solid-primitives/memo";
import { JSX } from "solid-js";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { css } from "~/lib/styles";

interface TextAreaProps
  extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (valueString: string) => void;
  value: string;
  css: string | string[];
}

export function TextEditor(props: Readonly<TextAreaProps>) {
  const [text, setText] = createWritableMemo(() => props.value);

  return (
    <As as="textarea"
      {...props}
      css={[...ensureArray(props.css), css`
  color: black;
  border: 1px solid #3b82f6;
  margin-top: 5px; margin-bottom: 5px;
  min-height: 5rem;
  padding: 6px;
  border-radius: 6px;
  width: 100%;
`]}
      onInput={(e) => {
        setText(e.target.value);
        props.onValueChange?.(e.target.value);
      }}
      value={text()}
    />
  );
}
