import { createEffect, createSignal } from "solid-js";

export const TextEditor = (props: {
  getCssValue: any;
  parseAndApplyCssRules: (valueString: string) => void;
}) => {
  const [text, setText] = createSignal(props.getCssValue);
  createEffect(() => {
    setText(props.getCssValue);
  });

  const style = {
    color: "black",
    border: "1px solid #ccc",
    padding: "10px",
    margin: "5px",
    width: "100%",
    "min-height": "5rem",
    height: "20rem",
    "border-radius": "6px",
  };

  return (
    <textarea
      style={style}
      value={text()}
      onInput={(e) => {
        setText(e.target.value);
        props.parseAndApplyCssRules(e.target.value);
        // props.setValue?.(e.target.value);
      }}
      placeholder="Start typing..."
    />
  );
};
