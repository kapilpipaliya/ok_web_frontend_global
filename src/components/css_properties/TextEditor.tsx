import type { JSX } from "solid-js";

import { createWritableMemo } from "@solid-primitives/memo";

export function TextEditor(props: Readonly<
  {
    onValueChange: (valueString: string) => void;
    value: string;
  } & JSX.HTMLAttributes<HTMLTextAreaElement>
>) {
  const [text, setText] = createWritableMemo(() => props.value);

  return (
    <textarea
      {...props}
      class={`c:black ${props.class || ''} b:1px|solid|#ccc m:5px min-h:5rem p:10px r:6px w:100%`}
      onInput={(e) => {
        setText(e.target.value);
        props.onValueChange?.(e.target.value);
      }}
      value={text()} />
  );
}
