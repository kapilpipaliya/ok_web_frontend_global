import {
  createEffect, createMemo, For,
  JSXElement, Match, on,
  onCleanup,
  Show, Switch,
  useContext
} from "solid-js";
import { G } from "@mobily/ts-belt";

import dxBox, { Properties as dxBoxProperties } from "devextreme/ui/box";
import dxTreeMap, { Properties as dxTreeMapProperties } from "devextreme/viz/tree_map";
import dxVectorMap, { Properties as dxVectorMapProperties } from "devextreme/viz/vector_map";
import dxTreeView, { Properties as dxTreeViewProperties } from "devextreme/ui/tree_view";
import dxTreeList, { Properties as dxTreeListProperties } from "devextreme/ui/tree_list";
import dxToast, { Properties as dxToastProperties } from "devextreme/ui/toast";
import dxTileView, { Properties as dxTileViewProperties } from "devextreme/ui/tile_view";
import dxTabs, { Properties as dxTabsProperties } from "devextreme/ui/tile_view";
import dxTabPanel, { Properties as dxTabPanelProperties } from "devextreme/ui/tab_panel";
import dxSpeedDialAction, { Properties as dxSpeedDialActionProperties } from "devextreme/ui/speed_dial_action";
import dxSparkLine, { Properties as dxSparkLineProperties } from "devextreme/viz/sparkline";
import dxScrollView, { Properties as dxScrollViewProperties } from "devextreme/ui/scroll_view";
import dxScheduler, { Properties as dxSchedulerProperties } from "devextreme/ui/scheduler";
import dxSankey, { Properties as dxSankeyProperties } from "devextreme/viz/sankey";
import dxPopup, { Properties as dxPopupProperties } from "devextreme/ui/popup";
import dxPopOver, { Properties as dxPopOverProperties } from "devextreme/ui/popover";
import dxPolarChart, { Properties as dxPolarChartProperties } from "devextreme/viz/polar_chart";
import dxPieChart, { Properties as dxPieChartProperties } from "devextreme/viz/pie_chart";
import dxMultiView, { Properties as dxMultiViewProperties } from "devextreme/ui/multi_view";
import dxMenu, { Properties as dxMenuProperties } from "devextreme/ui/menu";
import dxMap, { Properties as dxMapProperties } from "devextreme/ui/map";
import dxLookup, { Properties as dxLookupProperties } from "devextreme/ui/lookup";
import dxLoadPanel, { Properties as dxLoadPanelProperties } from "devextreme/ui/load_panel";
import dxLoadIndicator, { Properties as dxLoadIndicatorProperties } from "devextreme/ui/load_indicator";
import dxList, { Properties as dxListProperties } from "devextreme/ui/list";
import dxGantt, { Properties as dxGanttProperties } from "devextreme/ui/gantt";
import { tasks, dependencies, resources, resourceAssignments } from "../data/ganttData";
import dxGallery, { Properties as dxGalleryProperties } from "devextreme/ui/gallery";
import dxFunnel, { Properties as dxFunnelProperties } from "devextreme/viz/funnel";
import dxFileManager, { Properties as dxFileManagerProperties } from "devextreme/ui/file_manager";
import dxDiagram, { Properties as dxDiagramProperties } from "devextreme/ui/diagram";
import dxDataGrid, { Properties as dxDataGridProperties } from "devextreme/ui/data_grid";
import dxContextMenu, { Properties as dxContextMenuProperties } from "devextreme/ui/context_menu";
import dxChart, { Properties as dxChartProperties } from "devextreme/viz/chart";
import dxButton, { Properties as dxButtonProperties } from "devextreme/ui/button";
import dxBarGauge, { Properties as dxBarGaugeProperties } from "devextreme/viz/bar_gauge";
import dxActionSheet, { Properties as dxActionSheetProperties } from "devextreme/ui/action_sheet";
import dxAccordion, { Properties as dxAccordionProperties } from "devextreme/ui/accordion";
import dxButtonGroup, { Properties as dxButtonGroupProperties } from "devextreme/ui/button_group";
import dxTooltip, { Properties as dxTooltipProperties } from "devextreme/ui/tooltip";
import dxPivotGrid, { Properties as dxPivotGridProperties } from "devextreme/ui/pivot_grid";
import dxDropDownButton, { Properties as dxDropDownButtonProperties } from "devextreme/ui/drop_down_button";
import dxDrawer, { Properties as dxDrawerProperties } from "devextreme/ui/drawer";

