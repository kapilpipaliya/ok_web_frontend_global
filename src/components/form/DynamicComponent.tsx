import { Match, Show, Switch, useContext } from "solid-js";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { TableInputField } from "~/components/fields/TableInputField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { GenericField } from "~/components/fields/GenericField";
import { HiddenNodesContext } from "~/lib/contexts";
import { getCompProps } from "~/lib/graph/get/sync/graph_functions";

export const genericInputComponents = [
  // "Autocomplete",
  "CheckBox",
  "ColorBox",
  // "FormSubmit",
  // "FormCancel",
  "FileUploader",
  "HtmlEditor",
  "NumberBox",
  "Label",
  "ProgressBar",
  "Radio",
  "RadioGroup",
  "SelectBox",
  // "Switch",
  "TextArea",
  "TextBox",
  // "TextInput",
];
export const genericComponents2 = [
  "Box",
  "Breadcrumb",
  "Table",
  "TableHeader",
  "TableRow",
  "Tabs",
  "TabContainer",
  "TabList",
  "TreeViewItem",
  "TreeViewChild",
  "Collapsible",
  "LoadIndicator",
  "Divider",
  "Heading",
  "Rating",
  "Button",
  "Form",
  "Text",
  "Repeater",
  "A",
  "Image",
  "Page",
  "Icon",
];

// Dynamic Component used in the form
export function DynamicComponent(props: {
  // component is required, cant refactor it to remove it, because parent component needs it too.
  component: string;
  meta: Vertex;
  title?: string;
  data?: Vertex;
  isTableInside?: boolean;
  setValue?: (data: any) => void;
  disabled?: boolean;
  isRealTime?: boolean;
  txnId?: number;
  applyDefaults?: boolean;
}) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [hiddenNodes, setHiddenNodes] = useContext(HiddenNodesContext);

  return (
    <Switch>
      <Match when={!props.component}>NO INPUT</Match>
      <Match
        when={props.component === "SelectBox" || props.component === "TagBox"}
        keyed
      >
        <Show when={!hiddenNodes().includes(props.meta?.id)}>
          <SelectInputField
            {...(props.applyDefaults && graph.componentIdMap[props.component] ? getCompProps(graph,graph.vertexes[graph.componentIdMap[props.component]]) : {})}
            data={props.data}
            meta={props.meta}
            title={props.title ?? ""}
            // passed setValue when we have a string value in select field
            setValue={props.setValue}
            disabled={props.disabled!}
            component={props.component}
            txnId={props.txnId}
            isRealTime={props.isRealTime}
          />
        </Show>
      </Match>
      <Match when={props.component === "Table2"}>
        <Show when={!hiddenNodes().includes(props.meta?.id)}>
          
            <TableInputField
             {...(props.applyDefaults && graph.componentIdMap[props.component] ? getCompProps(graph,graph.vertexes[graph.componentIdMap[props.component]]) : {})}
              meta={props.meta}
              data={props.data}
              isTableInside={props.isTableInside}
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
        <Show when={!hiddenNodes().includes(props.meta?.id)}>
          <GenericInputField
            applyDefaults={props.applyDefaults}
            data={props.data}
            meta={props.meta}
            title={props.title ?? ""}
            txnId={props.txnId!}
            component={props.component}
            setValue={props.setValue}
            disabled={props.disabled!}
          />
        </Show>
      </Match>
      <Match
        when={genericComponents2.includes(props.component) && props.component}
        keyed
      >
        <Show when={!hiddenNodes().includes(props.meta?.id)}>
          <GenericField
            applyDefaults={props.applyDefaults}
            data={props.data}
            meta={props.meta}
            txnId={props.txnId}
            component={props.component}
            setValue={props.setValue}
            disabled={props.disabled!}
          />
        </Show>
      </Match>
    </Switch>
  );
}
