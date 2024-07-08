import { PropertiesBody } from './PropertiesBody';
import { PropertiesHeader } from './PropertiesHeader';

export function Properties() {
  return (
    <div class="ml:5 mr:5 ">
      <PropertiesHeader />
      <hr class={"color:lightgrey m:.4rem|0"} />
      <PropertiesBody  />
    </div>
  );
}





// import { Icon } from "@iconify-icon/solid";
// import {  createSignal, For, onCleanup, Show } from "solid-js";
// import { Portal } from "solid-js/web";
// import { GenericInputField } from "~/components/fields/GenericInputField";
// import { SelectInputField } from "~/components/fields/SelectInputField";
// import { TableInputField } from "~/components/fields/TableInputField";
// import { GenericField } from "~/components/fields/GenericField";
// import {
//   ModalBody,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
// } from "~/components/solid_blocks";
// import type { FieldAttribute } from "~/lib/FormMetadataType";
// import {
//   getChildVertex,
// } from "~/lib/graph/get/sync/traverse";
// import { addMetaVertexes } from "~/lib/graph/mutate/form_functions";
// import { IdAttr, type Vertex } from "~/lib/graph/graph";
// import {
//   revertTransactionUpTo,
//   getNewGraphId,
//   getNewTxnId,
//   revertTransaction,
// } from "~/lib/graph/transaction";
// import JsxParser from "~/lib/jsx_parser/components/JsxParser";
// import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
// import { getTreeData } from "~/lib/graph/get/sync/traverse";
// import { FormMetaData } from "~/lib/formMetaData";
// import { setPropertyValueGlobal } from "~/lib/drag_drop/setPropertyValueGlobal";
// import {FormGroupProperties} from "~/pages/drag_drop/actions/FormGroupProperties";

// export function useExpansion(defaultValue = true) {
//   const [expanded, setExpanded] = createSignal(defaultValue);
//   const toggleExpansion = () => setExpanded(!expanded());
//   return [expanded, toggleExpansion];
// }

// export function Properties(props: { setShowDrawer?: any }) {
//   const [pageConfig, setPageConfig] = useDesignerLayoutStore();
//   const [graph, setGraph] = useGraph();
//   const [isPropertiesExpanded, togglePropertiesExpansion] = useExpansion();

//   const PropertiesPart = () => {
//     const [isRulesModalOpen, setIsRulesModalOpen] = createSignal(false);
//     const [isImportModalOpen, setIsImportModalOpen] = createSignal(false);

//     const setPropertyValue = (meta: Vertex, value: any) => {
//       if (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) {
//         return setPropertyValueGlobal(
//           graph,
//           setGraph,
//           pageConfig.formData.txnId,
//           meta,
//           graph.vertexes[layoutStore.selectedId],
//           graph.vertexes[layoutStore.selectedComponent],
//           value,
//         );
//       }
//       return;
//     };
//     const selectedComponentProperties = () => {
//       const selectedComp = graph.vertexes[selectedComponent().vertexId];

//       if (!selectedComp) {
//         return { error: true };
//       }

//       return getChildVertexes(graph, ["$0Prop"], [selectedComp]);
//     };

//     const toggleRulesModal = () => setIsRulesModalOpen((prev) => !prev);
//     const toggleImportsModal = () => setIsImportModalOpen((prev) => !prev);

//     let prevTxnIndex = -1;
//     // const onRulesSubmit = () => {
//     //   // hack to refresh the select fields. no option is refereshing the label.
//     //   setGraph("vertexes", layoutStore.selectedId, "OUT", "Rules", (v) =>
//     //     v ? [...v] : v,
//     //   );
//     //   toggleRulesModal();
//     // };
//     // const onRulesCancel = () => {
//     //   if (prevTxnIndex !== -1)
//     //     revertTransactionUpTo(pageConfig.formData.txnId, prevTxnIndex, graph);
//     //   toggleRulesModal();
//     // };
//     // const onImportsSubmit = () => {
//     //   // reset layout
//     //   // layoutTreeViewInstance.option("items", getLayoutTreeData());
//     //   // hack to refresh the select fields. no option is refereshing the label.
//     //   setGraph("vertexes", layoutStore.selectedId, "OUT", "Rules", (v) =>
//     //     v ? [...v] : v,
//     //   );
//     //   toggleImportsModal();
//     // };
//     // const onImportsCancel = () => {
//     //   if (prevTxnIndex !== -1)
//     //     revertTransactionUpTo(pageConfig.formData.txnId, prevTxnIndex, graph);
//     //   // reset layout
//     //   // layoutTreeViewInstance.option("items", getLayoutTreeData());
//     //   toggleImportsModal();
//     // };

