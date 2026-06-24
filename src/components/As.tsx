import {
  type Component,
  createMemo,
  type JSX,
  Show,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";

import { ComponentScopedStyle } from "~/components/ComponentScopedStyle";
import type { FunctionArgumentType } from "./form/type/FieldSchemaType";
import { useTheme } from "~/lib/theme/ThemeContext";
import { useComponentStylesMode } from "~/lib/styles/ComponentStylesContext";
import { scopeComponentCss } from "~/lib/styles/scopeComponentCss";
import { useComponentCssLifecycle } from "~/lib/styles/useComponentCssLifecycle";
import type { CssType } from "~/components/form/type/CssType";

type ElementProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  css?: CssType;
  class?: string;
  asProp?: string;
} & Omit<JSX.IntrinsicElements[T], "as" | "css" | "class">;

type CustomComponentProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as: Component<any>;
  css?: CssType;
  class?: string;
  asProp?: string;
  [key: string]: unknown;
};

type AsProps<T> = T extends keyof JSX.IntrinsicElements
  ? ElementProps<T>
  : CustomComponentProps;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function As<T extends keyof JSX.IntrinsicElements | Component<any>>(
  props: AsProps<T>,
): JSX.Element {
  const theme = useTheme();
  const { usePerComponentStyles } = useComponentStylesMode();
  const [local, rest] = splitProps(props, ["as", "css", "class", "asProp"]);

  const scopedCss = createMemo(() => {
    const functionArgs = { theme } as FunctionArgumentType;
    return scopeComponentCss(local.css, functionArgs);
  });

  useComponentCssLifecycle(scopedCss);

  const finalClass = () => {
    const hashClass = scopedCss()?.hash;
    return hashClass ? `${hashClass} ${local.class || ""}`.trim() : local.class;
  };

  return (
    <>
      <Show when={scopedCss()?.scoped && usePerComponentStyles()} keyed>
        <ComponentScopedStyle cssContent={scopedCss()!.scoped} />
      </Show>
      {/* @ts-expect-error - Dynamic component typing with generics requires this */}
      <Dynamic
        component={local.as}
        {...rest}
        class={finalClass()}
        as={local.asProp}
      />
    </>
  );
}
