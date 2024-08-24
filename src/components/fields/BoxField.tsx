import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { GenericComponentProps } from "./FieldType";

export function BoxField(props: Readonly<GenericComponentProps>) {
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
  ]);

  return (
    <Dynamic component={local.meta.P.as || "div"} {...others}>
      {local.children}
    </Dynamic>
  );
}
