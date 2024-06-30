import { Match, Show, Switch, createMemo, useContext } from "solid-js";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { SelectInputField } from "~/components/fields/SelectInputField";
import { TableInputField } from "~/components/fields/TableInputField";
import { GenericInputField } from "~/components/fields/GenericInputField";
import { GenericField } from "~/components/fields/GenericField";
import { getCompProps } from "~/lib/graph/get/sync/getProps";
import { useDesignerLayoutStore } from "../page_designer/LayoutContext";
import { Dynamic } from "solid-js/web";

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
  "Text",
  "Repeater",
  "A",
  "Image",
  "Page",
  "Icon",
];

// Dynamic Component used in the form
export function DynamicComponent(props: Readonly<{
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
}>) {
  const [graph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore();

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
      <Match when={component()} keyed>
        <Show when={!layoutStore.hiddenNodes.includes(props.meta?.id)}>
          <Dynamic
          component={component()!}
          {...(props.applyDefaults && isApplyDefault() && graph.componentIdMap[props.component] ? getCompProps(graph,graph.vertexes[graph.componentIdMap[props.component]]) : {})}
          data={props.data}
          meta={props.meta}
          title={props.title ?? ""}
          // passed setValue when we have a string value in select field
          setValue={props.setValue}
          disabled={props.disabled}
          componentName={props.component}
          txnId={props.txnId}
          isRealTime={props.isRealTime}

          isTableInside={props.isTableInside}
          applyDefaults={props.applyDefaults}
          />
        </Show>
      </Match>
    </Switch>
  );
}

