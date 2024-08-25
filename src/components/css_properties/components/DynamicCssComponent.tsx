import { path } from "rambda";
import { type Accessor, createMemo, Match, splitProps, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { DataEditWithCustomDialog } from "~/components/css_properties/components/DataEditWithCustomDialog";
import { ButtonGroups } from "~/components/css_properties/components/fields/ButtonGroups";
import { ColorPickerInput } from "~/components/css_properties/components/fields/ColorPickerInput";
import { Select } from "~/components/css_properties/components/fields/Select";
import { ToggleButton } from "~/components/css_properties/components/fields/ToggleButton";
import { FieldWithCustomBox } from "~/components/css_properties/components/FieldWithCustomBox";
import { BoxField } from "~/components/fields/BoxField";
import { NotFoundComponent } from "~/components/fields/NotFoundComponent";
import { useFormContext } from "~/components/form/FormContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

import type { FormField, GenericField } from "../constants/FieldSchemaType";

import {
  useCssDefaultEditor,
  useCssEditor,
  useCssState,
} from "../CssEditorContext";
import { useCssEditorProps } from "../CSSEditorPropsContext";
import { RenderContextProvider } from "../RenderContext";
import { getCssSelectedFileEdgeName } from "../utils/getCssSelectedFileEdgeName";
import { LabelWrapper } from "./fields/LabelWrapper";
import { TextFieldWithSelect } from "./fields/textfield_with_unit/TextFieldWithSelect";
import { RenderChildren } from "./RenderChildren";

const componentMap: Record<string, any> = {
  box: BoxField,
  buttonGroups: ButtonGroups,
  colorPicker: ColorPickerInput,
  dataEditor: DataEditWithCustomDialog,
  fieldWithCustomProperty: FieldWithCustomBox,
  select: Select,
  textField: TextFieldWithSelect,
  textFieldOptions: TextFieldWithSelect,
  toggleButton: ToggleButton,
};

const repeterStore = createStore({
  meta: [] as Accessor<GenericField>[],
});

export function DynamicCSSComponent(
  props: Readonly<{ [key: string]: any; meta: GenericField }>,
) {
  const Component = () =>
    componentMap[props.meta.componentName] || NotFoundComponent;

  const [, otherMeta] = splitProps(
    props.meta as { children: GenericField[] } & FormField,
    ["children", "projections"],
  );
  const [, otherProps] = splitProps(props, ["meta"]);

  const [cssState, setCssState] = useCssEditor();
  const [cssDefault] = useCssDefaultEditor();
  const [state] = useCssState();

  const [graph, setGraph] = useGraph();
  const [formStore] = useFormContext();
  const cssEditorProps = useCssEditorProps();

  const projections = createMemo(
    () =>
      props.projections ?? [state() || "", ...(props.meta.projections ?? [])],
  );

  const value = createMemo(() => {
    return (
      path(
        [...projections(), (props.meta as FormField).name || ""],
        cssState,
      ) ||
      path(
        [...projections(), (props.meta as FormField).name || ""],
        cssDefault,
      ) ||
      ""
    );
  });

  const onChange = (data: any) => {
    if (props.meta.onChangeInput) {
      props.meta.onChangeInput!(data);
    }
    if (props.meta.isAddToClass ?? true) {
      // @ts-expect-error projections type is dynamic
      setCssState(...projections(), {
        [(props.meta as FormField).name]: data,
      });
    }

    // (props.meta as FormField).onChange?.(data, formStore, setFormStore);

    // props.meta.error = "";
  };

  const Content = () => {
    return (
      <>
        <Dynamic
          component={Component()}
          onChange={onChange}
          value={value()}
          {...otherMeta}
          {...otherProps}
        >
          <RenderChildren meta={props.meta} projections={projections()} />
        </Dynamic>
      </>
    );
  };

  const clearFileSelection = () => {
    const txnId = formStore?.txnId;
    if (!txnId) {
      return;
    }
    if (!(cssEditorProps?.meta && cssEditorProps?.data)) {
      return;
    }
    const selectedFileMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: {
        type: getCssSelectedFileEdgeName(
          cssEditorProps.data.L[0],
          cssEditorProps.meta.P.name,
          state() || "Default",
          props.meta.name,
        ),
      },
    } as Vertex;

    setSelectionValue(
      txnId,
      cssEditorProps.data,
      graph,
      setGraph,
      selectedFileMetaVertex,
    );
  };

  const resetValue = () => {
    onChange(undefined);
    // setSelectedOption(determineSelectedOption());
    clearFileSelection();
  };

  return (
    <RenderContextProvider meta={() => props.meta} store={repeterStore}>
      <Switch>
        {/* <Match when={isHidden()} /> */}
        <Match when={props.meta.hideLabel}>
          <Content />
        </Match>
        <Match when={props.meta.isLabelOnTop}>
          <div class={"w:full"}>
            <LabelWrapper onResetIconClick={resetValue} value={value()} />
            <Content />
          </div>
        </Match>
        <Match when={props.meta.label}>
          <div class={"flex ai:center jc:space-between w:full"}>
            <LabelWrapper onResetIconClick={resetValue} value={value()} />
            <Content />
          </div>
        </Match>
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    </RenderContextProvider>
  );
}