//     // const RulesModalBody = () => {
//     //   prevTxnIndex =
//     //     graph.transactions.get(pageConfig.formData.txnId)?.steps?.length || 0;

//     //   const metaVertexId = graph.newVertexId;
//     //   const txnId = graph.newTxnId;
//     //   const metaAttributes = FormMetaData.Coll.attributes.find(
//     //     (x) => x.name === "Rules",
//     //   );

//     //   addNewVertex(
//     //     txnId,
//     //     newVertex(metaVertexId, ["MetaAttr"], {
//     //       name: metaAttributes?.name,
//     //       ...metaAttributes?.props,
//     //     }),
//     //     graph,
//     //     setGraph,
//     //   );
//     //   const attributes: FieldAttribute[] = JSON.parse(
//     //     JSON.stringify(metaAttributes?.attributes!),
//     //   );

//     //   for (const attribute of attributes) {
//     //     if (attribute.name === "Rule") {
//     //       for (const ruleattribute of attribute.attributes!) {
//     //         if (ruleattribute.name === "cond") {
//     //           for (const condAttribute of ruleattribute.attributes!) {
//     //             if (condAttribute.name === "layout") {
//     //               const data = getTreeData(
//     //                 graph,
//     //                 setGraph,
//     //                 {
//     //                   collection: "->Attr",
//     //                   child: {
//     //                     collection: "->Attr",
//     //                     child: {
//     //                       collection: "->Attr",
//     //                       child: {
//     //                         collection: "->Attr",
//     //                         child: { collection: "->Attr" },
//     //                       },
//     //                     },
//     //                   },
//     //                 },
//     //                 pageConfig.formData?.formData
//     //                   ? [pageConfig.formData.formData]
//     //                   : [],
//     //                 {
//     //                   nameExpr: (v: Vertex) => {
//     //                     const component = getChildVertex(graph, ["$0Comp"], v)
//     //                       .vertex?.P.name;
//     //                     return `${v.P.name}${
//     //                       component ? ` (${component})` : ""
//     //                     }`;
//     //                   },
//     //                 },
//     //               );

//     //               condAttribute!.props = {
//     //                 dataSource: data,
//     //                 valueExpr: "id",
//     //                 displayExpr: "name",
//     //                 itemsExpr: "children",
//     //                 showClearButton: true,
//     //                 treeProps: {
//     //                   dataStructure: "tree",
//     //                   keyExpr: "id",
//     //                   displayExpr: "name",
//     //                   itemsExpr: "children",
//     //                   selectionMode: "single",
//     //                   // width: 200,
//     //                   // searchEnabled: true,
//     //                   // activeStateEnabled: false,
//     //                   // focusStateEnabled: false,
//     //                   expandNodesRecursive: false,
//     //                 },
//     //               };
//     //             }
//     //           }
//     //         }
//     //       }
//     //     }
//     //   }

//     //   addMetaVertexes(
//     //     graph,
//     //     setGraph,
//     //     txnId,
//     //     graph.vertexes[metaVertexId],
//     //     attributes,
//     //   );
//     //   onCleanup(() => {
//     //     revertTransaction(txnId, graph);
//     //   });

//     //   return (
//     //     <TableInputField
//     //       meta={graph.vertexes[metaVertexId]}
//     //       data={graph.vertexes[selectedId()!]}
//     //       txnId={pageConfig.formData.txnId}
//     //       isRealTime={false}
//     //     />
//     //   );
//     // };
//     // const ImportModalBody = () => {
//     //   prevTxnIndex =
//     //     graph.transactions.get(pageConfig.formData.txnId)?.steps?.length || 0;

//     //   const metaVertexId = graph.newVertexId;
//     //   const dataVertexId = graph.newVertexId;

//     //   setGraph("vertexes", metaVertexId, {
//     //     P: { name: "jsx", width: 700, height: 700 },
//     //   });
//     //   setGraph("vertexes", dataVertexId, { id: dataVertexId, P: {} });

