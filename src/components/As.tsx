import {
  type Component,
  createMemo,
  createUniqueId,
  type JSX,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { StyleRenderer } from "./StyleRenderer";

import type {
  CssType,
  FunctionArgumentType,
} from "./form/type/FieldSchemaType";
import { useTheme } from "~/lib/context/ThemeContext";
import { processCssContent } from "~/lib/styles/processCss";

type ElementProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  css?: CssType;
  class?: string;
  asProp?: string;
} & Omit<JSX.IntrinsicElements[T], "as" | "css" | "class">;

type CustomComponentProps = {
  as: Component<any>;
  css?: CssType;
  class?: string;
  asProp?: string;
  [key: string]: any;
};

type AsProps<T extends keyof JSX.IntrinsicElements | Component<any>> =
  T extends keyof JSX.IntrinsicElements
    ? ElementProps<T>
    : CustomComponentProps;

export function As<T extends keyof JSX.IntrinsicElements | Component<any>>(
  props: AsProps<T>,
): JSX.Element {
  const theme = useTheme();
  const [local, rest] = splitProps(props, ["as", "css", "class", "asProp"]);
  const uniqueId = `cssUId-${createUniqueId()}`;

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
      {/* @ts-ignore */}
      <StyleRenderer cssContent={getCssContent()} id={uniqueId} />
      {/* @ts-ignore */}
      <Dynamic<T>
        component={local.as}
        {...rest}
        class={finalClass()}
        as={local.asProp}
      />
    </>
  );
}
