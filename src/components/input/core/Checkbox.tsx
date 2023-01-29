import { createUniqueId, JSX, Show, splitProps } from "solid-js";
import { css } from "solid-styled-components";

export interface CheckboxProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = (props: CheckboxProps) => {
  const [p, customProps] = splitProps(props, ["label", "description", "error"]);
  const uniqueId = createUniqueId();
  return (
    <div
      class={css`
        display: flex;
        //relative flex items-start
      `}
    >
      <div
        class={css`
          // flex items-center h-5
        `}
      >
        <input
          {...customProps}
          id={uniqueId}
          // aria-describedby="comments-description"
          name={uniqueId}
          type="checkbox"
          class={css``}
        />
      </div>
      <div class={css``}>
        <label html-for={uniqueId} class={css``}>
          {p.label}
        </label>
        <p id={`${uniqueId}-description`} class={css``}>
          {p.description}
        </p>
        <Show when={p.error}>
          <p class={css``}>{p.error}</p>
        </Show>
      </div>
    </div>
  );
};
