import { SetStoreFunction } from "solid-js/store";
import { insertNewRow } from "~/components/fields/table_field/insertNewRow";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { PageLayoutObject } from "~/components/page_designer/context/LayoutContext";
import { handleDropAtPosition } from "~/components/page_designer/functions/handleDropAtPosition";
import { evalExpression } from "~/lib/expression_eval";
import { Vertex, GraphInterface } from "~/lib/graph/graph";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";
import { openInNewInternalTab } from "~/components/page_designer/form_elements/pages/openInNewInternalTab";

export function insertAtPosition(message: Vertex, insertMode: string, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, layoutStoreVertex: () => Vertex<PageLayoutObject>) {
  const fromStoreVertex = graph.vertexes[`${message.id}FormStore`];
  if (!fromStoreVertex || layoutStoreVertex()?.P.formId === `${message.id}FormStore` || !layoutStoreVertex()?.P.formId) {
    return;
  }

  const toStoreVertex = graph.vertexes[layoutStoreVertex().P.formId!] as Vertex<FormStoreObject>;
  if (!toStoreVertex || !graph.vertexes[toStoreVertex.P.selectedId!]) {
    return;
  }

  const formDataVertex = graph.vertexes[fromStoreVertex.P.formDataId!];
  const newTxnId = toStoreVertex.P.txnId // generateNewTxnId(graph, setGraph);

  // Check for Component and insert if exists
  const componentVertexes = evalExpression("->Component", { graph, setGraph, vertexes: [formDataVertex] }) as Vertex[] || [];
  
  for (const componentVertex of componentVertexes) {
    // Insert Component
    const componentId = generateNewVertexId(graph, setGraph);
    const componentResult = addNewVertex(
      newTxnId,
      {
        id: componentId,
        L: ["Component"],
        IN: {},
        OUT: {},
        P: { ...componentVertex.P }
      },
      graph,
      setGraph
    );

    if (componentResult.error) continue;

    // Check for ComponentVariant
    const variantVertexes = evalExpression("->ComponentVariant", { graph, setGraph, vertexes: [componentVertex] }) as Vertex[] || [];

    for (const variantVertex of variantVertexes) {
      // Insert ComponentVariant
      const variantRow = insertNewRow(
        newTxnId,
        { P: { type: "ComponentVariant" } } as unknown as Vertex,
        graph.vertexes[componentId],
        false,
        graph,
        setGraph,
        variantVertex.P
      );

      // Check for ComponentVariantOptions
      const optionsVertexes = evalExpression("->ComponentVariantOption", { graph, setGraph, vertexes: [variantVertex] }) as Vertex[] || [];

      for (const optionsVertex of optionsVertexes) {
        // Insert ComponentVariantOptions
        const optionsRow = insertNewRow(
          newTxnId,
          { P: { type: "ComponentVariantOption" } } as unknown as Vertex,
          graph.vertexes[variantRow!.vertexId!],
          false,
          graph,
          setGraph,
          optionsVertex.P
        );
      }
    }

    const fromVertex1 = { ...componentVertex, P: {...componentVertex.P, componentName: "Fragment"}, L: ["Attr"] } as Vertex;
    handleDropAtPosition(
      graph,
      setGraph,
      toStoreVertex.P.txnId,
      graph.vertexes[componentId],
      fromVertex1,
      graph.vertexes[componentId],
      "center"
    );

   openInNewInternalTab(layoutStoreVertex().id, { ...graph.vertexes[componentId], P: {parentId: fromStoreVertex.P.formDataId, formDataId: componentId, ...graph.vertexes[componentId].P} } as Vertex, graph, setGraph);
  }

  handleDropAtPosition(
    graph,
    setGraph,
    toStoreVertex.P.txnId,
    graph.vertexes[toStoreVertex.P.formDataId!],
    formDataVertex,
    graph.vertexes[toStoreVertex.P.selectedId!],
    insertMode
  );
}
