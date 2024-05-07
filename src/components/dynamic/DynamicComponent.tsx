import { Match, Show, Switch } from "solid-js";
import { Vertex } from "../../lib/graph";
import { SelectInputField } from "../input/SelectInputField";
import { TableInputField } from "../input/TableInputField";
import { GenericInputField } from "../input/GenaricInputField";
import { GenericField } from "../input/GenericFieldComponent";
import { hiddenNodes } from "../../lib/pageStore";

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
  const {
    component,
    meta,
    title = "",
    data,
    isShowAdd,
    setValue,
    disabled,
    isRealTime,
    txnId,
  } = props;

  return (
    <Switch>
      <Match when={!component}>NO INPUT</Match>
      <Match when={component === "SelectBox" || component === "TagBox"} keyed>
        <Show when={!hiddenNodes().includes(meta?.id)}>
          <SelectInputField
            data={data}
            meta={meta}
            title={title ?? ""}
            // passed setValue when we have a string value in select field
            setValue={setValue}
            disabled={disabled!}
            component={component}
            txnId={txnId}
            isRealTime={isRealTime}
          />
        </Show>
      </Match>
      <Match when={component === "Table2"}>
        <Show when={!hiddenNodes().includes(meta?.id)}>
          <Show when={!disabled} fallback={<>...</>}>
            <TableInputField
              meta={meta}
              data={data}
              isShowAdd={isShowAdd}
              disabled={disabled!}
              txnId={txnId}
              setValue={setValue}
              isRealTime={isRealTime}
            />
          </Show>
        </Show>
      </Match>
      <Match
        when={genericInputComponents.includes(component) && component}
        keyed
      >
        <Show when={!hiddenNodes().includes(meta?.id)}>
          <GenericInputField
            data={data}
            meta={meta}
            title={title ?? ""}
            txnId={txnId!}
            component={component}
            setValue={setValue}
            disabled={disabled!}
          />
        </Show>
      </Match>
      <Match when={genericComponents2.includes(component) && component} keyed>
        <Show when={!hiddenNodes().includes(meta?.id)}>
          <GenericField
            data={data}
            meta={meta}
            txnId={txnId}
            component={component}
            setValue={setValue}
            disabled={disabled!}
          />
        </Show>
      </Match>
    </Switch>
  );
};
