import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { GenericComponentProps } from "./FieldType";

export function TextField(
  props: Readonly<{ as?: string; text?: string } & GenericComponentProps>,
) {
  const [local, others] = splitProps(props, [
    "componentName",
    "onChange",
    "value",
    "isRealTime",
    "isTableInside",
    "txnId",
    "children",
    "text",
    "as",
  ]);

  return (
    <Dynamic component={local.as ?? "span"} {...others}>
      {local.text}
      {local.value}
      {local.children}
    </Dynamic>
  );
}
