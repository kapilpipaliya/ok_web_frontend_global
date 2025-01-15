import { createEffect, on, Show, splitProps } from "solid-js";
import type { GenericComponentProps } from "./FieldType";
import { useGraph } from "~/lib/graph/graph";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";
import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { getChildrenAttrs } from "../page_designer/functions/getChildrenAttrs";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { ServerResult } from "~/cypher/types/ServerResult";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getGlobalStore } from "~/lib/graph/get/sync/getGlobalStore";

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

  const componentMeta = () => local.componentId ? graph.vertexes[local.componentId] : undefined;

  const metaDtaInitialize = (data: ServerResult) => {
    if (local.componentId && graph.vertexes[local.componentId]) {
      delete data.graph!.vertexes[props.componentId!];
    }
    setGraphData(graph, setGraph, data.graph!);
  };

  const fetchMetaData = async () => {
    const { incoming, outgoing } = getEdgesFromRowsAttr(FormMetaData.Component.attributes);
    const data = await fetchDataFromMG({
      expression:  `id:'${local.componentId}'`,
      [getGlobalStore(graph).P.url]: true,
      incoming,
      outgoing,
    });

    if (data) {
      metaDtaInitialize(data);
    }
  }

  createEffect(on(() => local.componentId!, (componentId, prevComponentId) => {
    if (componentId && componentId !== prevComponentId && (!graph.vertexes[componentId] || getChildrenAttrs(graph, setGraph, graph.vertexes[componentId]).length === 0)) {
      // Fetch attrs when no children found
      // setGraph("url", "fetchAttrs", { id: meta.id });
      fetchMetaData()
    }
  }));

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
