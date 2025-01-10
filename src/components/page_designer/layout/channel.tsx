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
//  currently we assume that each iframe has unique channel ID
export function handleChannelMessage(msg: any, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, id: string, addChannelId?: string) {
  const data = JSON.parse(msg);
  // initial data:
  if (data.graph) {
    setGraph(reconcile(data.graph, { merge: true }));
    if (addChannelId) {
      setGraph("broadcastChannels", (channels) => channels.includes(addChannelId) ? channels : [...channels, addChannelId]);
    }
  }

  // Vertex functions:
  if (data.addNewVertex) {
    addNewVertex(data.addNewVertex.txnId, data.addNewVertex.vertex, graph, setGraph, { skipPostMessage: id });
  }
  if (data.replaceVertexProperties) {
    replaceVertexProperties(data.replaceVertexProperties.txnId, data.replaceVertexProperties.vertexId, graph, setGraph, data.replaceVertexProperties.properties, { skipPostMessage: id });
  }
  if (data.mergeVertexProperties) {
    mergeVertexProperties(data.mergeVertexProperties.txnId, data.mergeVertexProperties.vertexId, graph, setGraph, data.mergeVertexProperties.properties, { skipPostMessage: id });
  }
  if (data.deleteVertex) {
    deleteVertex(data.deleteVertex.txnId, data.deleteVertex.vertexId, graph, setGraph, { skipPostMessage: id });
  }
  if (data.updateVertexId) {
    updateVertexId(data.updateVertexId.oldVertexId, data.updateVertexId.newVertexId, graph, setGraph, { skipPostMessage: id });
  }
  // Edge functions:
  if (data.addNewEdge) {
    addNewEdge(data.addNewEdge.txnId, data.addNewEdge.edge, graph, setGraph, { skipPostMessage: id });
  }
  if (data.replaceEdgeProperties) {
    replaceEdgeProperties(data.replaceEdgeProperties.txnId, data.replaceEdgeProperties.edgeId, graph, setGraph, data.replaceEdgeProperties.properties, { skipPostMessage: id });
  }
  if (data.replaceEdgeStart) {
    replaceEdgeStart(data.replaceEdgeStart.txnId, data.replaceEdgeStart.edgeId, graph, setGraph, data.replaceEdgeStart.newStartVertexId, { skipPostMessage: id });
  }
  if (data.replaceEdgeEnd) {
    replaceEdgeEnd(data.replaceEdgeEnd.txnId, data.replaceEdgeEnd.edgeId, graph, setGraph, data.replaceEdgeEnd.newEndVertexId, { skipPostMessage: id });
  }
  if (data.deleteEdge) {
    deleteEdge(data.deleteEdge.txnId, data.deleteEdge.edgeId, graph, setGraph, { skipPostMessage: id });
  }
  if (data.updateEdgeId) {
    updateEdgeId(data.updateEdgeId.oldEdgeId, data.updateEdgeId.newEdgeId, graph, setGraph, { skipPostMessage: id });
  }
  // setGraphData functions:
  if (data.updateVertex) {
    updateVertex(data.updateVertex.vertexId, data.updateVertex.vertexData, graph, setGraph, { ...(data.updateVertex.options ?? {}), skipPostMessage: id });
  }
  if (data.updateEdge) {
    updateEdge(data.updateEdge.edgeId, data.updateEdge.edge, graph, setGraph, { ...(data.updateEdge.options ?? {}), skipPostMessage: id });
  }
}

export function broadcastToAllChannels(channels: string[], skipChannel: string, message: any) {
  const messageString = JSON.stringify(message);
  channels.forEach((channelName) => {
    if (channelName !== skipChannel) {
      const channel = getChannel(channelName);
      channel.postMessage(messageString);
    }
  });
}
