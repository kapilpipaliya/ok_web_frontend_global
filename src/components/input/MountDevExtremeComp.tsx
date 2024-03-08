// import {createEffect, createSignal, on, onCleanup, onMount, Owner, runWithOwner} from "solid-js";
// import dxBox, {Properties as dxBoxProperties} from "devextreme/ui/box";
// import dxLoadPanel, {Properties as dxLoadPanelProperties} from "devextreme/ui/load_panel";
// import dxTreeMap, {Properties as dxTreeMapProperties} from "devextreme/viz/tree_map";
// import dxVectorMap, {Properties as dxVectorMapProperties} from "devextreme/viz/vector_map";
// import dxTreeView, {Properties as dxTreeViewProperties} from "devextreme/ui/tree_view";
// import dxTreeList, {Properties as dxTreeListProperties} from "devextreme/ui/tree_list";
// import dxToast, {Properties as dxToastProperties} from "devextreme/ui/toast";
// import dxTileView from "devextreme/ui/tile_view";
// import dxTabs, {Properties as dxTabsProperties, Properties as dxTileViewProperties} from "devextreme/ui/tile_view";
// import dxTabPanel, {Properties as dxTabPanelProperties} from "devextreme/ui/tab_panel";
// import dxSpeedDialAction, {Properties as dxSpeedDialActionProperties} from "devextreme/ui/speed_dial_action";
// import dxSparkLine, {Properties as dxSparkLineProperties} from "devextreme/viz/sparkline";
// import dxScrollView, {Properties as dxScrollViewProperties} from "devextreme/ui/scroll_view";
// import dxScheduler, {Properties as dxSchedulerProperties} from "devextreme/ui/scheduler";
// import dxSankey, {Properties as dxSankeyProperties} from "devextreme/viz/sankey";
// import dxPopup, {Properties as dxPopupProperties} from "devextreme/ui/popup";
// import dxPopOver, {Properties as dxPopOverProperties} from "devextreme/ui/popover";
// import dxPolarChart, {Properties as dxPolarChartProperties} from "devextreme/viz/polar_chart";
// import dxPieChart, {Properties as dxPieChartProperties} from "devextreme/viz/pie_chart";
// import dxMultiView, {Properties as dxMultiViewProperties} from "devextreme/ui/multi_view";
// import dxMenu, {Properties as dxMenuProperties} from "devextreme/ui/menu";
// import dxMap, {Properties as dxMapProperties} from "devextreme/ui/map";
// import dxLookup, {Properties as dxLookupProperties} from "devextreme/ui/lookup";
// import dxLoadIndicator, {Properties as dxLoadIndicatorProperties} from "devextreme/ui/load_indicator";
// import dxList, {Properties as dxListProperties} from "devextreme/ui/list";
// import dxGantt, {Properties as dxGanttProperties} from "devextreme/ui/gantt";
// import dxGallery, {Properties as dxGalleryProperties} from "devextreme/ui/gallery";
// import dxFunnel, {Properties as dxFunnelProperties} from "devextreme/viz/funnel";
// import dxFileManager, {Properties as dxFileManagerProperties} from "devextreme/ui/file_manager";
// import {IdAttr, Vertex} from "../../lib/graph";
// import dxDiagram, {Properties as dxDiagramProperties} from "devextreme/ui/diagram";
// import dxDataGrid, {Properties as dxDataGridProperties} from "devextreme/ui/data_grid";
// import dxContextMenu, {Properties as dxContextMenuProperties} from "devextreme/ui/context_menu";
// import dxChart, {Properties as dxChartProperties} from "devextreme/viz/chart";
// import {getValueFromVertexOrKey} from "../../utils/utils";
// import dxButton, {Properties as dxButtonProperties} from "devextreme/ui/button";
// import dxBarGauge, {Properties as dxBarGaugeProperties} from "devextreme/viz/bar_gauge";
// import dxActionSheet, {Properties as dxActionSheetProperties} from "devextreme/ui/action_sheet";
// import dxAccordion, {Properties as dxAccordionProperties} from "devextreme/ui/accordion";
// import dxButtonGroup, {Properties as dxButtonGroupProperties} from "devextreme/ui/button_group";
// import dxTooltip, {Properties as dxTooltipProperties} from "devextreme/ui/tooltip";
// import dxPivotGrid, {Properties as dxPivotGridProperties} from "devextreme/ui/pivot_grid";
// import dxDropDownButton, {Properties as dxDropDownButtonProperties} from "devextreme/ui/drop_down_button";
// import dxDrawer, {Properties as dxDrawerProperties} from "devextreme/ui/drawer";
// import dxDropDownBox, {Properties as dxDropDownBoxProperties} from "devextreme/ui/drop_down_box";

