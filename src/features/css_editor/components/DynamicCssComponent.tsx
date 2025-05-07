import { path } from "rambda";
import {
  createMemo,
  getOwner,
  Match,
  runWithOwner,
  Show,
  splitProps,
  Switch,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Vertex } from "~/lib/graph/graph";

import { NotFoundComponent } from "~/components/fields/NotFoundComponent";
import {
  type FormStoreObject,
  useFormContext,
} from "~/components/form/context/FormContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { useGraph } from "~/lib/graph/GraphContext";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";

import type { FormField, GenericField } from "../constants/FieldSchemaType";

import { useCssEditor } from "../context/CssEditorContext";
import { useCssEditorProps } from "../context/CSSEditorPropsContext";
import { useCssState } from "../context/CssStateContext";
import {
  RenderContextProvider,
  type RenderStore,
  useRenderContext,
} from "../context/RenderContext";
import { ShowConfiguredOnlyContext } from "../context/ShowConfiguredOnlyContext";
import { getCssSelectedFileEdgeName } from "../utils/getCssSelectedFileEdgeName";
import { componentMap } from "./componentMap";
import { LabelWrapper } from "./fields/LabelWrapper";
import { RenderChildren } from "./RenderChildren";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

// similar to DynamicComponent in Seller Dorsey
export function DynamicCSSComponent(
  props: Readonly<{
    [key: string]: any;
    meta: GenericField;
    projections?: (number | string)[];
  }>,
) {
  const Component = () =>
    componentMap[props.meta.componentName] || NotFoundComponent;

  const [, otherMeta] = splitProps(
    props.meta as FormField & { children: GenericField[] },
    ["children", "projections"],
  );
  const [, otherProps] = splitProps(props, ["meta", "projections"]);

  const [state] = useCssState();
  const [cssState, setCssState] = useCssEditor();

  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;

  const cssEditorProps = useCssEditorProps();

  const parentRenderItems = useRenderContext() || [];
  const parentRenderContext = () => getLastItem(parentRenderItems)?.[0];
  const parentMeta = () => parentRenderContext()?.context.meta;
  const showConfiguredOnly = useContext(ShowConfiguredOnlyContext);
  const owner = getOwner();

  const runWithOwnerFunction = <T,>(fn: () => T): T | undefined => {
    return runWithOwner(owner, () => {
      return fn();
    });
  };

  const runWithParentOwnerFunction = <T,>(fn: () => T): T | undefined => {
    return runWithOwner(parentRenderContext()!.context.owner, () => {
      return fn();
    });
  };

  const getFunctionArgumentBase = () =>
    ({
      get meta() {
        return props.meta;
      },
      onChange,
      owner,
      parentItems: parentRenderItems,
      get parentMeta() {
        return parentMeta();
      },
      runWithOwner: runWithOwnerFunction,
      runWithParentOwner: runWithParentOwnerFunction,
    }) as unknown as Omit<
      FunctionArgumentType,
      "parentValue" | "projections" | "value"
    >;

  const getProjections = () =>
    props.projections ??
    props.meta.projections ??
    parentRenderContext()?.projections;

  const projections = createMemo(getProjections);
  const parentValue = () => path([...(projections() || [])])(cssState);

  const getFunctionArgument = (): Omit<FunctionArgumentType, "value"> => {
    const baseArguments = getFunctionArgumentBase();

    return Object.assign(baseArguments, {
      get parentValue() {
        return parentValue();
      },
      get projections() {
        return getProjections();
      },
    });
  };

  const value = createMemo(() => {
    return path([
      ...(projections() || []),
      (props.meta as FormField).key || "",
    ])(cssState);
  });

  const onChange = (data: any) => {
    // @ts-expect-error projections type is dynamic
    setCssState(...projections(), {
      [(props.meta as FormField).key]: data,
    });

    // (props.meta as FormField).onChange?.(data, formId);

    // props.meta.error = "";

    props.onChange?.(data);
  };

  const parentOnChange = (data: any) => {
    // @ts-expect-error projections type is dynamic
    setFormValueStore(...(projections() || []), reconcile(data));
  };
  const parentOnMerge = (data: any) => {
    // @ts-expect-error projections type is dynamic
    setFormValueStore(...(projections() || []), data);
  };

  const getFunctionArgumentWithValue = () => {
    const functionArgumentDescriptors = Object.getOwnPropertyDescriptors(
      getFunctionArgument(),
    );
    const valueDescriptor = Object.getOwnPropertyDescriptors({
      value: value(),
    });
    return Object.defineProperties(
      {},
      { ...functionArgumentDescriptors, ...valueDescriptor },
    ) as FunctionArgumentType;
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
    const txnId = formVertex()?.P.txnId;
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
          (props.projections?.[0] as string) || "Default",
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
  const repeaterStore = createStore({
    get context() {
      return getFunctionArgumentWithValue();
    },
    onChange,
    parentOnChange,
    parentOnMerge,
    get projections() {
      return projections();
    },
  });
  const isValueConfigured = createMemo(() => {
    const value_ = value();
    if (Array.isArray(value_)) {
      return value_.length > 0;
    }
    return !!value_;
  });
  const hasConfiguredFields = createMemo(() => {
    const currentState = cssState[state()] || {};

    // Check custom properties for fieldWithCustomProperty components
    if (
      props.meta.componentName === "fieldWithCustomProperty" &&
      props.meta.customProperty
    ) {
      for (const customProp of props.meta.customProperty) {
        if (currentState[customProp.key] !== undefined) {
          return true;
        }
      }
    }

    return false;
  });
  return (
    <RenderContextProvider store={repeaterStore as RenderStore}>
      <Switch>
        {/* <Match when={isHidden()} /> */}
        <Match when={props.meta.hideLabel}>
          <Content />
        </Match>
        <Match when={props.meta.isLabelOnTop}>
          <Show
            when={
              !showConfiguredOnly() ||
              isValueConfigured() ||
              hasConfiguredFields()
            }
          >
            <As
              as="div"
              css={css`
  width: 100%;
`}
            >
              <LabelWrapper
                meta={props.meta}
                onResetIconClick={resetValue}
                value={value()}
              />
              <Content />
            </As>
          </Show>
        </Match>
        <Match when={props.meta.label}>
          <Show
            when={
              !showConfiguredOnly() ||
              isValueConfigured() ||
              hasConfiguredFields()
            }
          >
            <As
              as="div"
              css={css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`}
            >
              <LabelWrapper
                meta={props.meta}
                onResetIconClick={resetValue}
                value={value()}
              />
              <Content />
            </As>
          </Show>
        </Match>
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    </RenderContextProvider>
  );
}
