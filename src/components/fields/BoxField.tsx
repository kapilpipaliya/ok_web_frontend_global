import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { Vertex } from "~/lib/graph/graph";

import type { GenericComponentProps } from "./FieldType";

function getAttrs(meta: Vertex) {
  return meta.P.attr ? JSON.parse(meta.P.attr) : {};
}

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
      {...getAttrs(local.meta)}
    >
      {local.meta.P.text}
      {local.children}
    </Dynamic>
  );
}
