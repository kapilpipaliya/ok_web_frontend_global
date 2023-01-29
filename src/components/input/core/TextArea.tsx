import { createUniqueId, JSX, splitProps } from "solid-js";
import { Field } from "./Field";
import { css } from "solid-styled-components";

export interface TextAreaProps extends JSX.InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  prefix?: string;
  suffix?: string;
  help?: string;
  error?: string;
}

export const TextArea = (props: TextAreaProps) => {
  const [p, customProps] = splitProps(props, ["label", "prefix", "suffix", "help", "error"]);
  const uniqueId = createUniqueId();
  return (
    <Field label={props.label} id={uniqueId} help={props.help} error={props.error} required={props.required}>
      <div
        class={css`
          //;
        `}
      >
        <textarea
          name={p.label}
          id={uniqueId}
          class={css`
            //;
          `}
          rows={5}
          cols={50}
          {...customProps}
        />
      </div>
    </Field>
  );
};