// export const mountComponent = (el: HTMLDivElement, component: string, meta: Vertex, data: Vertex | undefined, setValue: (attribute: Vertex, vertex: Vertex, data: any) => void, outerOwner: Owner, disabled: boolean, ref: any, onClick: any, events: any): any => {
   
//         let attributes: any = {};
//         let comp: any;

//         if (component === "Box") {
//             // https://github.com/DevExpress/DevExtreme/blob/23_1/js/ui/box.js#L273
//             // Box only support items properly, if we use children it use it as template and all the events are removed.
//             // so don't use the box component.
//             return
//             comp = dxBox;
//             Object.assign(attributes, {
//                 // direction: "row",
//                 // height: 100,
//             } as dxBoxProperties);
//         } else if (component === "1") {
//             comp = dxLoadPanel;
//             Object.assign(attributes, {} as dxLoadPanelProperties);
//         } else if (component === "1") {
//             comp = dxLoadPanel;
//             Object.assign(attributes, {} as dxLoadPanelProperties);
//         } else if (component === "TreeMap") {
//             comp = dxTreeMap;
//             // const treeMapData = [
//             //   {
//             //     name: "Fruits",
//             //     items: [
//             //       {
//             //         name: "Apples",
//             //         value: 4,
//             //       },
//             //       {
//             //         name: "Oranges",
//             //         value: 10,
//             //       },
//             //       {
//             //         name: "Lemons",
//             //         value: 6,
//             //       },
//             //     ],
//             //   },
//             // ];
//             Object.assign(attributes, {} as dxTreeMapProperties);
//         } else if (component === "VectorMap") {
//             comp = dxVectorMap;
//             Object.assign(attributes, {
//                 // bounds: [-180, 85, 180, -60],
//                 // tooltip: {
//                 //   enabled: true,
//                 //   border: {
//                 //     visible: false,
//                 //   },
//                 //   font: { color: "#fff" },
//                 // },
//                 // layers: {
//                 //   type: "area",
//                 //   dataSource: "https://js.devexpress.com/Content/data/vectorMap-sources/world.txt",
//                 // },
//             } as dxVectorMapProperties);
//         } else if (component === "TreeView") {
//             const syncSelection = (treeViewInstance: dxTreeView) => {
//                 // console.log(treeViewInstance);
//                 const selectedItems = treeViewInstance.getSelectedNodes().map((node) => node.itemData);

//                 // const selectedKeys = selectedItems.map((item: any) => item.key);
//                 // treeViewInstance.selectItem(selectedKeys);
//                 console.log(selectedItems);
//                 setValue(meta, data, selectedItems);
//             };
//             comp = dxTreeView;
//             Object.assign(attributes, {
//                 width: 340,
//                 height: 320,
//                 showCheckBoxesMode: "normal",
//                 onSelectionChanged: (e) => {
//                     runWithOwner(outerOwner, () => syncSelection(e.component));
//                 },
//                 onContentReady: (e) => {
//                     syncSelection(e.component);
//                 },
//                 itemTemplate: (item) => {
//                     return `<div>${item.fullName} (${item.position})</div>`;
//                 },

