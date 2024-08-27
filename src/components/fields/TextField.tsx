import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { GenericComponentProps } from "./FieldType";

import { usePageRenderContext } from "../page_attr_render/PageRenderContext";

export function TextField(props: Readonly<GenericComponentProps>) {
  const [parentItems] = usePageRenderContext();
  const meta = () => getLastItem(parentItems!.vertexes)!;
  const [local, others] = splitProps(props, [
    "componentName",
    "onChange",
    "value",
    "isRealTime",
    "isTableInside",
    "txnId",
    "children",
  ]);

  return (
    <Dynamic component={meta().P.as ?? "span"} {...others}>
      {meta().P.text}
      {local.children}
    </Dynamic>
  );
}
