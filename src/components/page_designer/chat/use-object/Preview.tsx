import type { z } from 'zod';

import { createSignal, onCleanup, Show } from 'solid-js';

import type { graphInterfaceSchema } from '~/routes/api/use-object/schema';

import { IconButton } from '~/components/styled/IconButton';
import { useGraph, type Vertex } from '~/lib/graph/graph';
import { addNewEdge } from '~/lib/graph/mutate/edge';
import { setSelectionValue } from '~/lib/graph/mutate/setSelectionValue';
import { addNewVertex } from '~/lib/graph/mutate/vertex';
import { generateNewTxnId } from '~/lib/graph/transaction/generateNewTxnId';
import { generateNewVertexId } from '~/lib/graph/transaction/generateNewVertexId';
import { revertTransaction } from '~/lib/graph/transaction/revertTransaction';
import { PageViewWrapper } from '~/pages/PageViewWrapper';

import { IFramePreview } from '../../layout/IFramePreview';


export function Preview(props: { formId: string; object: z.infer<typeof graphInterfaceSchema>; }) {
  const [graph, setGraph] = useGraph();
  const metaTxnId = generateNewTxnId(graph, setGraph);
  // Store vertex IDs with no parents
  const [rootVertexIds, setRootVertexIds] = createSignal<string[]>([]);
  const [isPreview, setIsPreview] = createSignal(true);

  const handleRefresh = () => {
    setIsPreview(false);
    setTimeout(() => {
      setIsPreview(true);
    }, 100);
  };

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
        ...(vertex.P.class && typeof vertex.P.class === 'object' ? { class: JSON.stringify(vertex.P.class) } : {})
      }
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
      T: edge.T
    };

    addNewEdge(metaTxnId, newEdge, graph, setGraph);
  }

  // Find vertices with no parents
  const parentMap = new Map<string, boolean>();

  for (const edge of props.object.edges || []) {
    parentMap.set(vertexIdMap.get(edge.E)!, true);
  }

  const noParentIds = Array.from(vertexIdMap.values())
    .filter(id => !parentMap.has(id));
  setRootVertexIds(noParentIds);

  // Create parent vertex and link children
  const parentId = generateNewVertexId(graph, setGraph);
  const parentVertex = {
    id: parentId,
    IN: {},
    L: ['Page'],
    OUT: {},
    P: { key: "Page" }
  };

  addNewVertex(metaTxnId, parentVertex, graph, setGraph);

  // Link parent to root vertices
  // First handle vertices with Label "Attr"
  const attrRootIds = rootVertexIds().filter(id => 
    graph.vertexes[id].L.includes('Attr')
  );
  if (attrRootIds.length > 0) {
    setSelectionValue(
      metaTxnId,
      graph.vertexes[parentId],
      graph,
      setGraph,
      { P: { type: "Attr" } } as unknown as Vertex,
      attrRootIds
    );
  }

  // Then handle remaining vertices grouped by their labels
  const remainingRootIds = rootVertexIds().filter(id => 
    !graph.vertexes[id].L.includes('Attr')
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
      ids
    );
  }

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });

  return <>
    <div class="display:none">
      <PageViewWrapper
        formDataId={parentId}
        hideSaveCancelButton
        isNoPermissionCheck={true}
        pageVertexName="Page"
        uuid={props.formId} />
    </div>

    <Show when={graph.vertexes[props.formId]}>
        <IconButton
          class="bg:transparent hover:bg:neutral-100 p:4 r:4"
          icon="ph:arrows-clockwise"
          onClick={handleRefresh}
        />
        <Show when={isPreview()}>
          <IFramePreview formStoreId={props.formId} noMinHeight />
        </Show>
    </Show>
  </>;
}