//             } as dxTreeViewProperties);
//         } else if (component === "TreeList") {
//             comp = dxTreeList;
//             // const treeListData = [
//             //   {
//             //     id: 1,
//             //     parentId: 0,
//             //     fullName: "John Heart",
//             //     position: "CEO",
//             //     email: "jheart@dx-email.com",
//             //   },
//             // ];
//             Object.assign(attributes, {
//                 showRowLines: true,
//                 autoExpandAll: true,
//                 columns: ["position", "fullName", "email"],
//                 searchPanel: {
//                     visible: true,
//                     width: 250,
//                 },
//                 headerFilter: {
//                     visible: true,
//                 },
//             } as dxTreeListProperties);
//         } else if (component === "Toast") {
//             comp = dxToast;
//             Object.assign(attributes, {
//                 displayTime: 20000,
//                 message: "Toast message",
//                 type: "info",
//                 visible: false,
//             } as dxToastProperties);
//             // use instance()?.show() method to display toast
//         } else if (component === "TileView") {
//             comp = dxTileView;
//             const tileViewData = [
//                 {
//                     ID: "1",
//                     Address: "652 Avonwick Gate",
//                     City: "Toronto",
//                     State: "ON",
//                     Price: 780000,
//                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/1.jpg",
//                 },
//             ];

//             Object.assign(attributes, {
//                 height: 350,
//                 itemTemplate: (itemData, itemIndex, itemElement) => {
//                     console.log("itemData", itemData, itemElement);
//                     const imageDiv = <div></div>;
//                     imageDiv.style.backgroundImage = "url(" + itemData.ImageSrc + ")";
//                     imageDiv.style.height = "100%";
//                     imageDiv.style.width = "100%";
//                     imageDiv.style.backgroundPosition = "center";
//                     imageDiv.style.backgroundSize = "cover";
//                     imageDiv.style.display = "block";
//                     itemElement.append(imageDiv);
//                 },
//             } as dxTileViewProperties);
//         } else if (component === "Tabs") {
//             comp = dxTabs;
//             const tabsData = [
//                 {
//                     text: "Home",
//                     icon: "home",
//                 },
//                 {
//                     text: "About",
//                     icon: "info",
//                 },
//             ];
//             Object.assign(attributes, {
//                 onSelectionChanged(e) {
//                     runWithOwner(outerOwner, () => setValue(meta, data, e.addedItems[0].text));
//                 },
//             } as dxTabsProperties);
//         } else if (component === "TabPanel") {
//             comp = dxTabPanel;
//             const tabPanelData = [
//                 {
//                     title: "Info",
//                     text: "John Smith, 1986",
//                 },
//                 {
//                     title: "Contacts",
//                     text: "phone: (555)555-5555, email: John.Smith@example.com",
//                 },
//             ];
//             Object.assign(attributes, {
//                 height: 260,
//                 onSelectionChanged(e) {
//                     runWithOwner(outerOwner, () => setValue(meta, data, e.addedItems[0].text));
//                 },
//             } as dxTabPanelProperties);
//         } else if (component === "SpeedDialAction") {
//             comp = dxSpeedDialAction;
//             Object.assign(attributes, {
//                 icon: "tel",
//                 onClick(e) {
//                     console.log("Click");
//                 },
//             } as dxSpeedDialActionProperties);
//         } else if (component === "SparkLine") {
//             comp = dxSparkLine;

//             const sparkLineItems = [
//                 {
//                     arg: "1",
//                     val: 1,
//                 },
//                 {
//                     arg: "2",
//                     val: 2,
//                 },
//             ];
//             Object.assign(attributes, {} as dxSparkLineProperties);
//         } else if (component === "ScrollView") {
//             comp = dxScrollView;
//             Object.assign(attributes, {
//                 height: 100,
//                 scrollByContent: true,
//                 scrollByThumb: true,
//                 showScrollbar: "onScroll",
//                 onReachBottom: (e) => {
//                     setTimeout(() => {
//                         document.getElementById("scrollview-content")!.append("Content has been updated on the event.");
//                         e.component.release();
//                     }, 500);
//                 },
//                 reachBottomText: "Updating...",
//             } as dxScrollViewProperties);
//         } else if (component === "Scheduler") {
//             comp = dxScheduler;
//             Object.assign(attributes, {} as dxSchedulerProperties);
//         } else if (component === "Sankey") {
//             comp = dxSankey;
//             const sankeyData = [
//                 {
//                     source: "Brazil",
//                     target: "Portugal",
//                     weight: 5,
//                 },
//                 {
//                     source: "Brazil",
//                     target: "France",
//                     weight: 1,
//                 },
//             ];

