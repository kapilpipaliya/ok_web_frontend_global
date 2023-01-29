import { JSX, Show } from "solid-js";
import { css } from "solid-styled-components";

interface FieldProps {
  label: string;
  help?: string;
  error?: string;
  children: JSX.Element;
  id?: string;
  required?: boolean;
}

export const Field = (props: FieldProps) => {
  return (
    <div
      class={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <label
        for={props.id}
        class={css`
          //block text-sm font-medium text-gray-700 mb-1;
        `}
      >
        <Show when={props.required}>
          <span
            class={css`
              //text-red-600"> ;
            `}
          ></span>
        </Show>
        {props.label}
      </label>
      {props.children}
      <Show when={props.help}>
        <p
          class={css`
            //mt-2 text-sm text-gray-500;
          `}
        >
          {props.help}
        </p>
      </Show>
      <Show when={props.error}>
        <p
          class={css`
            //mt-2 text-sm text-red-600;
          `}
        >
          {props.error}
        </p>
      </Show>
    </div>
  );
};
