import {
  children,
  createMemo,
  type JSX,
  Match,
  splitProps,
  Switch,
} from "solid-js";
import { Dynamic } from "solid-js/web";

import { useFormContext } from "../form/FormContext";

interface LabeledFieldProps {
  children: JSX.Element;
  inline?: boolean;
  label?: string;
  layoutClass?: string;
  position?: "bottom" | "left" | "right" | "system" | "top";
  required?: boolean;
}

export function Label(
  props: Readonly<
    JSX.HTMLAttributes<HTMLSpanElement> &
      JSX.IntrinsicAttributes &
      LabeledFieldProps
  >,
) {
  const [formStore] = useFormContext();

  const position = createMemo(() =>
    !props.position || props.position === "system"
      ? formStore?.formMeta?.P.position || "top"
      : props.position,
  );

  const generateLabelClass = () => {
    const styles: { [key: string]: string } = {};
    if (position() === "top") {
      styles.mb = "5px";
    }
    if (position() === "right") {
      styles.ml = "5px";
    }
    if (position() === "left") {
      styles.mr = "5px";
    }
    if (position() === "bottom") {
      styles.mt = "5px";
    }
    return Object.entries(styles)
      .map(([key, value]) => `${key}:${value}`)
      .join(" ");
  };
  const [local, restProps] = splitProps(props, [
    "label",
    "position",
    "children",
    "required",
    "layoutClass",
  ]);
  const resolvedChildren = children(() => local.children);

  // note: table should not be wrapped inside label
  const component = createMemo(() =>
    isFirstElementSupportedByLabel(resolvedChildren() as HTMLElement)
      ? "label"
      : "div",
  );

  return (
    <Dynamic
      class={`${props.inline ? "inline-flex" : "flex"}  ${local.layoutClass ?? ""} align-items:${position() === "left" || position() === "right" ? "center" : "flex-start"} flex-direction:${position() === "top" || position() === "bottom" ? "column" : "row"}`}
      component={component()}
    >
      <Switch fallback={resolvedChildren()}>
        <Match
          when={local.label && (position() === "top" || position() === "left")}
        >
          <span class={generateLabelClass()} {...restProps}>
            {local.label}
            {local.required && <span class="color:red"> *</span>}
          </span>
          {resolvedChildren()}
        </Match>
        <Match
          when={
            local.label && (position() === "bottom" || position() === "right")
          }
        >
          {resolvedChildren()}
          <span class={generateLabelClass()} {...restProps}>
            {local.label}
            {local.required && <span class="color:red"> *</span>}
          </span>
        </Match>
      </Switch>
    </Dynamic>
  );
}

// Other label component: https://github.com/radix-ui/primitives/blob/main/packages/react/label/src/Label.tsx

export function isFirstElementSupportedByLabel(
  node: HTMLElement | HTMLElement[],
): boolean {
  if (!node) {
    return false;
  }

  const firstElement = Array.isArray(node) ? node[0] : node;
  if (!firstElement) {
    return false;
  }
  if (typeof firstElement === "string") {
    return true;
  }

  const supportedTags = [
    "input",
    "select",
    "textarea",
    "output",
    "meter",
    "progress",
  ];
  return supportedTags.includes(firstElement.tagName.toLowerCase());
}
