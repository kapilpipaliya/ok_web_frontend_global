import { path } from "rambda";
import { type Accessor, createMemo, Match, splitProps, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import { NotFoundComponent } from "~/components/fields/NotFoundComponent";
import { useFormContext } from "~/components/form/FormContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

import type { FormField, GenericField } from "../constants/FieldSchemaType";

import { useCssEditor } from "../CssEditorContext";
import { useCssEditorProps } from "../CSSEditorPropsContext";
import { RenderContextProvider } from "../RenderContext";
import { getCssSelectedFileEdgeName } from "../utils/getCssSelectedFileEdgeName";
import { componentMap } from "./componentMap";
import { LabelWrapper } from "./fields/LabelWrapper";
import { RenderChildren } from "./RenderChildren";

export function DynamicCSSComponent(
  props: Readonly<{
    [key: string]: any;
    meta: GenericField;
    projections?: string[];
  }>,
) {
  const Component = () =>
    componentMap[props.meta.componentName] || NotFoundComponent;

  const [, otherMeta] = splitProps(
    props.meta as { children: GenericField[] } & FormField,
    ["children", "projections"],
  );
  const [, otherProps] = splitProps(props, ["meta"]);

  const [cssState, setCssState] = useCssEditor();

  const [graph, setGraph] = useGraph();
  const [formStore] = useFormContext();
  const cssEditorProps = useCssEditorProps();

  const projections = createMemo(
    () => props.projections ?? [...(props.meta.projections ?? [])],
  );

  const value = createMemo(() => {
    return (
      path([...projections(), (props.meta as FormField).key || ""], cssState) ||
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
        [(props.meta as FormField).key]: data,
      });
    }

    // (props.meta as FormField).onChange?.(data, formStore, setFormStore);

    // props.meta.error = "";

    props.onChange?.(data);
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
          cssEditorProps.meta.P.key,
          props.projections[0] || "Default",
          props.meta.key!,
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
  const repeterStore = createStore({
    meta: [] as Accessor<GenericField>[],
  });
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
