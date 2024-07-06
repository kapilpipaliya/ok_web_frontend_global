import { onCleanup, useContext } from "solid-js";

import type { FieldAttribute } from "~/lib/FormMetadataType";

import { TableInputField } from "~/components/fields/table_input/TableInputField";
import { FormMetaData } from "~/lib/formMetaData";
import { getTreeData } from "~/lib/graph/get/sync/getTreeData";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { useDesignerLayoutStore } from "../../../LayoutContext";

export function RulesModalBody() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();
  let prevTxnIndex = -1;
  prevTxnIndex =
    graph.transactions.get(layoutStore.formData.txnId)?.steps?.length || 0;

  const metaVertexId = graph.newVertexId;
  const txnId = graph.newTxnId;
  const metaAttributes = FormMetaData.Coll.attributes.find(
    (x) => x.name === "Rules"
  );

  addNewVertex(
    txnId,
    newVertex(metaVertexId, ["MetaAttr"], {
      name: metaAttributes?.name,
      ...metaAttributes?.props,
    }),
    graph,
    setGraph
  );
  const attributes: FieldAttribute[] = JSON.parse(
    JSON.stringify((metaAttributes?.attributes)!)
  );

  for (const attribute of attributes) {
    if (attribute.name === "Rule") {
      for (const ruleattribute of attribute.attributes!) {
        if (ruleattribute.name === "cond") {
          for (const condAttribute of ruleattribute.attributes!) {
            if (condAttribute.name === "layout") {
              const data = getTreeData(
                graph,
                setGraph,
                {
                  child: {
                    child: {
                      child: {
                        child: { collection: "->Attr" },
                        collection: "->Attr",
                      },
                      collection: "->Attr",
                    },
                    collection: "->Attr",
                  },
                  collection: "->Attr",
                },
                layoutStore.formData?.formData
                  ? [layoutStore.formData.formData]
                  : [],
                {
                  nameExpr: (v: Vertex) => {
                    const component = getChildVertex(graph, ["$0Comp"], v)
                      .vertex?.P.name;
                    return `${v.P.name || ''}${component ? ` (${component})` : ""}`;
                  },
                }
              );

              condAttribute!.props = {
                dataSource: data,
                displayExpr: "name",
                itemsExpr: "children",
                showClearButton: true,
                treeProps: {
                  dataStructure: "tree",
                  displayExpr: "name",
                  // focusStateEnabled: false,
                  expandNodesRecursive: false,
                  itemsExpr: "children",
                  keyExpr: "id",
                  // width: 200,
                  // searchEnabled: true,
                  // activeStateEnabled: false,
                  selectionMode: "single",
                },
                valueExpr: "id",
              };
            }
          }
        }
      }
    }
  }

  addMetaVertexes(
    graph,
    setGraph,
    txnId,
    graph.vertexes[metaVertexId],
    attributes
  );
  onCleanup(() => {
    revertTransaction(txnId, graph);
  });

  return (
    <TableInputField
      data={graph.vertexes[layoutStore.selectedId]}
      isRealTime={false}
      meta={graph.vertexes[metaVertexId]}
      txnId={layoutStore.formData.txnId} />
  );
}
