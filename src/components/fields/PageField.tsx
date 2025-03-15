import { splitProps } from "solid-js";

import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

import type { GenericComponentProps } from "./type/FieldType";

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
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta;
  const _data = () => parentRenderContext()?.context.data;

  return (
    <PageViewWrapper
      expression={meta()?.P.data}
      pageVertexName={local.componentName}
    />
  );
}
