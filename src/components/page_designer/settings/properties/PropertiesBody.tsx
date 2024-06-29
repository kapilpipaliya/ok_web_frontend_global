import { createSignal, For, onCleanup, Show, useContext } from "solid-js";
import { Portal } from "solid-js/web";
import { getChildVertex, getChildVertexes, getTreeData } from "~/lib/graph/get/sync/traverse";
import { GenericField } from "~/components/fields/GenericField";
import { ModalContent, ModalFooter, ModalHeader } from "~/components/solid_blocks";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { CollAndData } from "./CollAndData";
import { setPropertyValueGlobal } from "~/lib/drag_drop/setPropertyValueGlobal";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { TableInputField } from "~/components/fields/TableInputField";
import type { FieldAttribute } from "~/lib/FormMetadataType";
import { FormMetaData } from "~/lib/formMetaData";
import { addMetaVertexes } from "~/lib/graph/mutate/form/metaFunction";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getNewGraphId, getNewTxnId, revertTransaction } from "~/lib/graph/transaction";
import JsxParser from "~/lib/jsx_parser/components/JsxParser";
import { FormGroupProperties } from "../FormGroupProperties";
import { useDesignerLayoutStore } from "../../LayoutContext";

export function PropertiesBody(props: any) {
  const [isRulesModalOpen, setIsRulesModalOpen] = createSignal(false);
  const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();
  const setPropertyValue = (meta: Vertex, value: any) => {
   if (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) {
      return setPropertyValueGlobal(
        graph,
        setGraph,
        layoutStore.formData.txnId,
        meta,
        graph.vertexes[layoutStore.selectedId],
        graph.vertexes[layoutStore.selectedComponent],
        value,
      );
    }
    return;
  };
  let prevTxnIndex = -1;
  const { RulesModalBody, ImportModalBody } = ModalBody();
  // Add all necessary signal, function and context logic here

  const selectedComponentProperties = () => {
    const selectedComp = graph.vertexes[layoutStore.selectedComponent];
    if (!selectedComp) return { error: true };
    return getChildVertexes(graph, ["$0Prop"], [selectedComp]);
  };

  const toggleRulesModal = () => setIsRulesModalOpen(prev => !prev);
  const toggleImportsModal = () => setIsImportModalOpen(prev => !prev);

  // Modal Body components and other necessary logic

  return (
    <>
      <Show when={layoutStore.selectedId !== -1}>
        <div class="flex jc:start">
          <button class="mb:5" onClick={toggleRulesModal}>Rules</button>
          &nbsp;&nbsp;
          <button onClick={toggleImportsModal}>Import</button>
        </div>
        <CollAndData />
        <FormGroupProperties
          txnId={layoutStore.formData.txnId}
          metaAttributes={selectedComponentProperties().vertexes ?? []}
          setValue={setPropertyValue}
          selectedLayout={graph.vertexes[layoutStore.selectedId]}
        />
      </Show>
      <Show when={isRulesModalOpen()}>
        <Portal>
          <div role="dialog" tabIndex={-1} class="sb-modal">
            <ModalContent>
              <ModalHeader>
                Header
                <button onclick={toggleRulesModal} style={{ float: "right" }}>
                  ✕
                </button>
              </ModalHeader>
              <ModalBody>
                <RulesModalBody />
              </ModalBody>
              <ModalFooter>
                <div
                  style={{
                    display: "flex",
                    "justify-content": "center",
                    "align-items": "center",
                  }}
                >
                  <button onClick={() => toggleRulesModal()}>Submit</button>
                  <button class="border-color:#FF0000 color:#FF0000" onClick={() => toggleRulesModal()}>Cancel</button>
                </div>
              </ModalFooter>
            </ModalContent>
          </div>
        </Portal>
      </Show>
      <Show when={isImportModalOpen()}>
        <ImportModalBody />
      </Show>
    </>
  );

  function ModalBody() {
    const RulesModalBody = () => {
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
        JSON.stringify(metaAttributes?.attributes!)
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
    };
    const ImportModalBody = () => {
      prevTxnIndex =
        graph.transactions.get(layoutStore.formData.txnId)?.steps?.length || 0;

      const metaVertexId = getNewGraphId();
      const dataVertexId = getNewGraphId();

      setGraph("vertexes", metaVertexId, {
        P: { name: "jsx", width: 700, height: 700 },
      });
      setGraph("vertexes", dataVertexId, { id: dataVertexId, P: {} });

      onCleanup(() => {
        // @ts-ignore
        setGraph("vertexes", metaVertexId, undefined);
        // @ts-ignore
        setGraph("vertexes", dataVertexId, undefined);
      });
      const footerButtons = [
        {
          meta: {
            P: {
              component: "Button",
              children: "Import",
              variant: "soft",

              onClick: () => {
                const jsxParser = new JsxParser({
                  formData: layoutStore.formData.formData,
                  showWarnings: true,
                  txnId: layoutStore.formData.txnId,
                  jsx: graph.vertexes[dataVertexId].P.jsx || "",
                  parent: graph.vertexes[layoutStore.selectedId],
                });
                jsxParser.render(graph, setGraph);
                // reset layout
                // layoutTreeViewInstance.option("items", getLayoutTreeData());
              },
            },
          } as any,
        },
        {
          meta: {
            P: {
              component: "Button",

              children: "Submit",
              onClick: () => {
              },
            },
          } as any,
        },
        {
          meta: {
            P: {
              component: "Button",

              children: "Cancel",
              class: "border-color:#FF0000 color:#FF0000",
              variant: "outlined",
              onClick: () => {
              },
            },
          } as any,
        },
      ];
      return (
        <>
          <Portal>
            <div role="dialog" tabIndex={-1} class="sb-modal r:10|10|10|10">
              <ModalContent class={"min-w:30%"}>
                <ModalHeader>
                  Import HTML
                  <button
                    onclick={toggleImportsModal}
                    style={{ float: "right" }}
                  >
                    ✕
                  </button>
                </ModalHeader>
                <ModalContent class={"mt:1rem"}>
                  <GenericInputField
                    txnId={layoutStore.formData.txnId}
                    title={"Write HTML"}
                    component="TextArea"
                    meta={graph.vertexes[metaVertexId]}
                    data={graph.vertexes[dataVertexId]}
                    setValue={(data: any) => setGraph("vertexes", dataVertexId, "P", { jsx: data })}
                    disabled={false} />
                </ModalContent>
                <ModalFooter>
                  <div
                    style={{
                      display: "flex",

                      "justify-content": "center",
                      "align-items": "center",
                    }}
                  >
                    <For each={footerButtons}>
                      {(item) => <GenericField meta={item.meta} />}
                    </For>
                  </div>
                </ModalFooter>
              </ModalContent>
            </div>
          </Portal>
        </>
      );
    };
    return { RulesModalBody, ImportModalBody };
  }
}
