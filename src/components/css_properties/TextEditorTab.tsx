import { createEffect, createSignal } from "solid-js";

export function TextEditorTab(props: Readonly<{
  getCssValue: any;
  parseAndApplyCssRules: (valueString: string) => void;
}>) {
  const [text, setText] = createSignal(props.getCssValue);
  createEffect(() => {
    setText(props.getCssValue);
  });

  const style = {
    border: "1px solid #ccc",
    "border-radius": "6px",
    color: "black",
    margin: "5px",
    "min-height": "5rem",
    padding: "10px",
    width: "100%",
  };

  return (
    <textarea
      onInput={(e) => {
        setText(e.target.value);
        props.parseAndApplyCssRules(e.target.value);
        // props.setValue?.(e.target.value);
      } }
      placeholder="Start typing..."
      style={style}
      value={text()} />
  );
}
