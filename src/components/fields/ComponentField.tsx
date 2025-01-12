import { Show, splitProps } from "solid-js";
import type { GenericComponentProps } from "./FieldType";
import { useGraph } from "~/lib/graph/graph";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";
import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
export function ComponentField(props: Readonly<GenericComponentProps & { componentId?: string }>) {
  const [local] = splitProps(props, [
    "componentName",
    "onChange",
    "value", 
    "isRealTime",
    "isTableInside",
    "txnId",
    "componentId"
  ]);

  const [graph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];

  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;

  const componentMeta = () => local.componentId ? graph.vertexes[local.componentId] : undefined;

  return (
    <>
      <Show when={local.componentId && componentMeta()}>
        <PageAttrRender data={data()} metaVertex={componentMeta()!} />
      </Show>
      <Show when={!local.componentId}>
        Error
      </Show>
    </>
  );
}
