import { Match, Show, splitProps, Switch, useContext } from "solid-js";
import { Vertex } from "~/lib/graph/graph";
import { SelectInputField } from "~/components/dynamic/fields/input/SelectInputField";
import { TableInputField } from "~/components/dynamic/fields/input/TableInputField";
import { GenericInputField } from "~/components/dynamic/fields/input/GenaricInputField";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
import { HiddenNodesContext } from "~/lib/contexts";

export const genericInputComponents = [
  "Autocomplete",
  "CheckBox",
  "ColorBox",
  "FormSubmit",
  "FormCancel",
  "Form",
  "FileUploader",
  "HtmlEditor",
  "NumberBox",
  "ProgressBar",
  "Radio",
  "RadioGroup",
  "SelectBox",
  "Switch",
  "TextArea",
  "TextBox",
  "TextInput",
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
export const DynamicComponent = (props: {
  // component is required, cant refactor it to remove it, because parent component needs it too.
  component: string;
  meta: Vertex;
  title?: string;
  data?: Vertex;
  isShowAdd?: boolean;
  setValue?: (data: any) => void;
  disabled?: boolean;
  isRealTime?: boolean;
  txnId?: number;
}) => {
  const [hiddenNodes, setHiddenNodes] = useContext(HiddenNodesContext);

  const [field, others] = splitProps(props, [
    "isRealTime",
    "meta",
    "data",
    "title",
    "disabled",
    "component",
    "txnId",
    "setValue",
    "isShowAdd",
  ]);

  return (
    <Switch>
      <Match when={!field.component}>NO INPUT</Match>
      <Match
        when={field.component === "SelectBox" || field.component === "TagBox"}
        keyed
      >
        <Show when={!hiddenNodes().includes(field.meta?.id)}>
          <SelectInputField
            data={field.data}
            meta={field.meta}
            title={field.title ?? ""}
            // passed setValue when we have a string value in select field
            setValue={field.setValue}
            disabled={field.disabled!}
            component={field.component}
            txnId={field.txnId}
            isRealTime={field.isRealTime}
          />
        </Show>
      </Match>
      <Match when={field.component === "Table2"}>
        <Show when={!hiddenNodes().includes(field.meta?.id)}>
          <Show when={!field.disabled} fallback={<>...</>}>
            <TableInputField
              meta={field.meta}
              data={field.data}
              isShowAdd={field.isShowAdd}
              disabled={field.disabled!}
              txnId={field.txnId}
              setValue={field.setValue}
              isRealTime={field.isRealTime}
            />
          </Show>
        </Show>
      </Match>
      <Match
        when={
          genericInputComponents.includes(field.component) && field.component
        }
        keyed
      >
        <Show when={!hiddenNodes().includes(field.meta?.id)}>
          <GenericInputField
            data={field.data}
            meta={field.meta}
            title={field.title ?? ""}
            txnId={field.txnId!}
            component={field.component}
            setValue={field.setValue}
            disabled={field.disabled!}
          />
        </Show>
      </Match>
      <Match
        when={genericComponents2.includes(field.component) && field.component}
        keyed
      >
        <Show when={!hiddenNodes().includes(field.meta?.id)}>
          <GenericField
            data={field.data}
            meta={field.meta}
            txnId={field.txnId}
            component={field.component}
            setValue={field.setValue}
            disabled={field.disabled!}
          />
        </Show>
      </Match>
    </Switch>
  );
};
