import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { useParams, useSearchParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { type IDBPDatabase, openDB } from "idb";
import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import { v7 as uuidv7 } from "uuid";

import { ZIndex } from "~/components/fields/ZIndex";
import {
  DesignerLayoutStoreContext,
  getInitialDesignerLayoutStore,
  type PageLayoutObject,
} from "~/features/page_designer/context/LayoutContext";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getTitle } from "~/lib/graph/get/sync/theme/getTitle";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { Title } from "@solidjs/meta";
import { updateUrlWithOpenedTabs } from "~/features/page_designer/utils/updateUrlWithTabs";
import { LandscapeOrientationPrompt } from "./LandscapeOrientationPrompt";

const RenderMainContent = clientOnly(() => import("./RenderMainContent"));

export function PageDesignerWrapper(): JSX.Element {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const initialStore = getInitialDesignerLayoutStore();
  const [graph, setGraph] = useGraph();
  const [isDataReady, setIsDataReady] = createSignal(false);

  let dbPromise: Promise<IDBPDatabase<unknown>> | undefined;
  if (!isServer) {
    dbPromise = openDB("keyval-store", 1, {
      upgrade(db) {
        db.createObjectStore("keyval");
      },
    });
  }

  const formId = uuidv7();

  // Get tabs from query parameter (format: entity:key,entity:key) or use params
  const tabsFromQuery = searchParams.tabs;
  interface TabInfo {
    entity: string;
    key: string;
  }
  let tabsToLoad: TabInfo[] = [];

  if (tabsFromQuery) {
    // Parse query parameter tabs
    const tabsArray = Array.isArray(tabsFromQuery)
      ? tabsFromQuery
      : tabsFromQuery.split(",");

    for (const tab of tabsArray) {
      if (!tab) continue;
      const [entity, key] = tab.split(":");
      if (entity && key) {
        tabsToLoad.push({ entity, key });
      }
    }
  } else if (params.id && params.entity) {
    // Fall back to path parameter
    tabsToLoad = [{ entity: params.entity, key: params.id }];
  }

  // Ensure params is included if it exists and not already in the list
  if (params.id && params.entity) {
    const currentTab = `${params.entity}:${params.id}`;
    const exists = tabsToLoad.some(
      (t) => `${t.entity}:${t.key}` === currentTab,
    );
    if (!exists) {
      tabsToLoad.unshift({ entity: params.entity, key: params.id });
    }
  }

  // Initialize with first tab, will be updated if we need to fetch from DB
  const firstTab = tabsToLoad[0] || {
    entity: params.entity || "",
    key: params.id || "",
  };
  const newOpenVertex = newVertex(uuidv7(), ["OpenForm"], {
    dataId: firstTab.key,
    formId,
    label: firstTab.entity,
    mainPanel: initialStore.mainPanel[0],
  });
  addNewVertex(0, newOpenVertex, graph, setGraph);

  const vertex = newVertex<PageLayoutObject>(
    initialStore.id,
    ["PageDesigner"],
    {
      ...initialStore,
      [`mainPanel${initialStore.mainPanel[0]}Tab`]: formId,
      focusedFormId: formId,
      mainFormId: formId,
      openedFormIds: [newOpenVertex.id],
    },
  );
  addNewVertex(0, vertex, graph, setGraph);

  onCleanup(() => {
    for (const vertexId of graph.vertexes[initialStore.id].P.openedFormIds) {
      deleteVertex(0, vertexId, graph, setGraph);
    }
    deleteVertex(0, initialStore.id, graph, setGraph);
  });

  const handleResize = () => {
    const isSmallScreen = window.innerWidth < 840;
    mergeVertexProperties<PageLayoutObject>(
      0,
      initialStore.id,
      graph,
      setGraph,
      {
        isSmallScreen,
      },
    );
  };

  const debouncedHandleResize = debounce(handleResize, 200);

  onMount(async () => {
    if (isServer) {
      setIsDataReady(true);
      return;
    }
    const openedFormIds: string[] = [newOpenVertex.id];
    const activeFormId = formId;

    // Group tabs by entity and separate keys from IDs
    const entityGroups = new Map<
      string,
      { keys: string[]; ids: Array<{ key: string; index: number }> }
    >();

    tabsToLoad.forEach((tab, index) => {
      if (!entityGroups.has(tab.entity)) {
        entityGroups.set(tab.entity, { keys: [], ids: [] });
      }
      const group = entityGroups.get(tab.entity)!;

      // Check if it's a key (no '-') or an ID (with '-')
      if (tab.key && !tab.key.includes("-")) {
        group.keys.push(tab.key);
      } else {
        group.ids.push({ key: tab.key, index });
      }
    });

    // Fetch keys for each entity separately
    const idMap = new Map<string, string>(); // Map entity:key -> id

    for (const [entity, group] of entityGroups.entries()) {
      if (group.keys.length > 0) {
        try {
          const data = await fetchDataFromDB(
            {
              expression: `g:'${entity}[$keyFilter]'`,
            },
            {
              nodes: {},
              relationships: {},
              $keyFilter: { filter: { key: { $in: group.keys } } },
            },
          );

          if (
            isValidResponse(data) &&
            data.result &&
            Array.isArray(data.result)
          ) {
            // Map fetched vertices: entity:key -> id
            for (const vertex of data.result as Vertex[]) {
              if (vertex?.P?.key && vertex?.id) {
                idMap.set(`${entity}:${vertex.P.key}`, vertex.id);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching vertices for entity ${entity}:`, error);
        }
      }
    }

    // Process all tabs and create/update OpenForm vertices
    for (let i = 0; i < tabsToLoad.length; i++) {
      const tab = tabsToLoad[i];
      if (!(tab.entity && tab.key)) continue;

      // Get actual ID: if it's a key, use the mapped ID, otherwise use the key directly
      const mapKey = `${tab.entity}:${tab.key}`;
      const actualId = tab.key.includes("-")
        ? tab.key
        : idMap.get(mapKey) || tab.key;

      if (i === 0) {
        // Update the first OpenForm vertex with the actual ID and entity
        mergeVertexProperties(0, newOpenVertex.id, graph, setGraph, {
          dataId: actualId,
          label: tab.entity,
        });
      } else {
        // Create additional OpenForm vertices for other tabs
        const additionalFormId = uuidv7();
        const additionalOpenVertex = newVertex(uuidv7(), ["OpenForm"], {
          dataId: actualId,
          formId: additionalFormId,
          label: tab.entity,
          mainPanel: initialStore.mainPanel[0],
        });
        addNewVertex(0, additionalOpenVertex, graph, setGraph);
        openedFormIds.push(additionalOpenVertex.id);
      }
    }

    // Always update the layout store with all opened form IDs
    // Ensure we have all the OpenForm vertices in the graph before updating
    mergeVertexProperties<PageLayoutObject>(
      0,
      initialStore.id,
      graph,
      setGraph,
      {
        openedFormIds,
        [`mainPanel${initialStore.mainPanel[0]}Tab`]: activeFormId,
        focusedFormId: activeFormId,
      },
    );

    // Log for debugging - can be removed later
    if (openedFormIds.length > 1) {
      console.log("Loaded tabs:", openedFormIds.length, openedFormIds);
    }

    if (dbPromise) {
      // Get stored layout properties
      const db = await dbPromise;
      const storedLayout = await db.get("keyval", "page_designer_layout");
      if (storedLayout) {
        mergeVertexProperties<PageLayoutObject>(
          0,
          initialStore.id,
          graph,
          setGraph,
          storedLayout,
        );
      }
    }

    handleResize(); // Initial check
    makeEventListener(window, "resize", debouncedHandleResize);

    // Mark data as ready after all async operations complete
    setIsDataReady(true);
    // fetchCompExamples();
  });

  // Save layout properties on change
  createEffect(() => {
    if (isServer) {
      return;
    }

    const layoutVertex = graph.vertexes[
      initialStore.id
    ] as Vertex<PageLayoutObject>;
    if (!(layoutVertex && dbPromise)) {
      return;
    }

    const widthProps = {
      isComponentsOpen: layoutVertex.P.isComponentsOpen,
      isPagesOpen: layoutVertex.P.isPagesOpen,
      isFunctionsOpen: layoutVertex.P.isFunctionsOpen,
      isAiOpen: layoutVertex.P.isAiOpen,
      isLayoutTreeOpen: layoutVertex.P.isLayoutTreeOpen,
      isPropertiesOpen: layoutVertex.P.isPropertiesOpen,
      isSettingsOpen: layoutVertex.P.isSettingsOpen,
      componentsWidth: layoutVertex.P.componentsWidth,
      pagesWidth: layoutVertex.P.pagesWidth,
      functionsWidth: layoutVertex.P.functionsWidth,
      aiWidth: layoutVertex.P.aiWidth,
      settingsWidth: layoutVertex.P.settingsWidth,
      // Note: this does not work because we use uuidv7 for the mainPanel ids
      ...layoutVertex.P.mainPanel.reduce(
        (acc, panel) => ({
          ...acc,
          [`mainPanel${panel}Width`]: layoutVertex.P[`mainPanel${panel}Width`],
        }),
        {},
      ),
    };

    (async () => {
      if (!isServer && dbPromise) {
        const db = await dbPromise;
        await db.put("keyval", widthProps, "page_designer_layout");
      }
    })();
  });

  createEffect(() => {
    if (isServer || !isDataReady()) {
      return;
    }

    const layoutVertex = graph.vertexes[initialStore.id] as
      | Vertex<PageLayoutObject>
      | undefined;
    if (!layoutVertex) {
      return;
    }

    // Keep URL in sync when tabs are opened, closed, or moved between panels.
    layoutVertex.P.openedFormIds.length;
    for (const openedFormId of layoutVertex.P.openedFormIds) {
      graph.vertexes[openedFormId]?.P.mainPanel;
      graph.vertexes[openedFormId]?.P.label;
      graph.vertexes[openedFormId]?.P.dataId;
      const formId = graph.vertexes[openedFormId]?.P.formId;
      if (formId) {
        graph.vertexes[formId]?.P.formDataId;
      }
    }

    updateUrlWithOpenedTabs(initialStore.id, graph);
  });

  // Now we are not have comp examples
  // const fetchCompExamples = async () => {
  //   // setGridState("isLoading", true);
  //   const data = await getTableData(
  //     graph,
  //     FormMetaData.CompExample,
  //     "CompExample",
  //     undefined,
  //     undefined,
  //     false,
  //   );
  //   if (isValidResponse(data)) {
  //     setGraphData(graph, setGraph, data.graph!);
  //   } else {
  //     console.error("error", getErrorMessage(data));
  //   }
  // };

  // const layoutStore = () =>
  //   graph.vertexes[initialStore.id].P as PageLayoutObject;

  return (
    <ZIndex>
      <DesignerLayoutStoreContext.Provider value={initialStore.id}>
        <Title>{getTitle(`${params.entity} Builder`, graph)}</Title>
        <Show when={isDataReady()} fallback={<div>Loading...</div>}>
          <LandscapeOrientationPrompt />
          <RenderMainContent />
        </Show>
      </DesignerLayoutStoreContext.Provider>
    </ZIndex>
  );
}
