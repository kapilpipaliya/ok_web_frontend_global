import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { GenericComponentProps } from "./FieldType";

import { usePageRenderContext } from "../page_attr_render/PageRenderContext";

export function TextField(props: Readonly<{ as?: string; text?: string } & GenericComponentProps>) {
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
      {local.value}
      {local.children}
    </Dynamic>
  );
}
