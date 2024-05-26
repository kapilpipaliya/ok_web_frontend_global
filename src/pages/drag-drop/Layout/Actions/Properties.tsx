import { Icon } from "@iconify-icon/solid";
import { useContext, createSignal, For, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { GenericInputField } from "~/components/dynamic/fields/input/GenaricInputField";
import { SelectInputField } from "~/components/dynamic/fields/input/SelectInputField";
import { TableInputField } from "~/components/dynamic/fields/input/TableInputField";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from "~/components/solid-blocks/blocks";
import { FieldAttribute } from "~/lib/Type";
import { AttrsTableData } from "~/lib/Utils";
import {
  PageConfigContext,
  SelectedIdContext,
  SelectedComponentContext,
  PropertiesVertexIdContext,
} from "~/lib/contexts";
import {
  getChildVertex,
  getChildVertexes,
} from "~/lib/graph/get/sync/traverse";
import { addMetaVertexes } from "~/lib/graph/mutate/form_functions";
import { GraphContext, IdAttr, Vertex } from "~/lib/graph/graph";
import {
  revertTransactionUpTo,
  transactions,
  getNewGraphId,
  getNewTxnId,
  revertTransaction,
} from "~/lib/graph/transaction";
import JsxParser from "~/lib/jsx_parser/source/components/JsxParser";
import { setPropertyValueGlobal, useDragDrop } from "~/lib/pageStore";
import { FormGroupProperties } from "~/pages/form/FormsAdmin";
import { useExpansion } from "../CommonCompUtils";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { getTreeData } from "~/lib/graph/get/sync/traverse";

export function Properties(props: {}) {
  const [isPropertiesOpen, toggleIsPropertiesOpen] = useExpansion(true);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const propertiesVertexId = useContext(PropertiesVertexIdContext);
  const [selectedComponent, setSelectedComponent] = useContext(
    SelectedComponentContext,
  );
  const [isPropertiesExpanded, togglePropertiesExpansion] = useExpansion();

  const { deleteLayout } = useDragDrop(
    graph,
    setGraph,
    pageConfig.formData.txnId,
    pageConfig.formData.formData,
    pageConfig.formData.formData,
  );

  const PropertiesPart = () => {
    const [isRulesModalOpen, setIsRulesModalOpen] = createSignal(false);
    const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);

    if (!graph.vertexes[propertiesVertexId]) {
      const addNewVertexResult = addNewVertex(
        0,
        newVertex(propertiesVertexId, ["PropsJson"], { sample: true }),
        graph,
        setGraph,
      );
      if (addNewVertexResult.error) {
        console.warn("error while inserting");
      }
    }

    const setPropertyValue = (meta: Vertex, value: any) => {
      if (selectedId() !== -1 && selectedComponent().vertexId !== -1) {
        return setPropertyValueGlobal(
          graph,
          setGraph,
          pageConfig.formData.txnId,
          meta,
          graph.vertexes[selectedId()],
          graph.vertexes[selectedComponent().vertexId],
          value,
        );
      }
      return;
    };
    const selectedComponentProperties = () => {
      const selectedComp = graph.vertexes[selectedComponent().vertexId];

      if (!selectedComp) {
        return { error: true };
      }

      return getChildVertexes(graph, ["$0Prop"], [selectedComp]);
    };

    const toggleRulesModal = () => setIsRulesModalOpen((prev) => !prev);
    const toggleImportsModal = () => setIsImportModalOpen((prev) => !prev);
    let prevTxnIndex = -1;
    const onRulesSubmit = () => {
      // hack to refresh the select fields. no option is refereshing the label.
      setGraph("vertexes", selectedId(), "OUT", "Rules", (v) =>
        v ? [...v] : v,
      );
      toggleRulesModal();
    };
    const onRulesCancel = () => {
      if (prevTxnIndex !== -1)
        revertTransactionUpTo(pageConfig.formData.txnId, prevTxnIndex);
      toggleRulesModal();
    };
    const onImportsSubmit = () => {
      // reset layout
      // layoutTreeViewInstance.option("items", getLayoutTreeData());
      // hack to refresh the select fields. no option is refereshing the label.
      setGraph("vertexes", selectedId(), "OUT", "Rules", (v) =>
        v ? [...v] : v,
      );
      toggleImportsModal();
    };
    const onImportsCancel = () => {
      if (prevTxnIndex !== -1)
        revertTransactionUpTo(pageConfig.formData.txnId, prevTxnIndex);
      // reset layout
      // layoutTreeViewInstance.option("items", getLayoutTreeData());
      toggleImportsModal();
    };

    const RulesModalBody = () => {
      prevTxnIndex =
        transactions.get(pageConfig.formData.txnId)?.steps?.length || 0;

      const metaVertexId = getNewGraphId();
      const txnId = getNewTxnId(graph, setGraph);
      const metaAttributes = AttrsTableData.Coll.attributes.find(
        (x) => x.name === "Rules",
      );

      addNewVertex(
        txnId,
        newVertex(metaVertexId, ["MetaAttr"], {
          name: metaAttributes?.name,
          props: metaAttributes?.props,
        }),
        graph,
        setGraph,
      );
      const attributes: FieldAttribute[] = JSON.parse(
        JSON.stringify(metaAttributes!.attributes!),
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
                    pageConfig.formData?.formData
                      ? [pageConfig.formData.formData]
                      : [],
                    {
                      nameExpr: (v: Vertex) => {
                        const component = getChildVertex(graph, ["$0Comp"], v)
                          .vertex?.P.name;
                        return `${v.P.name}${component ? ` (${component})` : ""}`;
                      },
                    },
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
        attributes,
      );
      onCleanup(() => {
        revertTransaction(txnId);
      });

      return (
        <TableInputField
          meta={graph.vertexes[metaVertexId]}
          data={graph.vertexes[selectedId()!]}
          txnId={pageConfig.formData.txnId}
          isRealTime={false}
        />
      );
    };
    const ImportModalBody = () => {
      prevTxnIndex =
        transactions.get(pageConfig.formData.txnId)?.steps?.length || 0;

      const metaVertexId = getNewGraphId();
      const dataVertexId = getNewGraphId();

      setGraph("vertexes", metaVertexId, {
        P: { name: "jsx", props: { width: 700, height: 700 } },
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
              props: {
                children: "Import",
                variant: "soft",

                onClick: () => {
                  const jsxParser = new JsxParser({
                    showWarnings: true,
                    txnId: pageConfig.formData.txnId,
                    jsx: graph.vertexes[dataVertexId].P.jsx || "",
                    parent: graph.vertexes[selectedId()],
                  });
                  jsxParser.render(graph, setGraph);
                  // reset layout
                  // layoutTreeViewInstance.option("items", getLayoutTreeData());
                },
              },
            },
          } as any,
        },
        {
          meta: {
            P: {
              component: "Button",
              props: {
                children: "Submit",
                onClick: onImportsSubmit,
              },
            },
          } as any,
        },
        {
          meta: {
            P: {
              component: "Button",
              props: {
                children: "Cancel",
                class: "border-color:#FF0000 color:#FF0000",
                variant: "outlined",
                onClick: onImportsCancel,
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
                <ModalBody class={"mt:1rem"}>
                  <GenericInputField
                    txnId={dataVertexId}
                    title={"Write HTML"}
                    component="TextArea"
                    meta={graph.vertexes[metaVertexId]}
                    data={graph.vertexes[dataVertexId]}
                    setValue={(data: any) =>
                      setGraph("vertexes", dataVertexId, "P", { jsx: data })
                    }
                    disabled={false}
                  />
                </ModalBody>
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

    const CollAndData = () => {
      const metaVertexId = getNewGraphId();
      const txnId = getNewTxnId(graph, setGraph);

      addNewVertex(
        txnId,
        newVertex(metaVertexId, ["MetaAttr"], {
          name: "Attr",
          props: {
            type: "Attr",
            label: "Attr",
          },
        }),
        graph,
        setGraph,
      );
      const attributes: FieldAttribute[] = [
        {
          name: "coll",
          displayName: "Collection",
          component: "SelectBox",
          props: {
            collection: "g:'Coll'",
            parentLabel: "Coll",
          },
        },
        {
          name: "data",
          component: "SelectBox",
          props: {
            collection: `g:'{{->$0Coll::'P.${IdAttr}'}}'`,
          },
        },
        {
          name: "data",
          component: "TextBox",
        },
      ];
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[metaVertexId],
        attributes,
      );
      onCleanup(() => {
        revertTransaction(txnId);
      });
      const metaVertex = graph.vertexes[metaVertexId];
      const collMetaVertex = getChildVertexes(
        graph,
        ["MetaAttr"],
        [metaVertex],
      );

      return (
        <>
          <br />
          {/*<span>Collection:</span>*/}
          <SelectInputField
            data={graph.vertexes[selectedId()!]}
            meta={collMetaVertex.vertexes![0]!}
            disabled={false}
            title={"Collection:"}
            component={"SelectBox"}
            txnId={pageConfig.formData.txnId}
            isRealTime={false}
          />
          {/*<span>Data:</span>*/}
          <SelectInputField
            data={graph.vertexes[selectedId()!]}
            meta={collMetaVertex.vertexes![1]!}
            disabled={false}
            title={"Data:"}
            component={"SelectBox"}
            txnId={pageConfig.formData.txnId}
            // passed setValue when we have a string value in select field
            isRealTime={false}
          />
          <span>Expression:</span>
          <GenericInputField
            txnId={txnId}
            title={""}
            data={graph.vertexes[selectedId()!]}
            meta={collMetaVertex.vertexes![2]!}
            disabled={false}
            component={"TextBox"}
          />
        </>
      );
    };

    return (
      <>
        <Show when={selectedId() !== -1}>
          <GenericField
            meta={
              {
                P: {
                  component: "Button",
                  props: {
                    children: "Rules",
                    class: "mb:5",
                    onClick: toggleRulesModal,
                  },
                },
              } as any
            }
          />
          &nbsp;&nbsp;
          <GenericField
            meta={
              {
                P: {
                  component: "Button",
                  props: {
                    children: "Import",
                    onClick: toggleImportsModal,
                  },
                },
              } as any
            }
          />
          <CollAndData />
          <FormGroupProperties
            txnId={pageConfig.formData.txnId}
            metaAttributes={selectedComponentProperties().vertexes || []}
            vertex={graph.vertexes[propertiesVertexId]}
            setValue={setPropertyValue}
            selectedLayout={graph.vertexes[selectedId()]}
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
                  {/*<button onclick={toggleRulesModal}>OK</Button>*/}
                  <div
                    style={{
                      display: "flex",
                      "justify-content": "center",
                      "align-items": "center",
                    }}
                  >
                    <GenericField
                      meta={
                        {
                          P: {
                            component: "Button",
                            props: {
                              children:
                                "Submithttps://coindcx.com/futures/B-BTC_USDT",
                              onClick: () => onRulesSubmit,
                            },
                          },
                        } as any
                      }
                    />

                    <GenericField
                      meta={
                        {
                          P: {
                            component: "Button",
                            props: {
                              variant: "outlined",
                              class: "border-color:#FF0000 color:#FF0000",
                              children: "Cancel",
                              onClick: () => onRulesCancel,
                            },
                          },
                        } as any
                      }
                    />
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
  };
  return (
    <Show
      when={isPropertiesExpanded()}
      fallback={
        <div
          class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
          style="transition: opacity 0.3s ease-in-out;"
          onClick={togglePropertiesExpansion}
          title="Properties"
        >
          <Icon icon={"mingcute:settings-6-line"} height={25} width={25} />
        </div>
      }
    >
      <div class="ml:5 mr:5">
        <div
          onClick={toggleIsPropertiesOpen}
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            cursor: "pointer",
          }}
        >
          <div
            class="mb:2px ml:5px p:3|0"
            style="flex-grow: 1; font-weight: bold"
          >
            Properties
          </div>
          <Tooltip content={"Delete"} nowrap>
            <GenericField
              meta={
                {
                  P: {
                    component: "Icon",
                    props: {
                      style: { color: "red" },
                      onClick: () =>
                        deleteLayout(
                          getChildVertex(
                            graph,
                            ["$0Comp"],
                            pageConfig.formData.formData,
                          ).vertex?.P.name,
                        ),
                      width: 18,
                      height: 18,
                      class: "cursor:pointer  mr:5px",
                      icon: "mage:trash",
                    },
                  },
                } as any
              }
            />
          </Tooltip>
          <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
            <Icon
              icon={"mdi:chevron-up"}
              style={{
                "font-size": "24px",
                "border-radius": "50%",
                "margin-left": "5px",
                transition: "transform 0.2s linear",
                transform: `${isPropertiesOpen() ? "rotate(0deg)" : "rotate(180deg)"}`,
              }}
              class="flex-1"
            />
          </div>
        </div>
        <Show when={isPropertiesOpen()}>
          <Show when={selectedId() !== -1}>
            <hr class={"color:lightgrey m:.4rem|0"} />
          </Show>
          <PropertiesPart />
        </Show>
      </div>
    </Show>
  );
}
