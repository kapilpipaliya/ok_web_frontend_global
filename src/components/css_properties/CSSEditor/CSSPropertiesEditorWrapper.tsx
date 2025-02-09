import { MultiProvider } from "@solid-primitives/context";
import { createEffect, createSignal, on } from "solid-js";
import { createStore, reconcile, type SetStoreFunction } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";

import { isObject } from "~/lib/data_structure/object/isObject";

import type { CSSStore } from "../context/CssEditorContext";

import { CssEditorContext } from "../context/CssEditorContext";
import { CssEditorPropsProvider } from "../context/CSSEditorPropsContext";
import { CssStateContext } from "../context/CssStateContext";
import { parseAndApplyCssRules } from "../utils/parseAndApplyCssRules";
import { CSSPropertiesEditor } from "./CSSPropertiesEditor";

export function CSSPropertiesEditorWrapper(
  props: Readonly<{
    data?: Vertex;
    meta: Vertex;
    onChange?: (data: string) => void;
  }>,
) {
  const [cssState, setCssState] = createStore({ "": {} } as CSSStore);
  const [state, setState] = createSignal("");

  const cssValue = () => {
    const value = props.data?.P[props.meta.P.key];
    if (typeof value === "string" && value.trim().startsWith("{")) {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error("Invalid JSON string:", e);
        return { "": {} };
      }
    } else if (isObject(value)) {
      return JSON.parse(JSON.stringify(value));
    } else {
      return { "": {} };
    }
  };

  const initializeState = (
    value: string,
    setStateFunction: SetStoreFunction<CSSStore>,
  ) => {
    if (typeof value === "string") {
      setStateFunction(reconcile(parseAndApplyCssRules(value)));
    } else if (isObject(value)) {
      setStateFunction(reconcile(JSON.parse(JSON.stringify(value))));
    }
  };

  createEffect(
    on(
      () => cssValue(),
      () => {
        if (JSON.stringify(cssValue()) === JSON.stringify(cssState)) {
          return;
        }
        initializeState(cssValue(), setCssState);
      },
    ),
  );

  const onCSSStateChange = (
    ...args: Parameters<SetStoreFunction<CSSStore>>
  ) => {
    // @ts-expect-error imporoper type error
    setCssState(...args);
    props.onChange?.(JSON.stringify(cssState));
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
      <CSSPropertiesEditor />
    </MultiProvider>
  );
}
