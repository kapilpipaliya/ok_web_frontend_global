import { createStore } from "solid-js/store";

import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import type { Id } from "~/lib/graph/type/id";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";
import type { VertexMap } from "~/lib/graph/type/vertexMap";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { getTextInputWithLabelSchema } from "~/components/fields/getTextInputSchema";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";
import { processImportedGraph } from "~/lib/graph/import/processImportedGraph";

export function createAppState() {
  const graph = createGraph();

  addNewVertex(
    0,
    {
      id: "globalStoreId",
      IN: {},
      L: ["GlobalStore"],
      OUT: {},
      P: {
        activeClickOutside: [],
        initialDataFetchError: "",
        isDevelopment: false,
        newVertexId_: -500000,
        txnId_: 0,
        url: "",
        userRoles: [],
        userSettingId: "",
        tooltipRegistry: {},
        activeTooltips: {},
      } as GlobalProperties,
    },
    graph[0],
    graph[1],
  );

  addNewVertex(
    0,
    {
      id: "vertexOldIdToNewIdMap",
      IN: {},
      L: ["vertexOldIdToNewIdMap"],
      OUT: {},
      P: {},
    },
    graph[0],
    graph[1],
  );

  addNewVertex(
    0,
    {
      id: "edgeOldIdToNewIdMap",
      IN: {},
      L: ["edgeOldIdToNewIdMap"],
      OUT: {},
      P: {},
    },
    graph[0],
    graph[1],
  );

  const schema = getTextInputWithLabelSchema();

  // Import and process the schema into the graph structure
  const importResult = importGraphStructure(schema, graph[0], graph[1]);
  const { metaTxnId, parentId } = processImportedGraph(
    importResult,
    graph[0],
    graph[1],
    "Component", // Parent label
    "SystemTextInput", // Parent key
  );

  return graph;
}

export function createGraph() {
  return createStore<GraphInterface>({
    broadcastChannels: [],
    edges: {} as EdgeMap,
    vertexes: {} as VertexMap,
    vertexLabelIdMap: {} as { [key: string]: Id[] },
  });
}
