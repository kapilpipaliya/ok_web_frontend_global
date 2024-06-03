import {GraphInterface, type Id, IdAttr, Vertex} from "~/lib/graph/graph";
import type {SetStoreFunction, Store} from "solid-js/store";
import {useToast} from "~/components/custom/Toast";
import {newVertex} from "~/lib/graph/mutate/vertex";
import {getNewGraphId} from "~/lib/graph/transaction";
import {addNewRow, cloneRowProps} from "~/lib/graph/mutate/form_functions";
import {setSelectionValue} from "~/components/dynamic/fields/static/SelectionUtils";
import {findVertexByLabelAndUniqueId} from "~/lib/graph/get/sync/findVertex";
import {getChildVertex, getChildVertexes, getSelectionOptions} from "~/lib/graph/get/sync/traverse";
import {getStringComponent} from "~/lib/graph/get/sync/graph_functions";
import {getChildrenAttrs} from "~/lib/drag-drop/getChildrenAttrs";

// @Note:
// From Component To Layout drag:
// 1. Create a Row to proper parent.
// 2. Sort properly
export function componentDrag(
  txnId: number,
  fromVertex: Vertex,
  parentVertex: Vertex,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  toIndex?: number,
) {
  const {showErrorToast} = useToast();

  // handle (toNode === null) case.
  if (fromVertex) {
    const attrMetaVertex = newVertex(getNewGraphId(), [], {
      name: "Attr",
      component: "Table",
      tab: "Attribute",
      props: {
        type: "Attr",
        label: "Attr",
      },
    });
    const attrCompMetaVertex = newVertex(getNewGraphId(), [], {
      name: "Comp",
      component: "SelectBox",
      props: {
        collection: "g:'Comp'",
      },
    });

    if (fromVertex.L[0] === "Page") {
      function processChildren(fromVertex: Vertex, toVertex: Vertex) {
        const childrenVertexes = getChildrenAttrs(graph, setGraph, fromVertex);
        const results = [];
        for (const child of childrenVertexes) {
          const rowResult2 = addNewRow(
            txnId,
            attrMetaVertex,
            graph,
            setGraph,
            toVertex,
            {pos: child.P.pos},
            false,
            {} as any,
          );
          const rowVertex2 = graph.vertexes[rowResult2.vertexId!];

          const compVertex = getComponentFromLayoutRow(
            child.id,
            graph,
            setGraph,
          );
          // set Component to the row
          setSelectionValue(
            txnId,
            rowVertex2,
            graph,
            setGraph,
            attrCompMetaVertex,
            compVertex.id,
          );
          cloneRowProps(graph, setGraph, txnId, child, rowVertex2);
          processChildren(child, rowVertex2);
          results.push(rowResult2.vertexId!);
        }
        return results;
      }

      return processChildren(fromVertex, parentVertex)[0] ?? -1;
    }

    const rowResult = addNewRow(
      txnId,
      attrMetaVertex,
      graph,
      setGraph,
      parentVertex,
      toIndex ? {pos: toIndex} : {},
      false,
      {} as any,
    );
    const rowVertex = graph.vertexes[rowResult.vertexId!];

    if (fromVertex.L[0] === "Comp" || fromVertex.L[0] === "Coll") {
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
        const attrCollMetaVertex = newVertex(getNewGraphId(), [], {
          name: "coll",
          displayName: "Collection",
          component: "SelectBox",
          props: {
            collection: "g:'Coll'",
            parentLabel: "Coll",
          },
        });
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
          showErrorToast("cant find form");
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
    } else if (fromVertex.L[0] === "Attr") {
      const compVertex = getComponentFromLayoutRow(
        fromVertex.id,
        graph,
        setGraph,
      );
      // set Component to the row
      setSelectionValue(
        txnId,
        rowVertex,
        graph,
        setGraph,
        attrCompMetaVertex,
        compVertex.id,
      );
      cloneRowProps(graph, setGraph, txnId, fromVertex, rowVertex);

      function processChildren(fromVertex: Vertex, toVertex: Vertex) {
        const childrenVertexes = getChildrenAttrs(graph, setGraph, fromVertex);
        for (const child of childrenVertexes) {
          const rowResult2 = addNewRow(
            txnId,
            attrMetaVertex,
            graph,
            setGraph,
            toVertex,
            {pos: child.P.pos},
            false,
            {} as any,
          );
          const rowVertex2 = graph.vertexes[rowResult2.vertexId!];

          const compVertex = getComponentFromLayoutRow(
            child.id,
            graph,
            setGraph,
          );
          // set Component to the row
          setSelectionValue(
            txnId,
            rowVertex2,
            graph,
            setGraph,
            attrCompMetaVertex,
            compVertex.id,
          );
          cloneRowProps(graph, setGraph, txnId, child, rowVertex2);
          processChildren(child, rowVertex2);
        }
      }

      processChildren(fromVertex, rowVertex);
    }

    return rowResult.vertexId!;
  }
  return -1;
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