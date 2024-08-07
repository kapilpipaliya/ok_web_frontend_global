import { splitProps } from "solid-js";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import type { GenericComponentProps } from "./FieldType";

export function PageField(props: Readonly<GenericComponentProps>) {
  const [local, _others] = splitProps(props, [
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
    <PageViewWrapper
      expression={local.meta.P.data}
      pageVertexLabel={local.componentName}
    />
  );
}
