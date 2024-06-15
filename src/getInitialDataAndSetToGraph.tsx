import type {GraphInterface, Id, Vertex} from "~/lib/graph/graph";
import {SetStoreFunction} from "solid-js/store";
import {getAPI} from "~/lib/api/getApi";
import {API} from "~/lib/api/endpoints";
import {setGraphData} from "~/lib/websocket/ws_events";

export function getInitialDataAndSetToGraph(graph: [get: GraphInterface, set: SetStoreFunction<GraphInterface>]) {
  function setComponentIdMap(vertexes: Vertex[]) {
    const vertexMap = {} as { [key: string]: Id; };
    for (const vertex of Object.values(vertexes)) {
      if (vertex.L[0] === 'Comp') {
        const propName = vertex.P.name;
        const vertexId = vertex.id;
        vertexMap[propName] = vertexId;
      }
    }
    graph[1]('componentIdMap', vertexMap);
  }

  const getData = async () => {
    try {
      const data = await getAPI(API.getInitialDataUrl);
      setGraphData(graph[0], graph[1], data as any);
      setComponentIdMap(data.vertexes);
      return data;
    } catch (error) {
      throw error;
    }
  };
  getData();
}