import { ComponentProps } from "../core/Form";
import { getNewTxnId, IdAttr, Vertex } from "../../lib/graph";
import { FormContext, PageContext } from "../../lib/Record";
import { getTextColumnValue } from "./GenaricInputField";
import { ActionCards } from "../../pages/home/components/ActionCards";
import { Navbar } from "../../pages/home/components/Navbar";
import {
  getChildVertex,
  getChildVertexes,
  getOptionLabel
} from "../../lib/Traverse";
import {
  TodaysEnergizer
} from "../../pages/home/components/TodaysEnergizerSection";
import { DynamicComponent } from "../dynamicForm";
import { replaceVertexProperties } from "../../lib/Vertex";
export const genericComponents2 = [
  "Box",
  "TreeMap",
  "VectorMap",
  "TreeView",
  "TreeList",
  "Toast",
  "TileView",
  "Tabs",
  "TabPanel",
  "SpeedDialAction",
  "SparkLine",
  "ScrollView",
  "Scheduler",
  "Sankey",
  "Popup",
  "PopOver",
  "PolarChart",
  "PieChart",
  "MultiView",
  // "SelectBox",
  "Menu",
  "Map",
  // "TagBox",
  "Lookup",
  "LoadPanel",
  "LoadIndicator",
  "List",
  "Gantt",
  "Gallery",
  "Funnel",
  "FileManager",
  "Diagram",
  "DataGrid",
  "ContextMenu",
  "Chart",
  "Button",
  "BarGauge",
  "ActionSheet",
  "Accordion",
  "ButtonGroup",
  "Tooltip",
  "PivotGrid",
  "DropDownButton",
  "Drawer",
  // "FilterBuilder",
  // "FileUploader",
]
const displayExpr = [
  "ContextMenu",
  "DropDownBox",
  "DropDownButton",
  "List",
  "Lookup",
  "Menu",
  "RadioGroup",
  "SelectBox",
  "TagBox",
  "TreeView",
];
const valueExpr = ["Autocomplete", "DropDownBox", "Lookup", "RadioGroup", "SelectBox", "TagBox"];
const dataSource = [
  "Accordion",
  "ActionSheet",
  "Autocomplete",
  "Box",
  "Chart",
  "ContextMenu",
  "DataGrid",
  "DropDownBox",
  "DropDownButton",
  "Funnel",
  "Gallery",
  "List",
  "Lookup",
  "Menu",
  "MultiView",
  "PieChart",
  "PivotGrid",
  "PivotGridFieldChooser",
  "PolarChart",
  "RadioGroup",
  "RangeSelector",
  "ResponsiveBox",
  "Sankey",
  "Scheduler",
  "SelectBox",
  "Sparkline",
  "TabPanel",
  "Tabs",
  "TagBox",
  "TileView",
  "Toolbar",
  "TreeList",
  "TreeMap",
  "TreeView",
];
const items = [
  "Accordion",
  "ActionSheet",
  "Autocomplete",
  "Box",
  "ButtonGroup",
  "ContextMenu",
  "DropDownBox",
  "DropDownButton",
  "Form",
  "Gallery",
  "List",
  "Lookup",
  "Menu",
  "MultiView",
  "RadioGroup",
  "ResponsiveBox",
  "SelectBox",
  "TabPanel",
  "Tabs",
  "TagBox",
  "TileView",
  "Toolbar",
  "TreeView",
  "ValidationSummary",
];
// onlyItemsAndNotDataSource = ['ButtonGroup', 'Form', 'ValidationSummary']
// onlyDataSourceAndNotItems = ['Chart', 'DataGrid', 'Funnel', 'PieChart', 'PivotGrid', 'PivotGridFieldChooser', 'PolarChart', 'RangeSelector', 'Sankey', 'Scheduler', 'Sparkline', 'TreeList', 'TreeMap']

const displayExpr1 = ["DropDownBox", "RadioGroup", "SelectBox"];
const valueExpr1 = ["Autocomplete", "DropDownBox", "RadioGroup", "SelectBox"];
// RangeSelector dont have items property, so we will not support it.
const dataSource1 = ["Autocomplete", "DropDownBox", "RadioGroup", "RangeSelector", "SelectBox"];
const items1 = ["Autocomplete", "DropDownBox", "RadioGroup", "SelectBox"];

// Do not specify the items property if you specified the dataSource, and vice versa.
// its best to use dataSource but we are using items for simplicity.

export const PageItemRender = (props: {metaVertex: Vertex}) => {
  if (!props.metaVertex.L) return;

  // children:
  const attributesResult = getChildVertexes(["$0Attr"], [props.metaVertex]);

  return <><For each={attributesResult.vertexes}>
    {item => {
      const compProps = (getChildVertexes(["$0Prop"], [item]).vertexes || []).reduce((acc, curr) => {
        const key = getOptionLabel(curr, "->$0Key:P.key");
        if (key) {
          acc[key] = curr.P.value;
        }
        return acc;
      }, {} as { [key: string]: any });
      replaceVertexProperties(getNewTxnId(), item.id, { props: compProps });

      return <><DynamicComponent
       meta={item}
       data={{P:{}}}
       setValue={_=>0}
       disabled={false}
       component={item.P.component || getChildVertex(['$0Comp'], item).vertex?.P[IdAttr]}
      /></>
  }}
  </For></>
}

