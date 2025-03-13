import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { GenericComponentProps } from "./FieldType";

// keep as its used in metadata
export function TextField(
  props: Readonly<GenericComponentProps & { as?: string; text?: string }>,
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
      {local.children}
    </Dynamic>
  );
}