//             Object.assign(attributes, {
//                 link: {
//                     colorMode: "gradient",
//                 },
//             } as dxSankeyProperties);
//         } else if (component === "Popup") {
//             comp = dxPopup;
//             Object.assign(attributes, {
//                 visible: false,
//                 contentTemplate: () => {
//                     return "<div>Some popup message</div>";
//                 },
//                 width: 200,
//                 height: 200,
//                 showTitle: true,
//                 title: "Popup",
//                 dragEnabled: true,
//                 closeOnOutsideClick: true,
//                 showCloseButton: true,
//                 position: {
//                     at: "bottom",
//                     my: "center",
//                     collision: "fit",
//                 },
//                 toolbarItems: [
//                     {
//                         locateInMenu: "always",
//                         widget: "dxButton",
//                         toolbar: "top",
//                         options: {
//                             text: "More info",
//                             onClick() {
//                                 console.log(`More info is clicked`);
//                             },
//                         },
//                     },
//                     {
//                         widget: "dxButton",
//                         toolbar: "bottom",
//                         location: "before",
//                         options: {
//                             icon: "email",
//                             text: "Send",
//                             onClick() {
//                                 console.log(`Email is sent to`);
//                             },
//                         },
//                     },
//                     {
//                         widget: "dxButton",
//                         toolbar: "bottom",
//                         location: "after",
//                         options: {
//                             text: "Close",
//                             onClick() {
//                                 instance()?.hide();
//                             },
//                         },
//                     },
//                 ],
//             } as dxPopupProperties);
//             // use instance()?.show() to display popup.
//         } else if (component === "PopOver") {
//             comp = dxPopOver;
//             // <p><span id="subject1">Google AdWords Strategy</span> (<a id="link1">details</a>)</p>
//             Object.assign(attributes, {
//                 target: "#link1",
//                 showEvent: "mouseenter",
//                 hideEvent: "mouseleave",
//                 position: "top",
//                 width: 300,
//             } as dxPopOverProperties);
//             // add some children and it will display when we click on the link
//         } else if (component === "PolarChart") {
//             comp = dxPolarChart;

//             const pivotGridItems = [
//                 {
//                     arg: "Monday",
//                     val: 3,
//                 },
//                 {
//                     arg: "Tuesday",
//                     val: 2,
//                 },
//             ];

//             Object.assign(attributes, {
//                 series: [
//                     {
//                         argumentField: "arg",
//                         valueField: "val",
//                         type: "bar",
//                     },
//                 ],
//             } as dxPolarChartProperties);
//         } else if (component === "PieChart") {
//             comp = dxPieChart;

//             const pieChartData = [
//                 {
//                     arg: "Russia",
//                     val: 12,
//                 },
//                 {
//                     arg: "Canada",
//                     val: 7,
//                 },
//             ];

//             Object.assign(attributes, {
//                 legend: {
//                     horizontalAlignment: "center",
//                     verticalAlignment: "bottom",
//                 },
//                 series: {
//                     argumentField: "arg",
//                     valueField: "val",
//                 },
//             } as dxPieChartProperties);
//         } else if (component === "MultiView") {
//             comp = dxMultiView;
//             const multiViewItems = [
//                 {
//                     ID: 1,
//                     CompanyName: "SuprMart",
//                     Address: "702 SW 8th Street",
//                     City: "Bentonville",
//                     State: "Arkansas",
//                     Zipcode: 72716,
//                     Phone: "(800) 555-2797",
//                     Fax: "(800) 555-2171",
//                     Website: "http://www.nowebsitesupermart.com",
//                 },
//             ];