//     //   onCleanup(() => {
//     //     // @ts-ignore
//     //     setGraph("vertexes", metaVertexId, undefined);
//     //     // @ts-ignore
//     //     setGraph("vertexes", dataVertexId, undefined);
//     //   });
//     //   const footerButtons = [
//     //     {
//     //       meta: {
//     //         P: {
//     //           component: "Button",
//     //             children: "Import",
//     //             variant: "soft",

//     //             onClick: () => {
//     //               const jsxParser = new JsxParser({
//     //                 showWarnings: true,
//     //                 txnId: pageConfig.formData.txnId,
//     //                 jsx: graph.vertexes[dataVertexId].P.jsx || "",
//     //                 parent: graph.vertexes[layoutStore.selectedId],
//     //               });
//     //               jsxParser.render(graph, setGraph);
//     //               // reset layout
//     //               // layoutTreeViewInstance.option("items", getLayoutTreeData());
//     //             },

//     //         },
//     //       } as any,
//     //     },
//     //     {
//     //       meta: {
//     //         P: {
//     //           component: "Button",
          
//     //             children: "Submit",
//     //             onClick: onImportsSubmit,
              
//     //         },
//     //       } as any,
//     //     },
//     //     {
//     //       meta: {
//     //         P: {
//     //           component: "Button",
            
//     //             children: "Cancel",
//     //             class: "border-color:#FF0000 color:#FF0000",
//     //             variant: "outlined",
//     //             onClick: onImportsCancel,
              
//     //         },
//     //       } as any,
//     //     },
//     //   ];
//     //   return (
//     //     <>
//     //       <Portal>
//     //         <div role="dialog" class="sb-modal r:10|10|10|10">
//     //           <ModalContent class={"min-w:30%"}>
//     //             <ModalHeader>
//     //               Import HTML
//     //               <button
//     //                 onclick={toggleImportsModal}
//     //                 style={{ float: "right" }}
//     //               >
//     //                 ✕
//     //               </button>
//     //             </ModalHeader>
//     //             <ModalBody class={"mt:1rem"}>
//     //               <GenericInputField
//     //                 txnId={pageConfig.formData.txnId}
//     //                 title={"Write HTML"}
//     //                 component="TextArea"
//     //                 meta={graph.vertexes[metaVertexId]}
//     //                 data={graph.vertexes[dataVertexId]}
//     //                 setValue={(data: any) =>
//     //                   setGraph("vertexes", dataVertexId, "P", { jsx: data })
//     //                 }
//     //                 disabled={false}
//     //               />
//     //             </ModalBody>
//     //             <ModalFooter>
//     //               <div
//     //                 style={{
//     //                   display: "flex",

//     //                   "justify-content": "center",
//     //                   "align-items": "center",
//     //                 }}
//     //               >
//     //                 <For each={footerButtons}>
//     //                   {(item) => <GenericField meta={item.meta} />}
//     //                 </For>
//     //               </div>
//     //             </ModalFooter>
//     //           </ModalContent>
//     //         </div>
//     //       </Portal>
//     //     </>
//     //   );
//     // };

//     const CollAndData = () => {
//       const metaVertexId = graph.newVertexId;
//       const txnId = graph.newTxnId;

//       addNewVertex(
//         txnId,
//         newVertex(metaVertexId, ["MetaAttr"], {
//           name: "Attr",
      
//             type: "Attr",
//             label: "Attr",
          
//         }),
//         graph,
//         setGraph,
//       );
//       const attributes: FieldAttribute[] = [
//         {
//           name: "coll",
//           displayName: "Collection",
//           component: "SelectBox",
        
//             collection: "g:'Coll'",
//             parentLabel: "Coll",
          
//         },
//         {
//           name: "data",
//           component: "SelectBox",
    
//             collection: `g:'{{->$0Coll::'P.${IdAttr}'}}'`,
          
//         },
//         {
//           name: "data",
//           component: "TextBox",
//         },
//       ];
//       addMetaVertexes(
//         graph,
//         setGraph,
//         txnId,
//         graph.vertexes[metaVertexId],
//         attributes,
//       );
//       onCleanup(() => {
//         revertTransaction(txnId, graph);
//       });
//       const metaVertex = graph.vertexes[metaVertexId];
//       const collMetaVertex = getChildVertexes(
//         graph,
//         ["MetaAttr"],
//         [metaVertex],
//       );

