import { createUniqueId, JSX, Show, splitProps } from "solid-js";
import { Field } from "./Field";
import { css } from "solid-styled-components";

export interface TextInputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefixElement?: JSX.Element;
  suffixElement?: JSX.Element;
  help?: string;
  error?: string;
}

export const TextInput = (props: TextInputProps) => {
  const [p, customProps] = splitProps(props, ["label", "prefixElement", "suffixElement", "help", "error"]);
  const uniqueId = createUniqueId();
  return (
    <Field label={p.label} id={uniqueId} help={p.help} error={p.error} required={customProps.required}>
      <div
        class={css`
          //relative rounded-md shadow-sm;
          display: flex;
        `}
      >
        <Show when={p.prefixElement}>
          <div
            class={css`
              //absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none;
            `}
          >
            <span
              class={css`
                //text-gray-500 sm:text-sm;
              `}
            >
              {p.prefixElement}{" "}
            </span>
          </div>
        </Show>
        <input
          type="text"
          name={p.label}
          id={uniqueId}
          //focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm rounded-md
          //          disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
          //          invalid:border-red-300 invalid:text-red-600
          //          focus:invalid:border-red-500 focus:invalid:ring-red-500"
          class={css`
            font-size: 18px;
            padding-top: 10px;
            padding-bottom: 10px;
            margin-top: 10px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 3px;
            box-sizing: border-box;
            width: 100%;
          `}
          classList={{
            "pl-7": !!props.prefixElement,
            "pr-12": !!props.suffixElement,
            "border-gray-300": !props.error,
            "border-red-300": !!props.error,
          }}
          {...customProps}
        />
        <Show when={p.suffixElement}>
          <div
            class={css`
              //absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none;
            `}
          >
            <span
              class={css`
                //text-gray-500 sm:text-sm" id="price-currency;
              `}
            >
              {p.suffixElement}
            </span>
          </div>
        </Show>
      </div>
    </Field>
  );
};