export function GenericField(props: ComponentProps & { component?: string; disabled?: boolean; children?: JSXElement, [key: string]: any }) {
  const formContext = useContext(FormContext);
  let { events } = useContext(PageContext);
  const component = createMemo(() => props.component || props.meta.P.component)
  return (

      <Show when={!props.disabled} fallback={getTextColumnValue(props.data.P[props.meta.P[IdAttr]])}>
        <Switch>
          <Match when={component()==="NavBar"}>
            <Navbar meta={props.meta} data={props.data}/>
          </Match>
          <Match when={component()==="ActionCard"}>
            <ActionCards meta={props.meta} data={props.data} />
          </Match>
          <Match when={component()==="TodaysEnergizer"}>
            <TodaysEnergizer meta={props.meta} data={props.data} />
          </Match>
          <Match when={true}>
            <div
             class={props.meta?.P.props?.class || ''}
             // @ts-ignore
             ref={(el) => {
               let attributes: any = {

               };
               let comp: any;

               if (component() === "Box") {
                 // https://github.com/DevExpress/DevExtreme/blob/23_1/js/ui/box.js#L273
                 // Box only support items properly, if we use children it use it as template and all the events are removed.
                 // so don't use the box component.
                 return
                 comp = dxBox;
                 Object.assign(attributes, {
                   // direction: "row",
                   // height: 100,
                 } as dxBoxProperties);
               } else if (component() === "1") {
                 comp = dxLoadPanel;
                 Object.assign(attributes, {} as dxLoadPanelProperties);
               } else if (component() === "1") {
                 comp = dxLoadPanel;
                 Object.assign(attributes, {} as dxLoadPanelProperties);
               } else if (component() === "TreeMap") {
                 comp = dxTreeMap;
                 // const treeMapData = [
                 //   {
                 //     name: "Fruits",
                 //     items: [
                 //       {
                 //         name: "Apples",
                 //         value: 4,
                 //       },
                 //       {
                 //         name: "Oranges",
                 //         value: 10,
                 //       },
                 //       {
                 //         name: "Lemons",
                 //         value: 6,
                 //       },
                 //     ],
                 //   },
                 //   {
                 //     name: "Vegetables",
                 //     items: [
                 //       {
                 //         name: "Cucumbers",
                 //         value: 4,
                 //       },
                 //       {
                 //         name: "Tomatoes",
                 //         value: 8,
                 //       },
                 //       {
                 //         name: "Turnips",
                 //         value: 7,
                 //       },
                 //     ],
                 //   },
                 // ];
                 Object.assign(attributes, {} as dxTreeMapProperties);
               } else if (component() === "VectorMap") {
                 comp = dxVectorMap;
                 Object.assign(attributes, {
                   // bounds: [-180, 85, 180, -60],
                   // tooltip: {
                   //   enabled: true,
                   //   border: {
                   //     visible: false,
                   //   },
                   //   font: { color: "#fff" },
                   // },
                   // layers: {
                   //   type: "area",
                   //   dataSource: "https://js.devexpress.com/Content/data/vectorMap-sources/world.txt",
                   // },
                 } as dxVectorMapProperties);
               } else if (component() === "TreeView") {
                 const syncSelection = (treeViewInstance: dxTreeView) => {
                   // console.log(treeViewInstance);
                   const selectedItems = treeViewInstance.getSelectedNodes().map((node) => node.itemData);

                   // const selectedKeys = selectedItems.map((item: any) => item.key);
                   // treeViewInstance.selectItem(selectedKeys);
                   console.log(selectedItems);
                   props.setValue(props.meta,props.data, selectedItems);
                 };
                 comp = dxTreeView;
                 Object.assign(attributes, {
                   width: 340,
                   height: 320,
                   showCheckBoxesMode: "normal",
                   onSelectionChanged: (e) => {
                     syncSelection(e.component);
                   },
                   onContentReady: (e) => {
                     syncSelection(e.component);
                   },
                   itemTemplate: (item) => {
                     return `<div>${item.fullName} (${item.position})</div>`;
                   },

                 } as dxTreeViewProperties);
               } else if (component() === "TreeList") {
                 comp = dxTreeList;
                 // const treeListData = [
                 //   {
                 //     id: 1,
                 //     parentId: 0,
                 //     fullName: "John Heart",
                 //     position: "CEO",
                 //     email: "jheart@dx-email.com",
                 //   },
                 //   {
                 //     id: 2,
                 //     parentId: 1,
                 //     fullName: "Samantha Bright",
                 //     position: "COO",
                 //     email: "samanthab@dx-email.com",
                 //   },
                 //   {
                 //     id: 3,
                 //     parentId: 1,
                 //     fullName: "Arthur Miller",
                 //     position: "CTO",
                 //     email: "arthurm@dx-email.com",
                 //   },
                 //   {
                 //     id: 4,
                 //     parentId: 1,
                 //     fullName: "Robert Reagan",
                 //     position: "CMO",
                 //     email: "robertr@dx-email.com",
                 //   },
                 //   {
                 //     id: 5,
                 //     parentId: 2,
                 //     fullName: "Greta Sims",
                 //     position: "HR Manager",
                 //     email: "gretas@dx-email.com",
                 //   },
                 // ];
                 Object.assign(attributes, {
                   showRowLines: true,
                   autoExpandAll: true,
                   columns: ["position", "fullName", "email"],
                   searchPanel: {
                     visible: true,
                     width: 250,
                   },
                   headerFilter: {
                     visible: true,
                   },
                 } as dxTreeListProperties);
               } else if (component() === "Toast") {
                 comp = dxToast;
                 Object.assign(attributes, {
                   displayTime: 20000,
                   message: "Toast message",
                   type: "info",
                   visible: false,
                 } as dxToastProperties);
                 // use instance.show() method to display toast
               } else if (component() === "TileView") {
                 comp = dxTileView;
                 const tileViewData = [
                   {
                     ID: "1",
                     Address: "652 Avonwick Gate",
                     City: "Toronto",
                     State: "ON",
                     Price: 780000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/1.jpg",
                   },
                   {
                     ID: "2",
                     Address: "328 S Kerema Ave",
                     City: "Milford",
                     State: "CT",
                     Price: 350000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/3.jpg",
                   },
                   {
                     ID: "3",
                     Address: "8512 Tanglewood Cir",
                     City: "Reform",
                     State: "AL",
                     Price: 250000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/6.jpg",
                     widthRatio: 2,
                   },
                   {
                     ID: "4",
                     Address: "6351 Forrest St",
                     City: "Jersey City",
                     State: "NJ",
                     Price: 320000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/14.jpg",
                   },
                   {
                     ID: "5",
                     Address: "61207 16th St N",
                     City: "Moorhead",
                     State: "MN",
                     Price: 1700000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/5.jpg",
                     heightRatio: 2,
                     widthRatio: 2,
                   },
                   {
                     ID: "6",
                     Address: "5119 Beryl Dr",
                     City: "San Antonio",
                     State: "TX",
                     Price: 455000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/4.jpg",
                   },
                   {
                     ID: "7",
                     Address: "7121 Bailey St",
                     City: "Worcester",
                     State: "MA",
                     Price: 555000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/7.jpg",
                   },
                   {
                     ID: "8",
                     Address: "82649 Topeka St",
                     City: "Riverbank",
                     State: "CA",
                     Price: 1750000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/2.jpg",
                     heightRatio: 2,
                   },
                   {
                     ID: "9",
                     Address: "7700 Elmwood Dr",
                     City: "Cleveland",
                     State: "OK",
                     Price: 470000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/17.jpg",
                     heightRatio: 2,
                     widthRatio: 2,
                   },
                   {
                     ID: "10",
                     Address: "620201 Plymouth Rd",
                     City: "Detroit",
                     State: "MI",
                     Price: 610000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/8.jpg",
                   },
                   {
                     ID: "11",
                     Address: "1198 Theresa Cir",
                     City: "Whitinsville",
                     State: "MA",
                     Price: 320000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/9.jpg",
                   },
                   {
                     ID: "12",
                     Address: "4815 Warbler Ln",
                     City: "Rockport",
                     State: "TX",
                     Price: 700000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/12.jpg",
                   },
                   {
                     ID: "13",
                     Address: "420234 Rogge St",
                     City: "Detroit",
                     State: "MI",
                     Price: 320000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/23.jpg",
                   },
                   {
                     ID: "14",
                     Address: "114840 Interlake Ave N",
                     City: "Seattle",
                     State: "WA",
                     Price: 400000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/22.jpg",
                   },
                   {
                     ID: "15",
                     Address: "13673 Pearl Dr #7",
                     City: "Monroe",
                     State: "MI",
                     Price: 399000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/20.jpg",
                   },
                   {
                     ID: "16",
                     Address: "15447 Via Viento",
                     City: "Atascadero",
                     State: "CA",
                     Price: 1100000,
                     ImageSrc: "https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/gallery/21.jpg",
                   },
                 ];

                 Object.assign(attributes, {
                   height: 350,
                   itemTemplate: (itemData, itemIndex, itemElement) => {
                     console.log("itemData", itemData, itemElement);
                     const imageDiv = <div></div>;
                     imageDiv.style.backgroundImage = "url(" + itemData.ImageSrc + ")";
                     imageDiv.style.height = "100%";
                     imageDiv.style.width = "100%";
                     imageDiv.style.backgroundPosition = "center";
                     imageDiv.style.backgroundSize = "cover";
                     imageDiv.style.display = "block";
                     itemElement.append(imageDiv);
                   },
                 } as dxTileViewProperties);
               } else if (component() === "Tabs") {
                 comp = dxTabs;
                 const tabsData = [
                   {
                     text: "Home",
                     icon: "home",
                   },
                   {
                     text: "About",
                     icon: "info",
                   },
                 ];
                 Object.assign(attributes, {
                   onSelectionChanged(e) {
                     props.setValue(props.meta, props.data,e.addedItems[0].text);
                   },
                 } as dxTabsProperties);
               } else if (component() === "TabPanel") {
                 comp = dxTabPanel;
                 const tabPanelData = [
                   {
                     title: "Info",
                     text: "John Smith, 1986",
                   },
                   {
                     title: "Contacts",
                     text: "phone: (555)555-5555, email: John.Smith@example.com",
                   },
                   {
                     title: "Address",
                     text: "CA San Francisco Stanford Ave",
                   },
                 ];
                 Object.assign(attributes, {
                   height: 260,
                   onSelectionChanged(e) {
                     props.setValue(props.meta, props.data,e.addedItems[0].text);
                   },
                 } as dxTabPanelProperties);
               } else if (component() === "SpeedDialAction") {
                 comp = dxSpeedDialAction;
                 Object.assign(attributes, {
                   icon: "tel",
                   onClick(e) {
                     console.log("Click");
                   },
                 } as dxSpeedDialActionProperties);
               } else if (component() === "SparkLine") {
                 comp = dxSparkLine;

                 const sparkLineItems = [
                   {
                     arg: "1",
                     val: 1,
                   },
                   {
                     arg: "2",
                     val: 2,
                   },
                   {
                     arg: "3",
                     val: 8,
                   },
                   {
                     arg: "4",
                     val: 4,
                   },
                   {
                     arg: "5",
                     val: 5,
                   },
                   {
                     arg: "6",
                     val: 2,
                   },
                   {
                     arg: "7",
                     val: 7,
                   },
                   {
                     arg: "8",
                     val: 3,
                   },
                 ];
                 Object.assign(attributes, {} as dxSparkLineProperties);
               } else if (component() === "ScrollView") {
                 comp = dxScrollView;
                 Object.assign(attributes, {
                   height: 100,
                   scrollByContent: true,
                   scrollByThumb: true,
                   showScrollbar: "onScroll",
                   onReachBottom: (e) => {
                     setTimeout(() => {
                       document.getElementById("scrollview-content")!.append("Content has been updated on the event.");
                       e.component.release();
                     }, 500);
                   },
                   reachBottomText: "Updating...",
                 } as dxScrollViewProperties);
               } else if (component() === "Scheduler") {
                 comp = dxScheduler;
                 Object.assign(attributes, {} as dxSchedulerProperties);
               } else if (component() === "Sankey") {
                 comp = dxSankey;
                 const sankeyData = [
                   {
                     source: "Brazil",
                     target: "Portugal",
                     weight: 5,
                   },
                   {
                     source: "Brazil",
                     target: "France",
                     weight: 1,
                   },
                   {
                     source: "Brazil",
                     target: "Spain",
                     weight: 1,
                   },
                   {
                     source: "Brazil",
                     target: "England",
                     weight: 1,
                   },
                   {
                     source: "Canada",
                     target: "Portugal",
                     weight: 1,
                   },
                   {
                     source: "Canada",
                     target: "France",
                     weight: 5,
                   },
                   {
                     source: "Canada",
                     target: "England",
                     weight: 1,
                   },
                   {
                     source: "Mexico",
                     target: "Portugal",
                     weight: 1,
                   },
                   {
                     source: "Mexico",
                     target: "France",
                     weight: 1,
                   },
                   {
                     source: "Mexico",
                     target: "Spain",
                     weight: 5,
                   },
                   {
                     source: "Mexico",
                     target: "England",
                     weight: 1,
                   },
                 ];

                 Object.assign(attributes, {
                   link: {
                     colorMode: "gradient",
                   },
                 } as dxSankeyProperties);
               } else if (component() === "Popup") {
                 comp = dxPopup;
                 Object.assign(attributes, {
                   visible: false,
                   contentTemplate: () => {
                     return "<div>Some popup message</div>";
                   },
                   width: 200,
                   height: 200,
                   showTitle: true,
                   title: "Popup",
                   dragEnabled: true,
                   closeOnOutsideClick: true,
                   showCloseButton: true,
                   position: {
                     at: "bottom",
                     my: "center",
                     collision: "fit",
                   },
                   toolbarItems: [
                     {
                       locateInMenu: "always",
                       widget: "dxButton",
                       toolbar: "top",
                       options: {
                         text: "More info",
                         onClick() {
                           console.log(`More info is clicked`);
                         },
                       },
                     },
                     {
                       widget: "dxButton",
                       toolbar: "bottom",
                       location: "before",
                       options: {
                         icon: "email",
                         text: "Send",
                         onClick() {
                           console.log(`Email is sent to`);
                         },
                       },
                     },
                     {
                       widget: "dxButton",
                       toolbar: "bottom",
                       location: "after",
                       options: {
                         text: "Close",
                         onClick() {
                           instance.hide();
                         },
                       },
                     },
                   ],
                 } as dxPopupProperties);
                 // use instance.show() to display popup.
               } else if (component() === "PopOver") {
                 comp = dxPopOver;
                 // <p><span id="subject1">Google AdWords Strategy</span> (<a id="link1">details</a>)</p>
                 Object.assign(attributes, {
                   target: "#link1",
                   showEvent: "mouseenter",
                   hideEvent: "mouseleave",
                   position: "top",
                   width: 300,
                 } as dxPopOverProperties);
                 // add some children and it will display when we click on the link
               } else if (component() === "PolarChart") {
                 comp = dxPolarChart;

                 const pivotGridItems = [
                   {
                     arg: "Monday",
                     val: 3,
                   },
                   {
                     arg: "Tuesday",
                     val: 2,
                   },
                   {
                     arg: "Wednesday",
                     val: 3,
                   },
                   {
                     arg: "Thursday",
                     val: 4,
                   },
                   {
                     arg: "Friday",
                     val: 6,
                   },
                   {
                     arg: "Saturday",
                     val: 11,
                   },
                   {
                     arg: "Sunday",
                     val: 4,
                   },
                 ];

                 Object.assign(attributes, {
                   series: [
                     {
                       argumentField: "arg",
                       valueField: "val",
                       type: "bar",
                     },
                   ],
                 } as dxPolarChartProperties);
               } else if (component() === "PieChart") {
                 comp = dxPieChart;

                 const pieChartData = [
                   {
                     arg: "Russia",
                     val: 12,
                   },
                   {
                     arg: "Canada",
                     val: 7,
                   },
                   {
                     arg: "USA",
                     val: 7,
                   },
                   {
                     arg: "China",
                     val: 7,
                   },
                   {
                     arg: "Brazil",
                     val: 6,
                   },
                   {
                     arg: "Australia",
                     val: 5,
                   },
                   {
                     arg: "India",
                     val: 2,
                   },
                   {
                     arg: "Others",
                     val: 55,
                   },
                 ];

                 Object.assign(attributes, {
                   legend: {
                     horizontalAlignment: "center",
                     verticalAlignment: "bottom",
                   },
                   series: {
                     argumentField: "arg",
                     valueField: "val",
                   },
                 } as dxPieChartProperties);
               } else if (component() === "MultiView") {
                 comp = dxMultiView;
                 const multiViewItems = [
                   {
                     ID: 1,
                     CompanyName: "SuprMart",
                     Address: "702 SW 8th Street",
                     City: "Bentonville",
                     State: "Arkansas",
                     Zipcode: 72716,
                     Phone: "(800) 555-2797",
                     Fax: "(800) 555-2171",
                     Website: "http://www.nowebsitesupermart.com",
                   },
                   {
                     ID: 2,
                     CompanyName: "El'Depot",
                     Address: "2455 Paces Ferry Road NW",
                     City: "Atlanta",
                     State: "Georgia",
                     Zipcode: 30339,
                     Phone: "(800) 595-3232",
                     Fax: "(800) 595-3231",
                     Website: "http://www.nowebsitedepot.com",
                   },
                   {
                     ID: 3,
                     CompanyName: "K&S Music",
                     Address: "1000 Nicllet Mall",
                     City: "Minneapolis",
                     State: "Minnesota",
                     Zipcode: 55403,
                     Phone: "(612) 304-6073",
                     Fax: "(612) 304-6074",
                     Website: "http://www.nowebsitemusic.com",
                   },
                   {
                     ID: 4,
                     CompanyName: "Tom Club",
                     Address: "999 Lake Drive",
                     City: "Issaquah",
                     State: "Washington",
                     Zipcode: 98027,
                     Phone: "(800) 955-2292",
                     Fax: "(800) 955-2293",
                     Website: "http://www.nowebsitetomsclub.com",
                   },
                 ];

                 Object.assign(attributes, {
                   onItemClick: (e: any) => {
                     props.setValue(props.meta, props.data,e.itemData);
                   },
                   height: 300,
                   selectedIndex: 0,
                   loop: false,
                   animationEnabled: true,
                   itemTemplate: (itemData: any, itemIndex: number, itemElement: any) => {
                     itemElement.innerHTML = `
                <h3>${itemData.CompanyName}</h3>
                <p>${itemData.City}</p>
                <p>${itemData.Address}</p>
                <p>${itemData.City}</p>
                <p>${itemData.State}</p>
                <p>${itemData.Zipcode}</p>
                <p> ${itemData.Phone}</p>
              `;
                   },
                   onSelectionChanged(e) {
                     props.setValue(props.meta,props.data, e.addedItems[0]);
                   },
                 } as dxMultiViewProperties);
                 // } else if(component() === "SelectBox" ) {
                 //  comp = dxSelectBox;
                 //  Object.assign(attributes, {} as dxSelectBoxProperties);
               } else if (component() === "Menu") {
                 comp = dxMenu;

                 const menuData = [
                   {
                     text: "Video Players",
                   },
                   {
                     text: "Televisions",
                   },
                   {
                     text: "Monitors",
                     items: [
                       {
                         text: "DesktopLCD 19",
                       },
                       {
                         text: "DesktopLCD 21",
                       },
                       {
                         text: "DesktopLED 21",
                       },
                     ],
                   },
                 ];

                 Object.assign(attributes, {
                   onItemClick: (e: any) => {
                     props.setValue(props.meta, props.data,e.itemData);
                   },
                 } as dxMenuProperties);
               } else if (component() === "Map") {
                 comp = dxMap;
                 Object.assign(attributes, {
                   provider: "bing",
                   type: "satellite",
                 } as dxMapProperties);
                 // } else if(component() === "TagBox" ) {
                 //  comp = dxTagBox;
                 //  Object.assign(attributes, {} as dxTagBoxProperties);
               } else if (component() === "Lookup") {
                 comp = dxLookup;

                 const lookupData = [
                   "Prepare 2013 Financial",
                   "Prepare 3013 Marketing Plan",
                   "Update Personnel Files",
                   "Review Health Insurance Options Under the Affordable Care Act",
                   "Choose between PPO and HMO Health Plan",
                   "Google AdWords Strategy",
                   "New Brochures",
                   "2013 Brochure Designs",
                   "Brochure Design Review",
                   "Website Re-Design Plan",
                   "Rollout of New Website and Marketing Brochures",
                   "Update Sales Strategy Documents",
                   "Create 2012 Sales Report",
                   "Direct vs Online Sales Comparison Report",
                 ];

                 Object.assign(attributes, {
                   onItemClick: (e: any) => {
                     props.setValue(props.meta, props.data,e.itemData);
                   },
                 } as dxLookupProperties);
               } else if (component() === "LoadPanel") {
                 comp = dxLoadPanel;
                 // set on container: style={{ padding: "10px" }}
                 Object.assign(attributes, {
                   showIndicator: true,
                   showPane: true,
                   shading: true,
                   hideOnOutsideClick: false,
                   message: "Loading...",
                   position: { of: el },
                   onShown: () => {
                     console.log("shown");
                     setTimeout(() => {
                       instance.hide();
                     }, 0);
                   },
                   onHidden: () => {
                     console.log("hidden");
                   },
                 } as dxLoadPanelProperties);
               } else if (component() === "LoadIndicator") {
                 comp = dxLoadIndicator;
                 Object.assign(attributes, {
                   width: 100,
                   visible: true,
                 } as dxLoadIndicatorProperties);
               } else if (component() === "List") {
                 comp = dxList;

                 const listData = [
                   "Prepare 2013 Financial",
                   "Prepare 3013 Marketing Plan",
                   "Update Personnel Files",
                   "Review Health Insurance Options Under the Affordable Care Act",
                   "Choose between PPO and HMO Health Plan",
                   "Google AdWords Strategy",
                   "New Brochures",
                   "2013 Brochure Designs",
                   "Brochure Design Review",
                   "Website Re-Design Plan",
                   "Rollout of New Website and Marketing Brochures",
                   "Update Sales Strategy Documents",
                   "Create 2012 Sales Report",
                   "Direct vs Online Sales Comparison Report",
                 ];

                 Object.assign(attributes, {
                   onItemClick: (e: any) => {
                     props.setValue(props.meta, props.data,e.itemData);
                   },
                 } as dxListProperties);
               } else if (component() === "Gantt") {
                 comp = dxGantt;

                 const ganttData = [
                   {
                     id: 1,
                     title: "Market Analysis",
                     start: "2019-01-05",
                     end: "2019-01-13",
                     progress: 100,
                   },
                   {
                     id: 2,
                     title: "Feature Planning",
                     start: "2019-01-13",
                     end: "2019-02-02",
                     progress: 100,
                   },
                   {
                     id: 3,
                     title: "Implementation",
                     start: "2019-02-02",
                     end: "2019-03-21",
                     progress: 35,
                   },
                   {
                     id: 4,
                     title: "Demos",
                     start: "2019-02-28",
                     end: "2019-03-21",
                     progress: 0,
                   },
                   {
                     id: 5,
                     title: "Docs",
                     start: "2019-02-28",
                     end: "2019-03-21",
                     progress: 0,
                   },
                   {
                     id: 6,
                     title: "Testing",
                     start: "2019-03-21",
                     end: "2019-04-05",
                     progress: 0,
                   },
                   {
                     id: 7,
                     title: "Bug Fixing",
                     start: "2019-03-21",
                     end: "2019-04-15",
                     progress: 0,
                   },
                   {
                     id: 8,
                     title: "Feature Release",
                     start: "2019-04-15",
                     end: "2019-04-15",
                   },
                 ];

                 Object.assign(attributes, {

                   tasks: {
                     dataSource: tasks,
                   },
                   dependencies: {
                     dataSource: dependencies,
                   },
                   resources: {
                     dataSource: resources,
                   },
                   resourceAssignments: {
                     dataSource: resourceAssignments,
                   },
                   editing: {
                     enabled: true,
                   },
                   validation: {
                     autoUpdateParentTasks: true,
                   },
                   toolbar: {
                     items: [
                       "undo",
                       "redo",
                       "separator",
                       "collapseAll",
                       "expandAll",
                       "separator",
                       "addTask",
                       "deleteTask",
                       "separator",
                       "zoomIn",
                       "zoomOut",
                     ],
                   },
                   columns: [
                     {
                       dataField: "title",
                       caption: "Subject",
                       width: 300,
                     },
                     {
                       dataField: "start",
                       caption: "Start Date",
                     },
                     {
                       dataField: "end",
                       caption: "End Date",
                     },
                   ],
                   scaleType: "weeks",
                   taskListWidth: 500,
                 } as dxGanttProperties);
               } else if (component() === "Gallery") {
                 comp = dxGallery;
                 const galleryData = [
                   "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person2.png",
                   "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person1.png",
                   "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person3.png",
                   "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person4.png",
                 ];

                 Object.assign(attributes, {
                   height: 400,
                   dataSource: galleryData
                 } as dxGalleryProperties);
               } else if (component() === "Funnel") {
                 comp = dxFunnel;
                 const funnelData = [
                   {
                     action: "Visited the Website",
                     users: 9152,
                   },
                   {
                     action: "Downloaded a Trial",
                     users: 6879,
                   },
                   {
                     action: "Contacted Support",
                     users: 5121,
                   },
                   {
                     action: "Subscribed",
                     users: 2224,
                   },
                   {
                     action: "Renewed",
                     users: 1670,
                   },
                 ];

                 Object.assign(attributes, {
                   argumentField: "action",
                   label: {
                     backgroundColor: "none",
                     customizeText: function (e) {
                       // @ts-ignore
                       return e.item.argument + "<br />" + e.item.value;
                     },
                     position: "inside",
                   },
                   valueField: "users",
                 } as dxFunnelProperties);
               } else if (component() === "FileManager") {
                 comp = dxFileManager;

                 const fileManagerData = [
                   {
                     name: "Documents",
                     isDirectory: true,
                     items: [
                       {
                         name: "Projects",
                         isDirectory: true,
                         items: [
                           {
                             name: "About.rtf",
                             isDirectory: false,
                           },
                           {
                             name: "Passwords.rtf",
                             isDirectory: false,
                           },
                         ],
                       },
                       {
                         name: "About.xml",
                         isDirectory: false,
                       },
                       {
                         name: "Managers.rtf",
                         isDirectory: false,
                       },
                       {
                         name: "ToDo.txt",
                         isDirectory: false,
                       },
                     ],
                   },
                   {
                     name: "Images",
                     isDirectory: true,
                     items: [
                       {
                         name: "logo.png",
                         isDirectory: false,
                       },
                       {
                         name: "banner.gif",
                         isDirectory: false,
                       },
                     ],
                   },
                   {
                     name: "System",
                     isDirectory: true,
                     items: [
                       {
                         name: "Employees.txt",
                         isDirectory: false,
                       },
                       {
                         name: "PasswordList.txt",
                         isDirectory: false,
                       },
                     ],
                   },
                   {
                     name: "Description.rtf",
                     isDirectory: false,
                   },
                   {
                     name: "Description.txt",
                     isDirectory: false,
                   },
                 ];

                 Object.assign(attributes, {
                   fileSystemProvider: props.data.P[props.meta.P[IdAttr]],
                   itemView: {
                     mode: "thumbnails",
                   },
                   permissions: {
                     create: true,
                     copy: true,
                     move: true,
                     rename: true,
                   },
                 } as dxFileManagerProperties);
                 // createEffect(() => instance.option("fileSystemProvider", props.data.P[props.meta.P[IdAttr]]));
               } else if (component() === "Diagram") {
                 comp = dxDiagram;

                 const diagramData = [
                   {
                     id: "125",
                     from: "101",
                     to: "102",
                   },
                   {
                     id: "127",
                     from: "101",
                     to: "103",
                   },
                   {
                     id: "129",
                     from: "103",
                     to: "104",
                   },
                   {
                     id: "130",
                     from: "103",
                     to: "105",
                   },
                   {
                     id: "139",
                     from: "102",
                     to: "106",
                   },
                   {
                     id: "140",
                     from: "102",
                     to: "107",
                   },
                 ];

                 Object.assign(attributes, {} as dxDiagramProperties);
               } else if (component() === "DataGrid") {
                 comp = dxDataGrid;
                 Object.assign(attributes, {} as dxDataGridProperties);
               } else if (component() === "ContextMenu") {
                 comp = dxContextMenu;

                 const contextMenuData = [
                   {
                     text: "Hide",
                   },
                   {
                     text: "Delete",
                   },
                   {
                     text: "Clipboard",
                     items: [
                       {
                         text: "Copy",
                       },
                       {
                         text: "Clear",
                       },
                       {
                         text: "Paste",
                       },
                     ],
                   },
                 ];
                 Object.assign(attributes, {
                   visible: true,
                   onItemClick: (e: any) => {
                     props.setValue(props.meta, props.data,e.itemData.text);
                   },
                 } as dxContextMenuProperties);
               } else if (component() === "Chart") {
                 comp = dxChart;

                 const chartDataSource = [
                   {
                     day: "Monday",
                     oranges: 3,
                   },
                   {
                     day: "Tuesday",
                     oranges: 2,
                   },
                   {
                     day: "Wednesday",
                     oranges: 3,
                   },
                   {
                     day: "Thursday",
                     oranges: 4,
                   },
                   {
                     day: "Friday",
                     oranges: 6,
                   },
                   {
                     day: "Saturday",
                     oranges: 11,
                   },
                   {
                     day: "Sunday",
                     oranges: 4,
                   },
                 ];
                 Object.assign(attributes, {
                   series: {
                     argumentField: "day",
                     valueField: "oranges",
                     name: "My oranges",
                     type: props.meta.P.props["type"] || "bar",
                     color: "#ffaa66",
                   },
                 } as dxChartProperties);
               } else if (component() === "Button") {
                 comp = dxButton;
                 Object.assign(attributes, {
                   onClick: props.onClick,
                 } as dxButtonProperties);
               } else if (component() === "BarGauge") {
                 comp = dxBarGauge;
                 // [47.27, 65.32, 84.59, 71.86]
                 Object.assign(attributes, {
                   startValue: 0,
                   endValue: 100,
                   values: props.data.P[props.meta.P[IdAttr]],
                   label: {
                     indent: 30,
                     format: {
                       type: "fixedPoint",
                       precision: 1,
                     },
                     customizeText(arg) {
                       return `${arg.valueText} %`;
                     },
                   },
                   export: {
                     enabled: true,
                   },
                   title: {
                     text: "Series' Ratings",
                     font: {
                       size: 28,
                     },
                   },
                 } as dxBarGaugeProperties);
               } else if (component() === "ActionSheet") {
                 comp = dxActionSheet;
                 Object.assign(attributes, {
                   title: "Choose action",
                   onCancelClick: () => {
                     props.setValue(props.meta, props.data,"Cancel");
                   },
                   onItemClick: (e: any) => {
                     props.setValue(props.meta,props.data, e.itemData.text);
                   },
                 } as dxActionSheetProperties);
               } else if (component() === "Accordion") {
                 comp = dxAccordion;
                 Object.assign(attributes, {
                   animationDuration: 300,
                   collapsible: true,
                   multiple: false,
                   selectedItems: [props.data.P[props.meta.P[IdAttr]][0]],

                   itemTitleTemplate: (itemData: any, itemIndex: number, itemElement: any) => {
                     itemElement.innerHTML = `
                ${itemData.CompanyName}
              `;
                     itemElement.style.height = "40px";
                   },
                   itemTemplate: (itemData: any, itemIndex: number, itemElement: any) => {
                     itemElement.innerHTML = `
                <h3>${itemData.CompanyName}</h3>
                <p>${itemData.City}</p>
                <p>${itemData.Address}</p>
                <p>${itemData.City}</p>
                <p>${itemData.State}</p>
                <p>${itemData.Zipcode}</p>
                <p> ${itemData.Phone}</p>
              `;
                   },
                   onSelectionChanged: (e: any) => {
                     props.setValue(props.meta, props.data,e.addedItems[0]);
                   },
                 } as dxAccordionProperties);

               } else if (component() === "ButtonGroup") {
                 comp = dxButtonGroup;
                 Object.assign(attributes, {
                   items: [],
                   selectionMode: "none",

                   onItemClick: (e) => {
                     // onClick: (item: any) => void;
                     props.onClick?.(e.itemData);
                   },
                 } as dxButtonGroupProperties);


               } else if (component() === "Tooltip") {
                 comp = dxTooltip;
                 Object.assign(attributes, {
                   target: "#target-item",
                   showEvent: "mouseenter",
                   hideEvent: "mouseleave",
                   hideOnOutsideClick: false,
                   position: "top",
                   contentTemplate: (e: any) => {
                     e.component.option("contentTemplate", null);
                     return props.data.P[props.meta.P[IdAttr]];
                   },
                 } as dxTooltipProperties);
               } else if (component() === "PivotGrid") {
                 comp = dxPivotGrid;

                 const pivotGridItems = {
                   fields: [
                     {
                       dataField: "[Product].[Category]",
                       area: "row",
                     },
                     {
                       dataField: "[Product].[Subcategory]",
                       area: "row",
                     },
                     {
                       dataField: "[Ship Date].[Calendar Year]",
                       area: "column",
                     },
                     {
                       dataField: "[Ship Date].[Month of Year]",
                       area: "column",
                     },
                     {
                       dataField: "[Measures].[Customer Count]",
                       area: "data",
                     },
                   ],
                   store: {
                     type: "xmla",
                     url: "https://demos.devexpress.com/Services/OLAP/msmdpump.dll",
                     catalog: "Adventure Works DW Standard Edition",
                     cube: "Adventure Works",
                   },
                 };

                 Object.assign(attributes, {
                   fieldChooser: {
                     width: 400,
                   },
                   showBorders: true,
                 } as dxPivotGridProperties);
               } else if (component() === "DropDownButton") {
                 comp = dxDropDownButton;
                 const dropdownButtonData = [
                   {
                     id: 1,
                     name: "Left",
                     icon: "alignleft",
                   },
                   {
                     id: 4,
                     name: "Right",
                     icon: "alignright",
                   },
                   {
                     id: 2,
                     name: "Center",
                     icon: "aligncenter",
                   },
                   {
                     id: 3,
                     name: "Justify",
                     icon: "alignjustify",
                   },
                 ];
                 Object.assign(attributes, {
                   displayExpr: "name",
                   items: props.data.P[props.meta.P[IdAttr]],
                   keyExpr: "id",
                   selectedItemKey: 1,
                   stylingMode: "text",
                   useSelectMode: true,
                   width: 100,
                   onSelectionChanged: (e: any) => {
                     props.setValue(props.meta, props.data,e.item);
                   },
                 } as dxDropDownButtonProperties);
               } else if (
                // drawer has problem when it rendered, it dont know the proper height of the content so sidebar height is not proper.
                component() === "Drawer"
               ) {
                 comp = dxDrawer;
                 Object.assign(attributes, {} as dxDrawerProperties);
               } else if (component() === "1") {
                 comp = dxLoadPanel;
                 Object.assign(attributes, {} as dxLoadPanelProperties);
               } else {
                 console.warn("Component not found", component());
                 return "----";
               }
               // if (displayExpr.includes(component()) && !props.meta.P.props.displayExpr) {
               //  Object.assign(attributes, {displayExpr: ''});
               // }
               // if (valueExpr.includes(component()) && !props.meta.P.props.valueExpr) {
               //  Object.assign(attributes, {valueExpr: ''});
               // }
               // if (dataSource.includes(component()) && !props.meta.P.props.dataSource) {
               //  Object.assign(attributes, {dataSource: ''});
               // }
               // if (items.includes(component()) && !props.meta.P.props.items) {
               //  Object.assign(attributes, {items: ''});
               // }
               let instance: any;
               // createEffect needed for the drawer.else drawer is not working.
               createEffect(()=> {
                 instance = new comp(el, attributes);
                 if (props.ref) {
                   props.ref(instance);
                 }
                 window.www = instance
               })

               if (props.data?.P) {
                 if (component() === "Button") {
                   createEffect(() => {
                     instance.option("text", props.data!.P[props.meta.P[IdAttr]])
                   });
                 } else if (component() === "ButtonGroup") {
                   createEffect(() => instance.option("selectedItems", props.data!.P[props.meta.P[IdAttr]]));
                 }
               }

               createEffect(() => {
                 if(props.data?.P) {
                   let value = props.data.P[props.meta.P[IdAttr]];
                   if (component() === "FilterBuilder" || component() === "FileUploader") {
                     if (!value) value = [];
                     else if(!Array.isArray(value)) {
                       value = [value];
                     }
                   }
                   return instance.option("value", value);
                 }
               });
               createEffect(() => instance.option("disabled", props.disabled));

               createEffect(() => {
                 for (const property in props.meta.P.props as dxTreeMapProperties) {
                   let value = props.meta.P.props[property];
                   if (property === "items" && typeof value === "string") {
                     value = value.split("\n");
                   }
                   instance.option(property, value);
                 }
               });

               if (component() === "Drawer") {
                 if (events?.isSideBarOpen) {
                   createEffect(on(events.isSideBarOpen, (_) => instance.toggle(), { defer: true }));
                 }
               }
               onCleanup(() => instance?.dispose());
             }}
            >
              <Switch>
                <Match when={component() === "Drawer"}>
                  {/* Min Height is set because drawer cant see height initially*/}
                  <div style={"min-height: 506px"}>
                    {props.children}
                    <PageItemRender metaVertex={props.meta}/>
                  </div>
                </Match>
                <Match when={true}>
                  {props.children}
                  <PageItemRender metaVertex={props.meta}/>
                </Match>
              </Switch>

            </div>
          </Match>
        </Switch>
      </Show>
  );
}
