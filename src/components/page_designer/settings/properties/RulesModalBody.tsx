import { onCleanup, useContext } from "solid-js";
import { getChildVertex, getTreeData } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { TableInputField } from "~/components/fields/TableInputField";
import type { FieldAttribute } from "~/lib/FormMetadataType";
import { FormMetaData } from "~/lib/formMetaData";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getNewGraphId, getNewTxnId, revertTransaction } from "~/lib/graph/transaction";
import { useDesignerLayoutStore } from "../../LayoutContext";

export function RulesModalBody() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();
  let prevTxnIndex = -1;
  prevTxnIndex =
    graph.transactions.get(layoutStore.formData.txnId)?.steps?.length || 0;

  const metaVertexId = getNewGraphId();
  const txnId = getNewTxnId(graph, setGraph);
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
                  collection: "->Attr",
                  child: {
                    collection: "->Attr",
                    child: {
                      collection: "->Attr",
                      child: {
                        collection: "->Attr",
                        child: { collection: "->Attr" },
                      },
                    },
                  },
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
                valueExpr: "id",
                displayExpr: "name",
                itemsExpr: "children",
                showClearButton: true,
                treeProps: {
                  dataStructure: "tree",
                  keyExpr: "id",
                  displayExpr: "name",
                  itemsExpr: "children",
                  selectionMode: "single",
                  // width: 200,
                  // searchEnabled: true,
                  // activeStateEnabled: false,
                  // focusStateEnabled: false,
                  expandNodesRecursive: false,
                },
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
      meta={graph.vertexes[metaVertexId]}
      data={graph.vertexes[layoutStore.selectedId]}
      txnId={layoutStore.formData.txnId}
      isRealTime={false} />
  );
}
