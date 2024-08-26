import { MultiProvider } from "@solid-primitives/context";
import { createSignal } from "solid-js";
import { createStore, reconcile, type SetStoreFunction } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";

import { isObject } from "~/lib/data_structure/object/isObject";

import type { CSSStore } from "./CssEditorContext";

import {
  CssEditorContext,
  CssStateContext,
} from "./CssEditorContext";
import { CssEditorPropsProvider } from "./CSSEditorPropsContext";
import { CSSPropertiesEditor } from "./CSSPropertiesEditor";
import { parseAndApplyCssRules } from "./utils/parseAndApplyCssRules";

export function CSSPropertiesEditorWrapper(
  props: Readonly<{
    data?: Vertex;
    disabled?: boolean;
    isRealTime?: boolean;
    meta: Vertex;
    onChange?: (data: CSSStore) => void;
    title?: string;
    txnId?: number;
  }>,
) {
  const [cssState, setCssState] = createStore({ "": {} } as CSSStore);
  const [state, setState] = createSignal("");

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

  initializeState(cssValue, setCssState);

  const onCSSStateChange = (
    ...args: Parameters<SetStoreFunction<CSSStore>>
  ) => {
    // @ts-expect-error imporoper type error
    setCssState(...args);
    props.onChange?.(JSON.parse(JSON.stringify(cssState)));
  };

  return (
    <MultiProvider
      values={[
        [
          CssEditorContext,
          [cssState, onCSSStateChange as SetStoreFunction<CSSStore>],
        ],
        [CssStateContext, [state, setState]],
        [
          CssEditorPropsProvider,
          {
            get data() {
              return props.data;
            },
            get meta() {
              return props.meta;
            },
          },
        ],
      ]}
    >
      <CSSPropertiesEditor
        data={props.data!}
        meta={props.meta}
        onChange={props.onChange}
      />
    </MultiProvider>
  );
}