//       return (
//         <>
//           <br />
//           {/*<span>Collection:</span>*/}
//           <SelectInputField
//             data={graph.vertexes[selectedId()!]}
//             meta={collMetaVertex.vertexes?.[0]!}
//             disabled={false}
//             title={"Collection:"}
//             component={"SelectBox"}
//             txnId={pageConfig.formData.txnId}
//             isRealTime={false}
//           />
//           {/*<span>Data:</span>*/}
//           <SelectInputField
//             data={graph.vertexes[layoutStore.selectedId]}
//             meta={collMetaVertex.vertexes?.[1]!}
//             disabled={false}
//             title={"Data:"}
//             component={"SelectBox"}
//             txnId={pageConfig.formData.txnId}
//             // passed setValue when we have a string value in select field
//             isRealTime={false}
//           />
//           <span class="float:left mt:5">Expression:</span>
//           <GenericInputField
//             txnId={txnId}
//             title={""}
//             data={graph.vertexes[layoutStore.selectedId]}
//             meta={collMetaVertex.vertexes?.[2]!}
//             disabled={false}
//             component={"TextBox"}
//           />
//         </>
//       );
//     };

//     return (
//       <>
//         <Show when={layoutStore.selectedId !== -1}>
//           <div class="flex jc:start">
//             <GenericField
//               meta={
//                 {
//                   P: {
//                     component: "Button",
                 
//                       children: "Rules",
//                       class: "mb:5",
//                       onClick: toggleRulesModal,
                    
//                   },
//                 } as any
//               }
//             />
//             &nbsp;&nbsp;
//             <GenericField
//               meta={
//                 {
//                   P: {
//                     component: "Button",
                
//                       children: "Import",
//                       onClick: toggleImportsModal,
                    
//                   },
//                 } as any
//               }
//             />
//           </div>
//           <CollAndData />
//           <FormGroupProperties
//             txnId={pageConfig.formData.txnId}
//             metaAttributes={selectedComponentProperties().vertexes ?? []}
//             setValue={setPropertyValue}
//             selectedLayout={graph.vertexes[layoutStore.selectedId]}
//           />
//         </Show>
//         <Show when={isRulesModalOpen()}>
//           <Portal>
//             <div role="dialog" class="sb-modal">
//               <ModalContent>
//                 <ModalHeader>
//                   Header
//                   <button onclick={toggleRulesModal} style={{ float: "right" }}>
//                     ✕
//                   </button>
//                 </ModalHeader>
//                 <ModalBody>
//                   <RulesModalBody />
//                 </ModalBody>
//                 <ModalFooter>
//                   {/*<button onclick={toggleRulesModal}>OK</Button>*/}
//                   <div
//                     style={{
//                       display: "flex",
//                       "justify-content": "center",
//                       "align-items": "center",
//                     }}
//                   >
//                     <GenericField
//                       meta={
//                         {
//                           P: {
//                             component: "Button",
                         
//                               children:
//                                 "Submithttps://coindcx.com/futures/B-BTC_USDT",
//                               onClick: () => onRulesSubmit,
                            
//                           },
//                         } as any
//                       }
//                     />

//                     <GenericField
//                       meta={
//                         {
//                           P: {
//                             component: "Button",
                            
//                               variant: "outlined",
//                               class: "border-color:#FF0000 color:#FF0000",
//                               children: "Cancel",
//                               onClick: () => onRulesCancel,
                            
//                           },
//                         } as any
//                       }
//                     />
//                   </div>
//                 </ModalFooter>
//               </ModalContent>
//             </div>
//           </Portal>
//         </Show>
//         <Show when={isImportModalOpen()}>
//           <ImportModalBody />
//         </Show>
//       </>
//     );
//   };
//   return (
//     <div class="ml:5 mr:5 ">
//       <div
//         style={{
//           display: "flex",
//           "justify-content": "space-between",
//           "align-items": "center",
//           cursor: "pointer",
//         }}
//       >
//         <div
//           class="mb:2px ml:5px p:3|0 f:16"
//           style="flex-grow: 1; font-weight: bold;text-align-last: left;"
//         >
//           Properties
//         </div>
//         <Icon
//           onclick={() => props.setShowDrawer(false)}
//           icon={"iconamoon:close-light"}
//           class="bg:#ededed:hover r:50%"
//           height={24}
//           width={24}
//           style={{ color: "lightgray", cursor: "pointer" }}
//         />
//       </div>

//         <hr class={"color:lightgrey m:.4rem|0"} />
//         <PropertiesPart />
//     </div>
//   );
// }

