import { type Component, createMemo, type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { StyleRenderer } from "./StyleRenderer";

import type {
  CssType,
  FunctionArgumentType,
} from "./form/type/FieldSchemaType";
import { useTheme } from "~/lib/context/ThemeContext";
import { processCssContent } from "~/lib/styles/processCss";
import { createUniqueId } from "~/lib/solid/createUniqueId";

type ElementProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  css?: CssType;
  class?: string;
  asProp?: string;
} & Omit<JSX.IntrinsicElements[T], "as" | "css" | "class">;

type CustomComponentProps<T extends Record<string, unknown>> = {
  as: Component<T>;
  css?: CssType;
  class?: string;
  asProp?: string;
} & T;

type AsProps<T> = T extends keyof JSX.IntrinsicElements
  ? ElementProps<T>
  : T extends Component<infer P>
    ? P extends Record<string, unknown>
      ? CustomComponentProps<P>
      : never
    : never;

/**
 * A component that wraps any HTML element or custom component and applies CSS styles.
 *
 * @example Using with HTML elements
 * ```tsx
 * // With a div element
 * <As as="div" css={myCss}>Content</As>
 *
 * // With a button element
 * <As as="button" onClick={handleClick} css={buttonCss}>Click me</As>
 * ```
 *
 * @example Using with custom components like TextInputField
 * ```tsx
 * // All TextInputField props are properly typed and passed through
 * <As
 *   as={TextInputField}
 *   name="username"
 *   label="Username"
 *   onChange={(value) => console.log(value)}
 *   css={inputCss}
 * />
 * ```
 */
export function As<
  T extends keyof JSX.IntrinsicElements | Component<Record<string, unknown>>,
>(props: AsProps<T>): JSX.Element {
  const theme = useTheme();
  const [local, rest] = splitProps(props, ["as", "css", "class", "asProp"]);
  const uniqueId = createUniqueId();

  const getCssContent = createMemo(() => {
    if (!local.css) {
      return undefined;
    }

    const functionArgs = { theme } as FunctionArgumentType;
    return processCssContent(local.css, functionArgs, uniqueId);
  });

  const finalClass = () => {
    const uniqueId2 = getCssContent() ? uniqueId : "";
    return uniqueId2 ? `${uniqueId2} ${local.class || ""}`.trim() : local.class;
  };

  return (
    <>
      <StyleRenderer cssContent={getCssContent()} id={uniqueId} />
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
