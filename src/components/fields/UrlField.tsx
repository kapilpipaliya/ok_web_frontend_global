import { A } from "@solidjs/router";
import { splitProps } from "solid-js";

import type { GenericComponentProps } from "./FieldType";

export function UrlField(props: Readonly<GenericComponentProps>) {
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
    <A {...others} href={local.meta.P.href}>
      {local.meta.P.text}
      {local.children}
    </A>
  );
}
