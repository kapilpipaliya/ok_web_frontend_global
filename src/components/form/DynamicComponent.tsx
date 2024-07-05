import { Match, Show, Switch, createMemo, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";

import { GenericField } from "~/components/fields/GenericField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { TableInputField } from "~/components/fields/table_input/TableInputField";
import { getCompProps } from "~/lib/graph/get/sync/getProps";
import { GraphContext, type Vertex } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../page_designer/LayoutContext";

export const genericInputComponents = [
  // "Autocomplete",
  "CheckBox",
  "ColorBox",
  // "FormSubmit",
  // "FormCancel",
  "SignatureBox",
  "FileUploader",
  "HtmlEditor",
  "NumberBox",
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
  "Label",
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
  "Step",
  "Text",
  "Repeater",
  "A",
  "Image",
  "Page",
  "Icon",
];

// Dynamic Component used in the form
export function DynamicComponent(props: Readonly<{
  applyDefaults?: boolean;
  // component is required, cant refactor it to remove it, because parent component needs it too.
  component: string;
  data?: Vertex;
  disabled?: boolean;
  isRealTime?: boolean;
  isTableInside?: boolean;
  meta: Vertex;
  setValue?: (data: any) => void;
  title?: string;
  txnId?: number;
}>) {
  const [graph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore() || [];

  const component = createMemo(() => {
    switch (props.component) {
      case "SelectBox":
      case "TagBox":
        return SelectInputField;
      case "DynamicTable":
        return TableInputField;
      default:
        if (genericInputComponents.includes(props.component)) {
          return GenericInputField;
        }
        if (genericComponents2.includes(props.component)) {
          return GenericField;
        }
        return null;
    }
  });
  const isApplyDefault = () => component() !== GenericInputField && component() !== GenericField;

  return (
    <Switch>
      <Match when={!component()}>NO INPUT</Match>
      <Match keyed when={component()}>
        <Show when={!layoutStore?.hiddenNodes.includes(props.meta?.id)}>
          <Dynamic
          component={component()!}
          {...(props.applyDefaults && isApplyDefault() && graph.componentIdMap[props.component] ? getCompProps(graph,graph.vertexes[graph.componentIdMap[props.component]]) : {})}
          applyDefaults={props.applyDefaults}
          componentName={props.component}
          data={props.data}
          disabled={props.disabled}
          isRealTime={props.isRealTime}
          isTableInside={props.isTableInside}
          meta={props.meta}
          // passed setValue when we have a string value in select field
          setValue={props.setValue}

          title={props.title ?? ""}
          txnId={props.txnId}
          />
        </Show>
      </Match>
    </Switch>
  );
}

