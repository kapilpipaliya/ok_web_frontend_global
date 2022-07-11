import { JSX, Show } from "solid-js";

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
    <>
      <label
        for={props.id}
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        <Show when={props.required}>
          <span class="text-red-600">{"* "}</span>
        </Show>
        {props.label}
      </label>
      {props.children}
      <Show when={props.help}>
        <p class="mt-2 text-sm text-gray-500">{props.help}</p>
      </Show>
      <Show when={props.error}>
        <p class="mt-2 text-sm text-red-600">{props.error}</p>
      </Show>
    </>
  );
};
