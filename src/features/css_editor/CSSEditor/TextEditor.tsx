import { createWritableMemo } from "@solid-primitives/memo";

interface TextAreaProps
  extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (valueString: string) => void;
  value: string;
}

export function TextEditor(props: Readonly<TextAreaProps>) {
  const [text, setText] = createWritableMemo(() => props.value);

  return (
    <textarea
      {...props}
      class={`c:black ${props.class || ""} b:1px|solid|#ccc my:5px min-h:5rem p:6 r:6 w:100%`}
      onInput={(e) => {
        setText(e.target.value);
        props.onValueChange?.(e.target.value);
      }}
      value={text()}
    />
  );
}
