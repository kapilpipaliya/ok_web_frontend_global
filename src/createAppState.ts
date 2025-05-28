import { createStore } from "solid-js/store";

import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import type { Id } from "~/lib/graph/type/id";
import type { EdgeMap } from "~/lib/graph/type/edgeMap";
import type { VertexMap } from "~/lib/graph/type/vertexMap";
import type { GlobalProperties } from "~/lib/graph/context/GlobalProperties";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";
import { processImportedGraph } from "~/lib/graph/import/processImportedGraph";
import { componentSchemas } from "~/components/fields/components";
import { loadWebsiteSchemas } from "~/page_schema/loader";

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
  // Loop through all component schemas and process them into the graph
  for (const [key, schema] of Object.entries(componentSchemas)) {
    // Import and process each schema into the graph structure
    const importResult = importGraphStructure(schema, graph[0], graph[1]);
    processImportedGraph(
      importResult,
      graph[0],
      graph[1],
      "Component", // Parent label
      key, // Use the schema key as the parent key
    );
  }

  // Load website schemas (components and pages organized by website)
  const websiteSchemas = loadWebsiteSchemas();

  // Process components from all websites
  for (const [websiteName, schemas] of Object.entries(websiteSchemas)) {
    if (schemas.components) {
      for (const [componentKey, schema] of Object.entries(schemas.components)) {
        const importResult = importGraphStructure(schema, graph[0], graph[1]);
        processImportedGraph(
          importResult,
          graph[0],
          graph[1],
          "Component", // Parent label
          componentKey, // Use component key without prefix
        );
      }
    }

    // Process pages from all websites
    if (schemas.pages) {
      for (const [pageKey, schema] of Object.entries(schemas.pages)) {
        const importResult = importGraphStructure(schema, graph[0], graph[1]);
        processImportedGraph(
          importResult,
          graph[0],
          graph[1],
          "Page", // Parent label for pages
          pageKey, // Use page key without prefix
        );
      }
    }
  }

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
