import { path } from "rambda";
import { type Accessor, createMemo, Match, splitProps, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { ButtonGroups } from "~/components/css_properties/components/ButtonGroups";
import { ColorPickerInput } from "~/components/css_properties/components/ColorPickerInput";
import { DataEditWithCustomDialog } from "~/components/css_properties/components/DataEditWithCustomDialog";
import { FieldWithCustomBox } from "~/components/css_properties/components/FieldWithCustomBox";
import { Select } from "~/components/css_properties/components/Select";
import { ToggleButton } from "~/components/css_properties/components/ToggleButton";

import type { FormField, GenericField } from "../constants/FieldSchemaType";

import {
  useCssDefaultEditor,
  useCssEditor,
  useCssState,
} from "../CssEditorContext";
import { RenderContextProvider } from "../RenderContext";
import { Divider } from "./Divider";
import { GridField } from "./GridField";
import { NotFoundComponent } from "./NotFoundComponent";
import { RenderChildren } from "./RenderChildren";
import { TextFieldWithSelect } from "./textfield_with_unit/TextFieldWithSelect";

const componentMap: Record<string, any> = {
  buttonGroups: ButtonGroups,
  colorPicker: ColorPickerInput,
  dataEditor: DataEditWithCustomDialog,
  divider: Divider,
  fieldWithCustomProperty: FieldWithCustomBox,
  grid: GridField,
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

  return (
    <RenderContextProvider meta={() => props.meta} store={repeterStore}>
      <Switch>
        {/* <Match when={isHidden()} /> */}
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    </RenderContextProvider>
  );
}
