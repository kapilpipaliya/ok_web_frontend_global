import {
  type JSX,
  Match,
  Switch,
  createMemo,
  splitProps,
} from "solid-js";

import { useFormContext } from "~/lib/contexts";

interface LabeledFieldProps {
  children: JSX.Element;
  label?: string;
  position?: "bottom" | "left" | "right" | "system" | "top";
}

export function Label(
  props: Readonly<JSX.HTMLAttributes<HTMLSpanElement> &
    JSX.IntrinsicAttributes &
    LabeledFieldProps>,
) {
  const formData = useFormContext();

  const position = createMemo(() =>
    !props.position || props.position === "system"
      ? formData.formMeta?.P.position || "top"
      : props.position,
  );
  
  const generateLabelClass = () => {
    const styles: { [key: string]: string } = {};
    if (position() === "top") styles["mb"] = "5px";
    if (position() === "right") styles["ml"] = "5px";
    if (position() === "left") styles["mr"] = "5px";
    if (position() === "bottom") styles["mt"] = "5px";
    return Object.entries(styles)
      .map(([key, value]) => `${key}:${value}`)
      .join(" ");
  };
  const [local, restProps] = splitProps(props, [
    "label",
    "position",
    "children",
  ]);

  return (
    <label class={`flex align-items:${position() === "left" || position() === "right" ? "center" : "flex-start"} flex-direction:${position() === "top" || position() === "bottom" ? "column" : "row"}`}>
      <Switch fallback={<>{local.children}</>}>
        <Match when={local.label && (position() === "top" || position() === "left")}>
          <span class={generateLabelClass()} {...restProps}>
            {local.label}
          </span>
          {local.children}
        </Match>
        <Match when={local.label && (position() === "bottom" || position() === "right")}>
          {local.children}
          <span class={generateLabelClass()} {...restProps}>
            {local.label}
          </span>
        </Match>
      </Switch>
    </label>
  );
}

// Other label component: https://github.com/radix-ui/primitives/blob/main/packages/react/label/src/Label.tsx