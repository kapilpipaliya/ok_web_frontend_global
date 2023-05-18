import {
  createEffect,
  JSXElement,
  onCleanup,
  Show,
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


import Validator, { Properties as ValidatorProperties } from "devextreme/ui/validator";
import { FormContext } from "../dynamicForm";
import dxValidationGroup from "devextreme/ui/validation_group";
import { ValidationRule } from "devextreme/common";
import { ComponentProps } from "../core/Form";
import { IdAttr } from "../../lib/graph";

export const genericComponents = [
  "Autocomplete",
  "Bullet",
  "Calendar",
  "CheckBox",
  "CircularGauge",
  "ColorBox",
  "DateBox",
  "DropDownBox",
  "FileUploader",
  "FilterBuilder",
  "HtmlEditor",
  "LinearGauge",
  "NumberBox",
  "ProgressBar",
  "RadioGroup",
  "RangeSelector",
  "RangeSlider",
  "SelectBox",
  "Slider",
  "Switch",
  // "TagBox", // giving error with undefined values
  "TextArea",
  "TextBox",
];
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
const getTextColumnValue = (value: any) => {
  if (value === true) {
    return "True";
  } else if (value === false) {
    return "False";
  }
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    value = value.map((v) => getTextColumnValue(v)).join(", ");
  }

  return G.isObject(value) ? JSON.stringify(value) : value;
};
export function GenericField(props: ComponentProps & { component: string; disabled?: boolean; children?: JSXElement }) {
  const formContext = useContext(FormContext);
  return (

      <Show<boolean> when={!props.disabled} fallback={getTextColumnValue(props.data.properties[props.meta.properties[IdAttr]])}>
        <div
          // @ts-ignore
          ref={(el) => {
            let properties: any = {

            };
            let comp: any;

            if (props.component === "Box") {
              comp = dxBox;
              Object.assign(properties, {
                direction: "row",
                height: 100,
              } as dxBoxProperties);
            } else if (props.component === "1") {
              comp = dxLoadPanel;
              Object.assign(properties, {} as dxLoadPanelProperties);
            } else if (props.component === "1") {
              comp = dxLoadPanel;
              Object.assign(properties, {} as dxLoadPanelProperties);
            } else if (props.component === "TreeMap") {
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
              Object.assign(properties, {} as dxTreeMapProperties);
            } else if (props.component === "VectorMap") {
              comp = dxVectorMap;
              Object.assign(properties, {
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
            } else if (props.component === "TreeView") {
              const syncSelection = (treeViewInstance: dxTreeView) => {
                // console.log(treeViewInstance);
                const selectedItems = treeViewInstance.getSelectedNodes().map((node) => node.itemData);

                // const selectedKeys = selectedItems.map((item: any) => item.key);
                // treeViewInstance.selectItem(selectedKeys);
                console.log(selectedItems);
                props.setValue(props.meta, selectedItems);
              };
              comp = dxTreeView;
              Object.assign(properties, {
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
            } else if (props.component === "TreeList") {
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
              Object.assign(properties, {
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
            } else if (props.component === "Toast") {
              comp = dxToast;
              Object.assign(properties, {
                displayTime: 20000,
                message: "Toast message",
                type: "info",
                visible: false,
              } as dxToastProperties);
              // use instance.show() method to display toast
            } else if (props.component === "TileView") {
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

              Object.assign(properties, {
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
            } else if (props.component === "Tabs") {
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
              Object.assign(properties, {
                onSelectionChanged(e) {
                  props.setValue(props.meta, e.addedItems[0].text);
                },
              } as dxTabsProperties);
            } else if (props.component === "TabPanel") {
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
              Object.assign(properties, {
                height: 260,
                onSelectionChanged(e) {
                  props.setValue(props.meta, e.addedItems[0].text);
                },
              } as dxTabPanelProperties);
            } else if (props.component === "SpeedDialAction") {
              comp = dxSpeedDialAction;
              Object.assign(properties, {
                icon: "tel",
                onClick(e) {
                  console.log("Click");
                },
              } as dxSpeedDialActionProperties);
            } else if (props.component === "SparkLine") {
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
              Object.assign(properties, {} as dxSparkLineProperties);
            } else if (props.component === "ScrollView") {
              comp = dxScrollView;
              Object.assign(properties, {
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
            } else if (props.component === "Scheduler") {
              comp = dxScheduler;
              Object.assign(properties, {} as dxSchedulerProperties);
            } else if (props.component === "Sankey") {
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

              Object.assign(properties, {
                link: {
                  colorMode: "gradient",
                },
              } as dxSankeyProperties);
            } else if (props.component === "Popup") {
              comp = dxPopup;
              Object.assign(properties, {
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
            } else if (props.component === "PopOver") {
              comp = dxPopOver;
              // <p><span id="subject1">Google AdWords Strategy</span> (<a id="link1">details</a>)</p>
              Object.assign(properties, {
                target: "#link1",
                showEvent: "mouseenter",
                hideEvent: "mouseleave",
                position: "top",
                width: 300,
              } as dxPopOverProperties);
              // add some children and it will display when we click on the link
            } else if (props.component === "PolarChart") {
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

              Object.assign(properties, {
                series: [
                  {
                    argumentField: "arg",
                    valueField: "val",
                    type: "bar",
                  },
                ],
              } as dxPolarChartProperties);
            } else if (props.component === "PieChart") {
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

              Object.assign(properties, {
                legend: {
                  horizontalAlignment: "center",
                  verticalAlignment: "bottom",
                },
                series: {
                  argumentField: "arg",
                  valueField: "val",
                },
              } as dxPieChartProperties);
            } else if (props.component === "MultiView") {
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

              Object.assign(properties, {
                onItemClick: (e: any) => {
                  props.setValue(props.meta, e.itemData);
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
                  props.setValue(props.meta, e.addedItems[0]);
                },
              } as dxMultiViewProperties);
              // } else if(props.component === "SelectBox" ) {
              //  comp = dxSelectBox;
              //  Object.assign(properties, {} as dxSelectBoxProperties);
            } else if (props.component === "Menu") {
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

              Object.assign(properties, {
                onItemClick: (e: any) => {
                  props.setValue(props.meta, e.itemData);
                },
              } as dxMenuProperties);
            } else if (props.component === "Map") {
              comp = dxMap;
              Object.assign(properties, {
                provider: "bing",
                type: "satellite",
              } as dxMapProperties);
              // } else if(props.component === "TagBox" ) {
              //  comp = dxTagBox;
              //  Object.assign(properties, {} as dxTagBoxProperties);
            } else if (props.component === "Lookup") {
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

              Object.assign(properties, {
                onItemClick: (e: any) => {
                  props.setValue(props.meta, e.itemData);
                },
              } as dxLookupProperties);
            } else if (props.component === "LoadPanel") {
              comp = dxLoadPanel;
              // set on container: style={{ padding: "10px" }}
              Object.assign(properties, {
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
            } else if (props.component === "LoadIndicator") {
              comp = dxLoadIndicator;
              Object.assign(properties, {
                width: 100,
                visible: true,
              } as dxLoadIndicatorProperties);
            } else if (props.component === "List") {
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

              Object.assign(properties, {
                onItemClick: (e: any) => {
                  props.setValue(props.meta, e.itemData);
                },
              } as dxListProperties);
            } else if (props.component === "Gantt") {
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

              Object.assign(properties, {

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
            } else if (props.component === "Gallery") {
              comp = dxGallery;
              const galleryData = [
                "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person2.png",
                "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person1.png",
                "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person3.png",
                "https://js.devexpress.com/Content/images/doc/22_2/PhoneJS/person4.png",
              ];

              Object.assign(properties, {
                height: 400,
              } as dxGalleryProperties);
            } else if (props.component === "Funnel") {
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

              Object.assign(properties, {
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
            } else if (props.component === "FileManager") {
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

              Object.assign(properties, {
                fileSystemProvider: props.data.properties[props.meta.properties[IdAttr]],
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
              // createEffect(() => instance.option("fileSystemProvider", props.data.properties[props.meta.properties[IdAttr]]));
            } else if (props.component === "Diagram") {
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

              Object.assign(properties, {} as dxDiagramProperties);
            } else if (props.component === "DataGrid") {
              comp = dxDataGrid;
              Object.assign(properties, {} as dxDataGridProperties);
            } else if (props.component === "ContextMenu") {
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
              Object.assign(properties, {
                visible: true,
                onItemClick: (e: any) => {
                  props.setValue(props.meta, e.itemData.text);
                },
              } as dxContextMenuProperties);
            } else if (props.component === "Chart") {
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
              Object.assign(properties, {
                series: {
                  argumentField: "day",
                  valueField: "oranges",
                  name: "My oranges",
                  type: props.meta.properties.props["type"] || "bar",
                  color: "#ffaa66",
                },
              } as dxChartProperties);
            } else if (props.component === "Button") {
              comp = dxButton;
              Object.assign(properties, {
                onClick: props.onClick,
              } as dxButtonProperties);
            } else if (props.component === "BarGauge") {
              comp = dxBarGauge;
              // [47.27, 65.32, 84.59, 71.86]
              Object.assign(properties, {
                startValue: 0,
                endValue: 100,
                values: props.data.properties[props.meta.properties[IdAttr]],
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
            } else if (props.component === "ActionSheet") {
              comp = dxActionSheet;
              Object.assign(properties, {
                title: "Choose action",
                onCancelClick: () => {
                  props.setValue(props.meta, "Cancel");
                },
                onItemClick: (e: any) => {
                  props.setValue(props.meta, e.itemData.text);
                },
              } as dxActionSheetProperties);
            } else if (props.component === "Accordion") {
              comp = dxAccordion;
              Object.assign(properties, {
                animationDuration: 300,
                collapsible: true,
                multiple: false,
                selectedItems: [props.data.properties[props.meta.properties[IdAttr]][0]],

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
                  props.setValue(props.meta, e.addedItems[0]);
                },
              } as dxAccordionProperties);

            } else if (props.component === "ButtonGroup") {
              comp = dxButtonGroup;
              Object.assign(properties, {
                items: [],
                selectionMode: "none",

                onItemClick: (e) => {
                  // onClick: (item: any) => void;
                  props.onClick?.(e.itemData);
                },
              } as dxButtonGroupProperties);
              createEffect(() => instance.option("selectedItems", props.data.properties[props.meta.properties[IdAttr]]));

            } else if (props.component === "Tooltip") {
              comp = dxTooltip;
              Object.assign(properties, {
                target: "#target-item",
                showEvent: "mouseenter",
                hideEvent: "mouseleave",
                hideOnOutsideClick: false,
                position: "top",
                contentTemplate: (e: any) => {
                  e.component.option("contentTemplate", null);
                  return props.data.properties[props.meta.properties[IdAttr]];
                },
              } as dxTooltipProperties);
            } else if (props.component === "PivotGrid") {
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

              Object.assign(properties, {
                fieldChooser: {
                  width: 400,
                },
                showBorders: true,
              } as dxPivotGridProperties);
            } else if (props.component === "DropDownButton") {
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
              Object.assign(properties, {
                displayExpr: "name",
                items: props.data.properties[props.meta.properties[IdAttr]],
                keyExpr: "id",
                selectedItemKey: 1,
                stylingMode: "text",
                useSelectMode: true,
                width: 100,
                onSelectionChanged: (e: any) => {
                  props.setValue(props.meta, e.item);
                },
              } as dxDropDownButtonProperties);
            } else if (props.component === "Drawer") {
              comp = dxDrawer;
              Object.assign(properties, {} as dxDrawerProperties);
            } else if (props.component === "1") {
              comp = dxLoadPanel;
              Object.assign(properties, {} as dxLoadPanelProperties);
            } else if (props.component === "1") {
              comp = dxLoadPanel;
              Object.assign(properties, {} as dxLoadPanelProperties);
            } else {
              console.warn("Component not found", props.component);
              return "----";
            }
            // if (displayExpr.includes(props.component) && !props.meta.properties.props.displayExpr) {
            //  Object.assign(properties, {displayExpr: ''});
            // }
            // if (valueExpr.includes(props.component) && !props.meta.properties.props.valueExpr) {
            //  Object.assign(properties, {valueExpr: ''});
            // }
            // if (dataSource.includes(props.component) && !props.meta.properties.props.dataSource) {
            //  Object.assign(properties, {dataSource: ''});
            // }
            // if (items.includes(props.component) && !props.meta.properties.props.items) {
            //  Object.assign(properties, {items: ''});
            // }
            let instance;
            // createEffect needed for the drawer.else drawer is not working.
            createEffect(()=> {
              instance = new comp(el, properties);
              if (props.ref) {
                props.ref(instance);
              }
              window.www = instance
            })
            if (props.component === "Button") {
              if (props.data) {
              createEffect(() => {
                instance.option("text", props.data.properties[props.meta.properties[IdAttr]])
              });
              }
            }

            createEffect(() => {
              if(props.data) {
                let value = props.data.properties[props.meta.properties[IdAttr]];
                if (props.component === "FilterBuilder" || props.component === "FileUploader") {
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
              for (const property in props.meta.properties.props as dxTreeMapProperties) {
                let value = props.meta.properties.props[property];
                if (property === "items" && typeof value === "string") {
                  value = value.split("\n");
                }
                instance.option(property, value);
              }
            });
            onCleanup(() => instance.dispose());
          }}
        >{props.children}</div>
      </Show>

  );
}
