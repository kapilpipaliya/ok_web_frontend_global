import { Match, Show, Switch } from "solid-js";
import { Vertex } from "../lib/graph";
import { SelectInputField } from "./input/SelectInputField";
import { TableInputField } from "./input/TableInputField";
import { GenericInputField } from "./input/GenaricInputField";
import { GenericField } from "./input/Components/GenericFieldComponent";
import { Progress } from "./solid-blocks/blocks";

export const genericInputComponents = [
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
export const genericComponents2 = [
  "Box",
  "TreeMap",
  "VectorMap",
  "Breadcrumb",
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
  // "ButtonGroup",
  "Tooltip",
  "PivotGrid",
  "DropDownButton",
  "Drawer",
  // "FilterBuilder",
  // "FileUploader",
  "FieldSetLabelLeft",
  "Form",
  "DropDownBoxTreeView",
  "Text",
  "Repeater",
  "A",
  "Image",
  "Page",
  "Icon",
];
// Dynamic Component used in the form

export const DynamicComponent = (props: {
  // component is required, cant refactor it to remove it, because parent component needs it too.
  component: string;
  meta: Vertex;
  title?: String,
  data?: Vertex;
  setValue(attribute: Vertex, vertex: Vertex, data: any): void;
  disabled?: boolean;
  isRealTime?: boolean;
  txnId?: number;
}) => {
  return (
    <Switch>
      <Match when={!props.component}>NO INPUT</Match>
      <Match
        when={props.component === "SelectBox" || props.component === "TagBox"}
        keyed
      >
        <SelectInputField
          data={props.data}
          meta={props.meta}
          title={props.title}
          // passed setValue when we have a string value in select field
          setValue={props.setValue}
          disabled={props.disabled!}
          component={props.component}
          txnId={props.txnId}
          isRealTime={props.isRealTime}
        />
      </Match>
      <Match when={props.component === "Table"}>
        <Show when={!props.disabled} fallback={<>...</>}>
          <TableInputField
            meta={props.meta}
            data={props.data}
            disabled={props.disabled!}
            txnId={props.txnId}
            setValue={props.setValue}
            isRealTime={props.isRealTime}
          />
        </Show>
      </Match>
      <Match
        when={
          genericInputComponents.includes(props.component) && props.component
        }
        keyed
      >
        <GenericInputField
          data={props.data}
          meta={props.meta}
          txnId={props.txnId!}
          component={props.component}
          setValue={props.setValue}
          disabled={props.disabled!}
        />
      </Match>
      <Match
        when={genericComponents2.includes(props.component) && props.component}
        keyed
      >
        <GenericField
          data={props.data}
          meta={props.meta}
          txnId={props.txnId}
          component={props.component}
          setValue={props.setValue}
          disabled={props.disabled!}
        />
      </Match>
    </Switch>
  );
};
