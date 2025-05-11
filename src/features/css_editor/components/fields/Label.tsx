import {
  children,
  createMemo,
  type JSX,
  Match,
  splitProps,
  Switch,
} from "solid-js";

import { As } from "~/components/As";
import { css } from "~/lib/styles";

import {
  type FormStoreObject,
  useFormContext,
} from "../../../../components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface LabeledFieldProps {
  children: JSX.Element;
  inline?: boolean;
  label?: string;
  layoutClass?: string;
  position?: "bottom" | "left" | "right" | "system" | "top";
  required?: boolean;
}

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

// Other label component: https://github.com/radix-ui/primitives/blob/main/packages/react/label/src/Label.tsx

export function Label(
  props: Readonly<
    JSX.HTMLAttributes<HTMLSpanElement> &
      JSX.IntrinsicAttributes &
      LabeledFieldProps
  >,
) {
  const formId = useFormContext();
  const [graph] = useGraph();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;

  const position = createMemo(() =>
    !props.position || props.position === "system"
      ? graph.vertexes[formVertex()?.P.formMetaId!]?.P.position || "top"
      : props.position,
  );

  const generateLabelCss = () => {
    const styles = [];
    if (position() === "top") {
      styles.push("margin-bottom: 5px;");
    }
    if (position() === "right") {
      styles.push("margin-left: 5px;");
    }
    if (position() === "left") {
      styles.push("margin-right: 5px;");
    }
    if (position() === "bottom") {
      styles.push("margin-top: 5px;");
    }
    return styles.join(" ");
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
    <As
      as={component()}
      css={css`
        ${props.inline ? "display: inline-flex;" : "display: flex;"}
        ${local.layoutClass ?? ""}
        align-items: ${position() === "left" || position() === "right" ? "center" : "flex-start"};
        flex-direction: ${position() === "top" || position() === "bottom" ? "column" : "row"};
      `}
    >
      <Switch fallback={resolvedChildren()}>
        <Match
          when={local.label && (position() === "top" || position() === "left")}
        >
          <As as="span" css={css`${generateLabelCss()}`} {...restProps}>
            {local.label}
            {local.required && (
              <As as="span" css={css`color: \${args.theme.var.color.error};`}>
                {" "}
                *
              </As>
            )}
          </As>
          {resolvedChildren()}
        </Match>
        <Match
          when={
            local.label && (position() === "bottom" || position() === "right")
          }
        >
          {resolvedChildren()}
          <As as="span" css={css`${generateLabelCss()}`} {...restProps}>
            {local.label}
            {local.required && (
              <As
                as="span"
                css={(args) => css`color: ${args.theme.var.color.error};`}
              >
                {" "}
                *
              </As>
            )}
          </As>
        </Match>
      </Switch>
    </As>
  );
}
