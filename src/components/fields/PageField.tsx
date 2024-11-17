import { splitProps } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

import type { GenericComponentProps } from "./FieldType";

import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";

export function PageField(props: Readonly<GenericComponentProps>) {
  const [local, _others] = splitProps(props, [
    "componentName",
    "onChange",
    "value",
    "isRealTime",
    "isTableInside",
    "txnId",
    "children",
  ]);
  const [parentContext] = usePageRenderContext();
  const meta = () => getLastItem(parentContext?.vertexes || [])!;

  return (
    <PageViewWrapper
      expression={meta().P.data}
      pageVertexLabel={local.componentName}
    />
  );
}
