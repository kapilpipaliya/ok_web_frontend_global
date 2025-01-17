import { createEffect, createMemo, on, Show, splitProps } from "solid-js";
import type { GenericComponentProps } from "./FieldType";
import { Id, useGraph, Vertex } from "~/lib/graph/graph";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";
import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getChildrenAttrs } from "../page_designer/functions/getChildrenAttrs";
import { ServerResult } from "~/cypher/types/ServerResult";
import { evalExpression } from "~/lib/expression_eval";
import { fetchComponentData } from "~/cypher/get/fetchComponentData";

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

  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];

  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;

  const fetchMetaData = async () => {
    if (!getCopmVertex().length) {
      return;
    }
    fetchComponentData([getCopmVertex()[0]], graph, setGraph);
  }

  const getCopmVertex = createMemo(() =>  meta() ? evalExpression("->$0Comp", { graph, setGraph, vertexes: [meta()] }) as Vertex[] || [] as Vertex[] : []);

  createEffect(on(getCopmVertex, (component, prevComponent) => {
    if (component && JSON.parse(JSON.stringify(component)) !== JSON.parse(JSON.stringify(prevComponent || [])) && (component.length === 0 || getChildrenAttrs(graph, setGraph, component[0]).length === 0)) {
      // Fetch attrs when no children found
      // setGraph("url", "fetchAttrs", { id: meta.id });
      fetchMetaData()
    }
  }));

  return (
    <>
      <Show when={getCopmVertex().length}>
        <PageAttrRender data={data()} metaVertex={getCopmVertex()[0]} />
      </Show>
      <Show when={!getCopmVertex().length}>
        Error
      </Show>
    </>
  );
}
