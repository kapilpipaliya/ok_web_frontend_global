import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { GenericComponentProps } from "./FieldType";

export function BoxField(
  props: { as?: string } & Readonly<GenericComponentProps>,
) {
  const [local, others] = splitProps(props, [
    "componentName",
    "meta",
    "data",
    "onChange",
    "value",
    "isRealTime",
    "isTableInside",
    "txnId",
    "children",
    "as",
  ]);

  return (
    <Dynamic component={local.as || "div"} {...others}>
      {local.children}
    </Dynamic>
  );
}
