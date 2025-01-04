import { BroadcastChannel } from 'broadcast-channel';
import { SetStoreFunction, reconcile } from 'solid-js/store';
import { GraphInterface } from '~/lib/graph/graph';
import { addNewEdge, replaceEdgeProperties, replaceEdgeStart, replaceEdgeEnd, deleteEdge, updateEdgeId } from '~/lib/graph/mutate/edge';
import { updateVertex, updateEdge } from '~/lib/graph/mutate/setGraphData';
import { addNewVertex, replaceVertexProperties, mergeVertexProperties, deleteVertex, updateVertexId } from '~/lib/graph/mutate/vertex';

const channels = new Map<string, BroadcastChannel>();

export function getChannel(name: string): BroadcastChannel {
  if (!channels.has(name)) {
    channels.set(name, new BroadcastChannel(name));
  }
  return channels.get(name)!;
}

export function handleChannelMessage(msg: any, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, id?: string) {
  const data = JSON.parse(msg);
  // initial data:
  if (data.graph) {
    setGraph(reconcile(data.graph, { merge: true }));
    if (id) {
      setGraph("broadcastChannels", (channels) => channels.includes(id) ? channels : [...channels, id]);
    }
  }

  // Vertex functions:
  if (data.addNewVertex) {
    addNewVertex(data.addNewVertex.txnId, data.addNewVertex.vertex, graph, setGraph, { skipPostMessage: true });
  }
  if (data.replaceVertexProperties) {
    replaceVertexProperties(data.replaceVertexProperties.txnId, data.replaceVertexProperties.vertexId, graph, setGraph, data.replaceVertexProperties.properties, { skipPostMessage: true });
  }
  if (data.mergeVertexProperties) {
    mergeVertexProperties(data.mergeVertexProperties.txnId, data.mergeVertexProperties.vertexId, graph, setGraph, data.mergeVertexProperties.properties, { skipPostMessage: true });
  }
  if (data.deleteVertex) {
    deleteVertex(data.deleteVertex.txnId, data.deleteVertex.vertexId, graph, setGraph, { skipPostMessage: true });
  }
  if (data.updateVertexId) {
    updateVertexId(data.updateVertexId.oldVertexId, data.updateVertexId.newVertexId, graph, setGraph, { skipPostMessage: true });
  }
  // Edge functions:
  if (data.addNewEdge) {
    addNewEdge(data.addNewEdge.txnId, data.addNewEdge.edge, graph, setGraph, { skipPostMessage: true });
  }
  if (data.replaceEdgeProperties) {
    replaceEdgeProperties(data.replaceEdgeProperties.txnId, data.replaceEdgeProperties.edgeId, graph, setGraph, data.replaceEdgeProperties.properties, { skipPostMessage: true });
  }
  if (data.replaceEdgeStart) {
    replaceEdgeStart(data.replaceEdgeStart.txnId, data.replaceEdgeStart.edgeId, graph, setGraph, data.replaceEdgeStart.newStartVertexId, { skipPostMessage: true });
  }
  if (data.replaceEdgeEnd) {
    replaceEdgeEnd(data.replaceEdgeEnd.txnId, data.replaceEdgeEnd.edgeId, graph, setGraph, data.replaceEdgeEnd.newEndVertexId, { skipPostMessage: true });
  }
  if (data.deleteEdge) {
    deleteEdge(data.deleteEdge.txnId, data.deleteEdge.edgeId, graph, setGraph, { skipPostMessage: true });
  }
  if (data.updateEdgeId) {
    updateEdgeId(data.updateEdgeId.oldEdgeId, data.updateEdgeId.newEdgeId, graph, setGraph, { skipPostMessage: true });
  }
  // setGraphData functions:
  if (data.updateVertex) {
    updateVertex(data.updateVertex.vertexId, data.updateVertex.vertexData, graph, setGraph, { ...(data.updateVertex.options ?? {}), skipPostMessage: true });
  }
  if (data.updateEdge) {
    updateEdge(data.updateEdge.edgeId, data.updateEdge.edge, graph, setGraph, { ...(data.updateEdge.options ?? {}), skipPostMessage: true });
  }
}

export function broadcastToAllChannels(channels: string[], message: any) {
  const messageString = JSON.stringify(message);
  channels.forEach((channelName) => {
    const channel = getChannel(channelName);
    channel.postMessage(messageString);
  });
}

