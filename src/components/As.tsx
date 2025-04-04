import { Style } from "@solidjs/meta";
import { For, JSX, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

type AsProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  css?: string | string[];
} & Omit<JSX.IntrinsicElements[T], 'as' | 'css'>;

export function As<T extends keyof JSX.IntrinsicElements>(
  props: AsProps<T>
): JSX.Element {
  const [local, rest] = splitProps(props, ["as", "css"]);

  return (
    <>
      <Show when={Array.isArray(local.css)}>
        <For each={local.css as string[]}>
          {(style) => (
            <Style>
              {style}
            </Style>
          )}
        </For>
      </Show>

      <Show when={local.css && !Array.isArray(local.css)}>
        <Style>
          {local.css as string}
        </Style>
      </Show>

      <Dynamic<T> component={local.as} {...(rest as JSX.IntrinsicElements[T])} />
    </>
  );
}
