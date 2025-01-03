
import { createStore, reconcile } from 'solid-js/store';
import { useGraph } from '~/lib/graph/graph';
import { PageView } from "~/components/page_attr_render/PageView";
import { DesignerLayoutStoreContext, getInitialDesignerLayoutStore } from '~/components/page_designer/context/LayoutContext';
import { Show } from 'solid-js';
import { channel } from '~/components/page_designer/layout/channel';
import { addNewVertex, deleteVertex, mergeVertexProperties, replaceVertexProperties, updateVertexId } from '~/lib/graph/mutate/vertex';
import { updateEdge, updateVertex } from '~/lib/graph/mutate/setGraphData';
import { addNewEdge, deleteEdge, replaceEdgeEnd, replaceEdgeProperties, replaceEdgeStart, updateEdgeId } from '~/lib/graph/mutate/edge';

export default function PageShareView() {
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get('id');

  const [graph, setGraph] = useGraph();
  const pageDesignerStore = createStore(getInitialDesignerLayoutStore());
  const [layoutStore, setLayoutStore] = pageDesignerStore;

  channel.onmessage = msg => {
    const data = JSON.parse(msg);
    if (data.graph) {
      setGraph(reconcile(data.graph, {merge: true}));
    }
    if (data.layoutStore) {
      setLayoutStore(reconcile(data.layoutStore, {merge: true}));
    }
    // Vertex functions:
    if (data.addNewVertex) {
      addNewVertex(data.addNewVertex.txnId, data.addNewVertex.vertex, graph, setGraph);
    }
    if (data.replaceVertexProperties) {
      replaceVertexProperties(data.replaceVertexProperties.txnId, data.replaceVertexProperties.vertexId, graph, setGraph, data.replaceVertexProperties.properties);
    }
    if (data.mergeVertexProperties) {
      mergeVertexProperties(data.mergeVertexProperties.txnId, data.mergeVertexProperties.vertexId, graph, setGraph, data.mergeVertexProperties.properties);
    }
    if (data.deleteVertex) {
      deleteVertex(data.deleteVertex.txnId, data.deleteVertex.vertexId, graph, setGraph);
    }
    if (data.updateVertexId) {
      updateVertexId(data.updateVertexId.oldVertexId, data.updateVertexId.newVertexId, graph, setGraph);
    }
    // Edge functions:
    if (data.addNewEdge) {
      addNewEdge(data.addNewEdge.txnId, data.addNewEdge.edge, graph, setGraph);
    }
    if (data.replaceEdgeProperties) {
      replaceEdgeProperties(data.replaceEdgeProperties.txnId, data.replaceEdgeProperties.edgeId, graph, setGraph, data.replaceEdgeProperties.properties);
    }
    if (data.replaceEdgeStart) {
      replaceEdgeStart(data.replaceEdgeStart.txnId, data.replaceEdgeStart.edgeId, graph, setGraph, data.replaceEdgeStart.newStartVertexId);
    }
    if (data.replaceEdgeEnd) {
      replaceEdgeEnd(data.replaceEdgeEnd.txnId, data.replaceEdgeEnd.edgeId, graph, setGraph, data.replaceEdgeEnd.newEndVertexId);
    }
    if (data.deleteEdge) {
      deleteEdge(data.deleteEdge.txnId, data.deleteEdge.edgeId, graph, setGraph);
    }
    if (data.updateEdgeId) {
      updateEdgeId(data.updateEdgeId.oldEdgeId, data.updateEdgeId.newEdgeId, graph, setGraph);
    }
    // setGraphData functions:
    if (data.updateVertex) {
      updateVertex(data.updateVertex.vertexId, data.updateVertex.vertexData, graph, setGraph, data.updateVertex.skipExisting);
    }
    if (data.updateEdge) {
      updateEdge(data.updateEdge.edgeId, data.updateEdge.edge, graph, setGraph, data.updateEdge.skipExisting);
    }
  };

  return (
    <Show when={layoutStore.formStore?.[0]}>
      <DesignerLayoutStoreContext.Provider value={pageDesignerStore}>
        <PageView
          isDesignMode={true}
          isNoPermissionCheck={true}
          metaVertex={graph.vertexes[layoutStore.formStore[0]?.formDataId!]}
        />
      </DesignerLayoutStoreContext.Provider>
    </Show>
  );
}
