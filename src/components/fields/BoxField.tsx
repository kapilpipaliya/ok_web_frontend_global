import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { GenericComponentProps } from "./FieldType";


export function BoxField(props: Readonly<GenericComponentProps>) {
  const [local, others] = splitProps(props, [
    "componentName",
    "meta",
    "data",
    "setValue",
    "value",
    "isRealTime",
    "isTableInside",
    "setValue",
    "txnId",
    "children",
  ]);

  return (
    <Dynamic
      component={local.meta.P.as || "div"}
      {...others}
    >
      {local.meta.P.text}
      {local.children}
    </Dynamic>
  );
}