//             Object.assign(attributes, {
//                 onItemClick: (e: any) => {
//                     setValue(meta, data, e.itemData);
//                 },
//                 height: 300,
//                 selectedIndex: 0,
//                 loop: false,
//                 animationEnabled: true,
//                 itemTemplate: (itemData: any, itemIndex: number, itemElement: any) => {
//                     itemElement.innerHTML = `
//                 <h3>${itemData.CompanyName}</h3>
//                 <p>${itemData.City}</p>
//                 <p>${itemData.Address}</p>
//                 <p>${itemData.City}</p>
//                 <p>${itemData.State}</p>
//                 <p>${itemData.Zipcode}</p>
//                 <p> ${itemData.Phone}</p>
//               `;
//                 },
//                 onSelectionChanged(e) {
//                     runWithOwner(outerOwner, () => setValue(meta, data, e.addedItems[0]));
//                 },
//             } as dxMultiViewProperties);
//             // } else if(component === "SelectBox" ) {
//             //  comp = dxSelectBox;
//             //  Object.assign(attributes, {} as dxSelectBoxProperties);
//         } else if (component === "Menu") {
//             comp = dxMenu;

//             Object.assign(attributes, {
//                 onItemClick: (e: any) => {
//                     setValue(meta, data, e.itemData);
//                 },
//             } as dxMenuProperties);
//         } else if (component === "Map") {
//             comp = dxMap;
//             Object.assign(attributes, {
//                 provider: "bing",
//                 type: "satellite",
//             } as dxMapProperties);
//             // } else if(component === "TagBox" ) {
//             //  comp = dxTagBox;
//             //  Object.assign(attributes, {} as dxTagBoxProperties);
//         } else if (component === "Lookup") {
//             comp = dxLookup;

//             const lookupData = [
//                 "Prepare 2013 Financial",
//                 "Prepare 3013 Marketing Plan",
//                 "Update Personnel Files",
//             ];

//             Object.assign(attributes, {
//                 onItemClick: (e: any) => {
//                     setValue(meta, data, e.itemData);
//                 },
//             } as dxLookupProperties);
//         } else if (component === "LoadPanel") {
//             comp = dxLoadPanel;
//             // set on container: style={{ padding: "10px" }}
//             Object.assign(attributes, {
//                 showIndicator: true,
//                 showPane: true,
//                 shading: true,
//                 hideOnOutsideClick: false,
//                 message: "Loading...",
//                 position: {of: el},
//                 onShown: () => {
//                     console.log("shown");
//                     setTimeout(() => {
//                         instance()?.hide();
//                     }, 0);
//                 },
//                 onHidden: () => {
//                     console.log("hidden");
//                 },
//             } as dxLoadPanelProperties);
//         } else if (component === "LoadIndicator") {
//             comp = dxLoadIndicator;
//             Object.assign(attributes, {
//                 width: 100,
//                 visible: true,
//             } as dxLoadIndicatorProperties);
//         } else if (component === "List") {
//             comp = dxList;

//             const listData = [
//                 "Prepare 2013 Financial",
//                 "Prepare 3013 Marketing Plan",
//                 "Update Personnel Files",
//             ];

//             Object.assign(attributes, {
//                 onItemClick: (e: any) => {
//                     setValue(meta, data, e.itemData);
//                 },
//             } as dxListProperties);
//         } else if (component === "Gantt") {
//             comp = dxGantt;

//             const ganttData = [
//                 {
//                     id: 1,
//                     title: "Market Analysis",
//                     start: "2019-01-05",
//                     end: "2019-01-13",
//                     progress: 100,
//                 },
//                 {
//                     id: 2,
//                     title: "Feature Planning",
//                     start: "2019-01-13",
//                     end: "2019-02-02",
//                     progress: 100,
//                 },
//             ];

//             Object.assign(attributes, {

