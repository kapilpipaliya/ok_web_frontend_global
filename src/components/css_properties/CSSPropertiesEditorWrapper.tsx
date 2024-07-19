import { createSignal } from "solid-js";
import { type SetStoreFunction, createStore, reconcile } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";

import { isObject } from "~/lib/utils";

import type { CSSStore } from "./context";

import { CSSPropertiesEditor } from "./CSSPropertiesEditor";
import {
  CssDefaultEditorContext,
  CssEditorContext,
  CssStateContext,
} from "./context";
import { parseAndApplyCssRules } from "./utils/parseAndApplyCssRules";
export function CSSPropertiesEditorWrapper(
  props: Readonly<{
    data?: Vertex; // temp vertex
    disabled?: boolean;
    isRealTime?: boolean;
    meta: Vertex;
    setValue?: (data: CSSStore) => void;
    title?: string;
    txnId?: number;
  }>,
) {
  const [cssState, setCssState] = createStore({ "": {} } as CSSStore);
  const [cssDefaultState, setCssDefaultCssState] = createStore({
    "": {},
  } as CSSStore);
  const [state, setState] = createSignal("");

  const defaultValues = "";
  const cssValue = (props.data?.P[props.meta.P.name] as string) || "";

  const initializeState = (
    value: string,
    setStateFunction: SetStoreFunction<CSSStore>,
  ) => {
    if (typeof value === "string") {
      setStateFunction(reconcile(parseAndApplyCssRules(value)));
    } else if (isObject(value)) {
      setStateFunction(value);
    }
  };

  initializeState(defaultValues, setCssDefaultCssState);
  initializeState(cssValue, setCssState);

  const onCSSStateChange = (
    ...args: Parameters<SetStoreFunction<CSSStore>>
  ) => {
    // @ts-expect-error imporoper type error
    setCssState(...args);
    props.setValue?.(JSON.parse(JSON.stringify(cssState)));
  };

  return (
    <CssEditorContext.Provider
      value={[cssState, onCSSStateChange as SetStoreFunction<CSSStore>]}
    >
      <CssDefaultEditorContext.Provider
        value={[cssDefaultState, setCssDefaultCssState]}
      >
        <CssStateContext.Provider value={[state, setState]}>
          <CSSPropertiesEditor
            data={props.data!}
            meta={props.meta}
            setValue={props.setValue}
          />
        </CssStateContext.Provider>
      </CssDefaultEditorContext.Provider>
    </CssEditorContext.Provider>
  );
}
