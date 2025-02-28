import type { z } from "zod";

import { createSignal, For, onCleanup, Show } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { graphInterfaceSchema } from "~/routes/api/use-object/schema";

import { IconButton } from "~/components/styled/IconButton";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { generateNewVertexId } from "~/lib/graph/transaction/core/generateNewVertexId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import {
  headerIconButtonClass,
  toolBarClass,
} from "~/pages/settings/constants";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { IFramePreview } from "../../layout/IFramePreview";
import {
  insertAtPosition,
  insertComponents,
} from "./functions/insertAtPosition";

export function Preview(props: {
  message: Vertex;
  object: z.infer<typeof graphInterfaceSchema>;
}) {
  const [graph, setGraph] = useGraph();
  const metaTxnId = generateNewTxnId(graph, setGraph);
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  // Store vertex IDs with no parents
  const [rootVertexIds, setRootVertexIds] = createSignal<string[]>([]);
  // Add all vertices with new IDs
  const vertexIdMap = new Map<string, string>();
  for (const vertex of props.object.vertexes || []) {
    const newId = generateNewVertexId(graph, setGraph);
    vertexIdMap.set(vertex.id, newId);
    const newVertex = {
      id: newId,
      IN: {},
      L: Array.isArray(vertex.L) ? vertex.L : [vertex.L],
      OUT: {},
      P: {
        ...vertex.P,
        ...(vertex.P.class && typeof vertex.P.class === "object"
          ? { class: JSON.stringify(vertex.P.class) }
          : {}),
      },
    };

    addNewVertex(metaTxnId, newVertex, graph, setGraph);
  }

  // Add all edges with new IDs
  for (const edge of props.object.edges || []) {
    const newId = generateNewVertexId(graph, setGraph);
    const startId = vertexIdMap.get(edge.S)!;
    const endId = vertexIdMap.get(edge.E)!;

    const newEdge = {
      E: endId,
      id: newId,
      P: {},
      S: startId,
      T: edge.T,
    };

    addNewEdge(metaTxnId, newEdge, graph, setGraph);
  }

  // Find vertices with no parents
  const parentMap = new Map<string, boolean>();

  for (const edge of props.object.edges || []) {
    parentMap.set(vertexIdMap.get(edge.E)!, true);
  }

  const noParentIds = Array.from(vertexIdMap.values()).filter(
    (id) => !parentMap.has(id),
  );
  setRootVertexIds(noParentIds);

  // Create parent vertex and link children
  const parentId = generateNewVertexId(graph, setGraph);
  const parentVertex = {
    id: parentId,
    IN: {},
    L: ["Page"],
    OUT: {},
    P: { key: "Page" },
  };

  addNewVertex(metaTxnId, parentVertex, graph, setGraph);

  // Link parent to root vertices
  // First handle vertices with Label "Attr"
  const attrRootIds = rootVertexIds().filter((id) =>
    graph.vertexes[id].L.includes("Attr"),
  );
  if (attrRootIds.length > 0) {
    setSelectionValue(
      metaTxnId,
      graph.vertexes[parentId],
      graph,
      setGraph,
      { P: { type: "Attr" } } as unknown as Vertex,
      attrRootIds,
    );
  }

  // Then handle remaining vertices grouped by their labels
  const remainingRootIds = rootVertexIds().filter(
    (id) => !graph.vertexes[id].L.includes("Attr"),
  );

  // Group remaining vertices by their first label
  const labelGroups = new Map<string, string[]>();
  for (const id of remainingRootIds) {
    const label = graph.vertexes[id].L[0];
    if (!labelGroups.has(label)) {
      labelGroups.set(label, []);
    }
    labelGroups.get(label)!.push(id);
  }

  // Set selection for each label group
  for (const [label, ids] of labelGroups) {
    setSelectionValue(
      metaTxnId,
      graph.vertexes[parentId],
      graph,
      setGraph,
      { P: { type: label } } as unknown as Vertex,
      ids,
    );
  }

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  const MainPreview = () => {
    const [isPreview, setIsPreview] = createSignal(true);
    const [insertMode, setInsertMode] = createSignal<
      "after" | "before" | "center"
    >("after");

    const handleRefresh = () => {
      setIsPreview(false);
      setTimeout(() => {
        setIsPreview(true);
      }, 100);
    };

    const formId = uuidv7();
    return (
      <Show
        when={
          props.object.vertexes?.length > 0 &&
          (
            (evalExpression("->Attr", {
              graph,
              setGraph,
              vertexes: [graph.vertexes[parentId]],
            }) as Vertex[]) || []
          ).length > 0
        }
      >
        <div class="display:none">
          <PageViewWrapper
            formDataId={parentId}
            hideSaveCancelButton
            isNoPermissionCheck={true}
            pageVertexName="Page"
            uuid={formId}
          />
        </div>

        <Show when={graph.vertexes[formId]}>
          <div class={toolBarClass}>
            <IconButton
              class="bg:transparent hover:bg:neutral-100 p:4 r:4"
              icon="ph:arrows-clockwise"
              onClick={handleRefresh}
            />
          </div>
          <Show when={isPreview()}>
            <IFramePreview formStoreId={formId} noMinHeight />
          </Show>

          <div class="display:flex gap:8px margin-top:12px justify-content:space-between">
            <div class="display:flex gap:8px">
              <select
                class="padding:8px border:1px|solid|base border-radius:6px"
                onChange={(e) => setInsertMode(e.currentTarget.value as any)}
                value={insertMode()}
              >
                <option value="before">Insert Before</option>
                <option value="after">Insert After</option>
                <option value="center">Insert Into</option>
              </select>

              <IconButton
                class={`${headerIconButtonClass} cursor:not-allowed:disabled opacity:.5:disabled`}
                disabled={
                  layoutStoreVertex()?.P.formId === formId ||
                  !layoutStoreVertex()?.P.formId ||
                  !graph.vertexes[
                    graph.vertexes[layoutStoreVertex()?.P.formId!]?.P
                      .selectedId!
                  ]
                }
                icon="ph:plus-circle"
                onClick={() =>
                  insertAtPosition(
                    graph.vertexes[formId],
                    insertMode(),
                    graph,
                    setGraph,
                    layoutStoreVertex,
                  )
                }
                title="Insert"
              />
            </div>
          </div>
        </Show>
      </Show>
    );
  };

  const ComponentPreview = () => {
    const componentVertexes = () =>
      (evalExpression("->Component", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[parentId]],
      }) as Vertex[]) || [];

    return (
      <For each={componentVertexes()}>
        {(componentVertex) => {
          const [isPreview, setIsPreview] = createSignal(true);
          const formId = uuidv7();
          return (
            <div class="margin-bottom:24px">
              <div class="display:none">
                <PageViewWrapper
                  formDataId={componentVertex.id}
                  hideSaveCancelButton
                  isNoPermissionCheck={true}
                  pageVertexName="Component"
                  uuid={formId}
                />
              </div>

              <Show when={graph.vertexes[formId]}>
                <div class={toolBarClass}>
                  <IconButton
                    class="bg:transparent hover:bg:neutral-100 p:4 r:4"
                    icon="ph:arrows-clockwise"
                    onClick={() => {
                      setIsPreview(false);
                      setTimeout(() => setIsPreview(true), 100);
                    }}
                  />
                </div>

                <Show when={isPreview()}>
                  <IFramePreview formStoreId={formId} noMinHeight />
                </Show>

                <div class="display:flex gap:8px margin-top:12px">
                  <IconButton
                    class={headerIconButtonClass}
                    disabled={
                      layoutStoreVertex()?.P.formId === formId ||
                      !layoutStoreVertex()?.P.formId
                    }
                    icon="ph:plus-circle"
                    onClick={() =>
                      insertComponents(
                        [componentVertex],
                        graph,
                        setGraph,
                        layoutStoreVertex,
                      )
                    }
                    title="Insert Component"
                  />
                </div>
              </Show>
            </div>
          );
        }}
      </For>
    );
  };
  return (
    <div>
      <Show
        fallback={
          <div class="text-align:center padding:16px color:gray-600">
            No Preview Available
          </div>
        }
        when={
          props.object.vertexes?.length > 0 &&
          ((
            (evalExpression("->Attr", {
              graph,
              setGraph,
              vertexes: [graph.vertexes[parentId]],
            }) as Vertex[]) || []
          ).length > 0 ||
            (
              (evalExpression("->Component", {
                graph,
                setGraph,
                vertexes: [graph.vertexes[parentId]],
              }) as Vertex[]) || []
            ).length > 0)
        }
      >
        <MainPreview />
        <ComponentPreview />
      </Show>
    </div>
  );
}
// onDelete={(msg) => deleteRow( msg, false,graph,setGraph,formStoreVertex()?.P.txnId!)}