//                 tasks: {
//                     //dataSource: dddddddd,
//                 },
//                 dependencies: {
//                     //dataSource: aaaaaaaa,
//                 },
//                 resources: {
//                     //dataSource: cccccccc,
//                 },
//                 resourceAssignments: {
//                     //dataSource: bbbbbbbb,
//                 },
//                 editing: {
//                     enabled: true,
//                 },
//                 validation: {
//                     autoUpdateParentTasks: true,
//                 },
//                 toolbar: {
//                     items: [
//                         "undo",
//                         "redo",
//                         "separator",
//                         "collapseAll",
//                         "expandAll",
//                         "separator",
//                         "addTask",
//                         "deleteTask",
//                         "separator",
//                         "zoomIn",
//                         "zoomOut",
//                     ],
//                 },
//                 columns: [
//                     {
//                         dataField: "title",
//                         caption: "Subject",
//                         width: 300,
//                     },
//                     {
//                         dataField: "start",
//                         caption: "Start Date",
//                     },
//                     {
//                         dataField: "end",
//                         caption: "End Date",
//                     },
//                 ],
//                 scaleType: "weeks",
//                 taskListWidth: 500,
//             } as dxGanttProperties);
//         } else if (component === "Gallery") {
//             comp = dxGallery;
//             const galleryData = [
//                 "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person2.png",
//                 "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person1.png",
//             ];

//             Object.assign(attributes, {
//                 height: 400,
//                 dataSource: galleryData
//             } as dxGalleryProperties);
//         } else if (component === "Funnel") {
//             comp = dxFunnel;
//             const funnelData = [
//                 {
//                     action: "Visited the Website",
//                     users: 9152,
//                 },
//                 {
//                     action: "Downloaded a Trial",
//                     users: 6879,
//                 },
//             ];

//             Object.assign(attributes, {
//                 argumentField: "action",
//                 label: {
//                     backgroundColor: "none",
//                     customizeText: function (e) {
//                         // @ts-ignore
//                         return e.item.argument + "<br />" + e.item.value;
//                     },
//                     position: "inside",
//                 },
//                 valueField: "users",
//             } as dxFunnelProperties);
//         } else if (component === "FileManager") {
//             comp = dxFileManager;
//             Object.assign(attributes, {
//                 fileSystemProvider: data.P[meta.P[IdAttr]],
//                 itemView: {
//                     mode: "thumbnails",
//                 },
//                 permissions: {
//                     create: true,
//                     copy: true,
//                     move: true,
//                     rename: true,
//                 },
//             } as dxFileManagerProperties);
//             // createEffect(() => instance()?.option("fileSystemProvider", data.P[meta.P[IdAttr]]));
//         } else if (component === "Diagram") {
//             comp = dxDiagram;

//             const diagramData = [
//                 {
//                     id: "125",
//                     from: "101",
//                     to: "102",
//                 },
//                 {
//                     id: "127",
//                     from: "101",
//                     to: "103",
//                 },
//             ];

//             Object.assign(attributes, {} as dxDiagramProperties);
//         } else if (component === "DataGrid") {
//             comp = dxDataGrid;
//             Object.assign(attributes, {} as dxDataGridProperties);
//         } else if (component === "ContextMenu") {
//             comp = dxContextMenu;

//             Object.assign(attributes, {
//                 visible: true,
//                 onItemClick: (e: any) => {
//                     setValue(meta, data, e.itemData.text);
//                 },
//             } as dxContextMenuProperties);
//         } else if (component === "Chart") {
//             comp = dxChart;

//             Object.assign(attributes, {
//                 series: {
//                     argumentField: "day",
//                     valueField: "oranges",
//                     name: "My oranges",
//                     type: getValueFromVertexOrKey(meta.P.props, "type") || "bar",
//                     color: "#ffaa66",
//                 },
//             } as dxChartProperties);
//         // } else if (component === "Button") {
//         //     comp = dxButton;
//         //     Object.assign(attributes, {
//         //         onClick: onClick,
//         //     } as dxButtonProperties);
//         } else if (component === "BarGauge") {
//             comp = dxBarGauge;
//             // [47.27, 65.32, 84.59, 71.86]
//             Object.assign(attributes, {
//                 startValue: 0,
//                 endValue: 100,
//                 values: data.P[meta.P[IdAttr]],
//                 label: {
//                     indent: 30,
//                     format: {
//                         type: "fixedPoint",
//                         precision: 1,
//                     },
//                     customizeText(arg) {
//                         return `${arg.valueText} %`;
//                     },
//                 },
//                 export: {
//                     enabled: true,
//                 },
//                 title: {
//                     text: "Series' Ratings",
//                     font: {
//                         size: 28,
//                     },
//                 },
//             } as dxBarGaugeProperties);
//         } else if (component === "ActionSheet") {
//             comp = dxActionSheet;
//             Object.assign(attributes, {
//                 title: "Choose action",
//                 onCancelClick: () => {
//                     setValue(meta, data, "Cancel");
//                 },
//                 onItemClick: (e: any) => {
//                     setValue(meta, data, e.itemData.text);
//                 },
//             } as dxActionSheetProperties);
//         } else if (component === "Accordion") {
//             comp = dxAccordion;
//             Object.assign(attributes, {
//                 animationDuration: 300,
//                 collapsible: true,
//                 multiple: false,
//                 selectedItems: [data.P[meta.P[IdAttr]][0]],

