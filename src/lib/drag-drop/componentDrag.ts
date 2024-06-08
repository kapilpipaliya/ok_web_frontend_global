import { GraphInterface, type Id, IdAttr, Vertex } from "~/lib/graph/graph";
import type { SetStoreFunction, Store } from "solid-js/store";
import { useToast } from "~/components/custom/Toast";
import { newVertex } from "~/lib/graph/mutate/vertex";
import { getNewGraphId } from "~/lib/graph/transaction";
import { addNewRow, cloneRowProps } from "~/lib/graph/mutate/form_functions";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import {
  getChildVertex,
  getChildVertexes,
  getSelectionOptions,
} from "~/lib/graph/get/sync/traverse";
import { getStringComponent } from "~/lib/graph/get/sync/graph_functions";
import { getChildrenAttrs } from "~/lib/drag-drop/getChildrenAttrs";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

// @Note:
// From Component To Layout drag:
// 1. Create a Row to proper parent.
// 2. Sort properly
export function componentDrag(
  txnId: number,
  fromVertex: Vertex,
  toParentVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  toIndex?: number,
) {
  const { showErrorToast } = useToast();

  if (!fromVertex) return -1;

  const attrMetaVertex = createAttrMetaVertex();
  const attrCompMetaVertex = createAttrCompMetaVertex();

  if (fromVertex.L[0] === "Page") {
    return (
      processChildren(
        fromVertex,
        toParentVertex,
        txnId,
        graph,
        setGraph,
        attrMetaVertex,
        attrCompMetaVertex,
      )[0] ?? -1
    );
  }

  const rowResult = addNewRow(
    txnId,
    attrMetaVertex,
    graph,
    setGraph,
    toParentVertex,
    toIndex ? { pos: toIndex } : {},
    false,
    {} as any,
  );
  const rowVertex = graph.vertexes[rowResult.vertexId!];

  if (["Comp", "Coll"].includes(fromVertex.L[0])) {
    handleCompOrCollVertex(
      fromVertex,
      txnId,
      rowVertex,
      graph,
      setGraph,
      attrCompMetaVertex,
      showErrorToast,
    );
  } else if (fromVertex.L[0] === "Attr") {
    handleAttrVertex(
      fromVertex,
      rowVertex,
      txnId,
      graph,
      setGraph,
      attrMetaVertex,
      attrCompMetaVertex,
    );
  }

  return rowResult.vertexId!;
}

function handleCompOrCollVertex(
  fromVertex: Vertex,
  txnId: number,
  rowVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  attrCompMetaVertex: Vertex,
  showErrorToast: (message: string) => void,
) {
  if (fromVertex.L[0] === "Comp") {
    // set Component to the row
    setSelectionValue(
      txnId,
      rowVertex,
      graph,
      setGraph,
      attrCompMetaVertex,
      fromVertex.id,
    );
    addPropsToLayoutRow(graph, txnId, rowVertex.id, fromVertex);
  } else if (fromVertex.L[0] === "Coll") {
    // set Collection to the row
    const attrCollMetaVertex = createAttrCollMetaVertex();
    setSelectionValue(
      txnId,
      rowVertex,
      graph,
      setGraph,
      attrCollMetaVertex,
      fromVertex.id,
    );
    const formVertex = findVertexByLabelAndUniqueId(
      graph,
      "Comp",
      IdAttr,
      "Form",
    );
    if (!formVertex) {
      showErrorToast("Can't find form");
    } else {
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrCompMetaVertex,
        formVertex.id,
      );
      addPropsToLayoutRow(graph, txnId, rowVertex.id, formVertex);
    }
  }
}

function handleAttrVertex(
  fromVertex: Vertex,
  rowVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  attrMetaVertex: Vertex,
  attrCompMetaVertex: Vertex,
) {
  const compVertex = getComponentFromLayoutRow(fromVertex.id, graph, setGraph);
  setSelectionValue(
    txnId,
    rowVertex,
    graph,
    setGraph,
    attrCompMetaVertex,
    compVertex.id,
  );
  cloneRowProps(graph, setGraph, txnId, fromVertex, rowVertex);
  processChildren(
    fromVertex,
    rowVertex,
    txnId,
    graph,
    setGraph,
    attrMetaVertex,
    attrCompMetaVertex,
  );
}

function processChildren(
  fromVertex: Vertex,
  toVertex: Vertex,
  txnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  attrMetaVertex: Vertex,
  attrCompMetaVertex: Vertex,
) {
  const childrenVertexes = getChildrenAttrs(graph, setGraph, fromVertex);
  const results = [];
  for (const child of childrenVertexes) {
    const rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      toVertex,
      { pos: child.P.pos },
      false,
      {} as any,
    );
    const rowVertex = graph.vertexes[rowResult.vertexId!];
    const compVertex = getComponentFromLayoutRow(child.id, graph, setGraph);
    setSelectionValue(
      txnId,
      rowVertex,
      graph,
      setGraph,
      attrCompMetaVertex,
      compVertex.id,
    );
    cloneRowProps(graph, setGraph, txnId, child, rowVertex);
    processChildren(
      child,
      rowVertex,
      txnId,
      graph,
      setGraph,
      attrMetaVertex,
      attrCompMetaVertex,
    );
    results.push(rowResult.vertexId!);
  }
  return results;
}

function createAttrMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    name: "Attr",
    component: "Table",
    tab: "Attribute",
    props: {
      type: "Attr",
      label: "Attr",
    },
  });
}

function createAttrCompMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    name: "Comp",
    component: "SelectBox",
    props: {
      collection: "g:'Comp'",
    },
  });
}

function createAttrCollMetaVertex() {
  return newVertex(getNewGraphId(), [], {
    name: "coll",
    displayName: "Collection",
    component: "SelectBox",
    props: {
      collection: "g:'Coll'",
      parentLabel: "Coll",
    },
  });
}

function addPropsToLayoutRow(
  graph: Store<GraphInterface>,
  txnId: number,
  layoutRowId: Id,
  componentVertex: Vertex,
) {
  const propVertexes = getChildVertexes(graph, ["$0Prop"], [componentVertex]);
  if (propVertexes.vertexes) {
    const initialValues = propVertexes.vertexes.reduce(
      (acc, curr) => {
        if (typeof curr.P.value === "boolean") {
          acc[curr.P.key] = curr.P.value;
        } else if (curr.P.value) {
          acc[curr.P.key] = curr.P.value;
        }
        return acc;
      },
      {} as { [key: string]: any },
    );
    // TODO: This has no effect so commenting it.
    // replaceVertexProperties(txnId, layoutRowId, initialValues);
  }
}

export const getComponentFromLayoutRow = (
  layoutRowId: string | number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
) => {
  // There must be a component found.
  const currentVertex = graph.vertexes[layoutRowId];
  const compVertex =
    getSelectionOptions(
      graph,
      setGraph,
      [currentVertex],
      "->$0Comp||->$0Att->$0Comp||->$0Att->$0DataType->$0Default",
    ).vertexes || [];
  if (compVertex[0]) {
    return compVertex[0];
  }
  const collVertex = getChildVertex(graph, ["$0Coll"], currentVertex);
  if (collVertex.vertex?.P.name === "Form") {
    return findVertexByLabelAndUniqueId(graph, "Comp", IdAttr, "Form");
  }

  return getStringComponent(graph);
};