//                 itemTitleTemplate: (itemData: any, itemIndex: number, itemElement: any) => {
//                     itemElement.innerHTML = `
//                 ${itemData.CompanyName}
//               `;
//                     itemElement.style.height = "40px";
//                 },
//                 itemTemplate: (itemData: any, itemIndex: number, itemElement: any) => {
//                     itemElement.innerHTML = `
//                 <h3>${itemData.CompanyName}</h3>
//                 <p>${itemData.City}</p>
//                 <p>${itemData.Address}</p>
//                 <p>${itemData.City}</p>
//                 <p>${itemData.State}</p>
//                 <p>${itemData.Zipcode}</p>
//                 <p> ${itemData.Phone}</p>
//               `;
//                 },
//                 onSelectionChanged: (e: any) => {
//                     runWithOwner(outerOwner, () => setValue(meta, data, e.addedItems[0]));
//                 },
//             } as dxAccordionProperties);

//         }
//         //  else if (component === "ButtonGroup") {
//         //     comp = dxButtonGroup;
//         //     Object.assign(attributes, {
//         //         items: [],
//         //         selectionMode: "none",
//         //         onItemClick: (e) => {
//         //             // onClick: (item: any) => void;
//         //             onClick?.(e.itemData);
//         //         },
//         //     } as dxButtonGroupProperties);
//         // }
//          else if (component === "Tooltip") {
//             comp = dxTooltip;
//             Object.assign(attributes, {
//                 target: "#target-item",
//                 showEvent: "mouseenter",
//                 hideEvent: "mouseleave",
//                 hideOnOutsideClick: false,
//                 position: "top",
//                 contentTemplate: (e: any) => {
//                     e.component.option("contentTemplate", null);
//                     return data.P[meta.P[IdAttr]];
//                 },
//             } as dxTooltipProperties);
//         } else if (component === "PivotGrid") {
//             comp = dxPivotGrid;

//             const pivotGridItems = {
//                 fields: [
//                     {
//                         dataField: "[Product].[Category]",
//                         area: "row",
//                     },
//                     {
//                         dataField: "[Product].[Subcategory]",
//                         area: "row",
//                     },
//                 ],
//                 store: {
//                     type: "xmla",
//                     url: "https://demos.devexpress.com/Services/OLAP/msmdpump.dll",
//                     catalog: "Adventure Works DW Standard Edition",
//                     cube: "Adventure Works",
//                 },
//             };

//             Object.assign(attributes, {
//                 fieldChooser: {
//                     width: 400,
//                 },
//                 showBorders: true,
//             } as dxPivotGridProperties);
//         } else if (component === "DropDownButton") {
//             comp = dxDropDownButton;
//             const dropdownButtonData = [
//                 {
//                     id: 1,
//                     name: "Left",
//                     icon: "alignleft",
//                 },
//             ];
//             Object.assign(attributes, {
//                 displayExpr: "name",
//                 items: data.P[meta.P[IdAttr]],
//                 keyExpr: "id",
//                 selectedItemKey: 1,
//                 stylingMode: "text",
//                 useSelectMode: true,
//                 width: 100,
//                 onSelectionChanged: (e: any) => {
//                     runWithOwner(outerOwner, () => setValue(meta, data, e.item));
//                 },
//             } as dxDropDownButtonProperties);
//         } else if (
//             component === "Drawer"
//         ) {
//             comp = dxDrawer;
//             Object.assign(attributes, {} as dxDrawerProperties);
//         } else if (component === "DropDownBoxTreeView") {
//             comp = dxDropDownBox;
//             const syncTreeViewSelection = function (treeViewInstance: dxTreeView<any>, value: any) {
//                 if (!value) {
//                     treeViewInstance.unselectAll();
//                 } else {
//                     treeViewInstance.selectItem(value);
//                 }
//             };
//             Object.assign(attributes, {
//                 contentTemplate(e) {
//                     const div = document.createElement('div');

//                     const treeView = new dxTreeView(div, {
//                         ...(meta.P.props?.treeProps ?? {}),
//                         dataSource: e.component.getDataSource(),
//                         selectByClick: true,
//                         onContentReady(args) {
//                             const value = e.component.option('value');
//                             syncTreeViewSelection(args.component, value);
//                         },
//                         selectNodesRecursive: false,
//                         onItemSelectionChanged(args) {
//                             const selectedKeys = args.component.getSelectedNodeKeys();
//                             e.component.option('value', selectedKeys);
//                         },
//                     });

//                     e.component.on('valueChanged', (args: any) => {
//                         syncTreeViewSelection(treeView, args.value);
//                         e.component.close();
//                     });

//                     return div;
//                 }
//             } as dxDropDownBoxProperties);
//         } else if (component === "1") {
//             comp = dxLoadPanel;
//             Object.assign(attributes, {} as dxLoadPanelProperties);
//         } else {
//             console.warn("Component not found", component);
//             return "----";
//         }
//         // if (displayExpr.includes(component) && !meta.P.displayExpr?.P.value) {
//         //  Object.assign(attributes, {displayExpr: ''});
//         // }
//         // if (valueExpr.includes(component) && !meta.P.valueExpr?.P.value) {
//         //  Object.assign(attributes, {valueExpr: ''});
//         // }
//         // if (dataSource.includes(component) && !meta.P.dataSource?.P.value) {
//         //  Object.assign(attributes, {dataSource: ''});
//         // }
//         // if (items.includes(component) && !meta.P.items?.P.value) {
//         //  Object.assign(attributes, {items: ''});
//         // }

//         const [instance, setInstance] = createSignal<any>();
//         // createEffect needed for the drawer.else drawer is not working.
//         onMount(() => {
//             setInstance(new comp(el, attributes));
//             if (ref) {
//                 ref(instance());
//             }
//         })

//         // if (data?.P) {
//         //     if (component === "Button") {
//         //         createEffect(() => {
//         //             instance()?.option("text", data!.P[meta.P[IdAttr]])
//         //         });
//         //     } else if (component === "ButtonGroup") {
//         //         createEffect(() => instance()?.option("selectedItems", data!.P[meta.P[IdAttr]]));
//         //     }
//         // }

//         createEffect(() => {
//             if (data?.P) {
//                 let value = data.P[meta.P[IdAttr]];
//                 if (component === "FilterBuilder" || component === "FileUploader") {
//                     if (!value) value = [];
//                     else if (!Array.isArray(value)) {
//                         value = [value];
//                     }
//                 }
//                 return instance()?.option("value", value);
//             }
//         });
//         createEffect(() => instance()?.option("disabled", disabled));

//         createEffect(() => {
//             // Todo: Bug:
//             //  when property is removed,
//             //  it will not removed from the component.
//             for (const property in meta.P.props) { // as dxTreeMapProperties
//                 let value = getValueFromVertexOrKey(meta.P.props, property);
//                 if (property === "items" && typeof value === "string") {
//                     value = value.split("\n");
//                 }
//                 instance()?.option(property, value);
//             }
//         });

//         if (component === "Drawer") {
//             if (events?.isSideBarOpen) {
//                 createEffect(on(events.isSideBarOpen, (_) => instance()?.toggle(), {defer: true}));
//             }
//         }
//         onCleanup(() => instance()?.dispose());
    
// }