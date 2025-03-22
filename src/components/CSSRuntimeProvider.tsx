import type { Config } from "@master/css";

import { CSSRuntime } from "@master/css-runtime";
import {
  createContext,
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

const CSSRuntimeContext = createContext<CSSRuntime | undefined>(undefined);
export const useCSSRuntime = () => useContext(CSSRuntimeContext);

export function CSSRuntimeProvider(props: {
  children: JSX.Element;
  config?: Config | Promise<any>;
  root?: Document | ShadowRoot;
}) {
  const [runtimeCSS, setRuntimeCSS] = createSignal<CSSRuntime>();

  const resolveConfig = async () => {
    const configModule = await props.config;
    return configModule?.config || configModule?.default || configModule;
  };

  const initialize = async (signal: AbortSignal) => {
    const resolvedConfig = await resolveConfig();
    if (signal.aborted) {
      return;
    }
    setRuntimeCSS(
      new CSSRuntime(props.root ?? document, resolvedConfig).observe(),
    );
  };

  onMount(() => {
    const controller = new AbortController();
    initialize(controller.signal);

    onCleanup(() => {
      controller.abort();
      runtimeCSS()?.destroy();
      setRuntimeCSS(undefined);
    });
  });

  // Watch config changes
  let prevConfig = props.config;
  createEffect(() => {
    if (props.config === prevConfig) {
      return;
    }
    prevConfig = props.config;

    const controller = new AbortController();
    (async () => {
      const resolvedConfig = await resolveConfig();
      if (controller.signal.aborted) {
        return;
      }
      runtimeCSS()?.refresh(resolvedConfig); // NOTE: dont know why setTimeout is needed to make this working.
      // setTimeout(() => runtimeCSS()?.refresh(resolvedConfig), 500);
    })();

    onCleanup(() => {
      controller.abort();
    });
  });

  // Watch root changes
  let prevRoot = props.root;
  createEffect(() => {
    if (props.root === prevRoot) {
      return;
    }
    prevRoot = props.root;

    const controller = new AbortController();
    (async () => {
      if (controller.signal.aborted) {
        return;
      }
      if (runtimeCSS()) {
        runtimeCSS()?.destroy();
        setRuntimeCSS(undefined);
        initialize(controller.signal);
      }
    })();

    onCleanup(() => {
      controller.abort();
    });
  });

  return (
    <CSSRuntimeContext.Provider value={runtimeCSS()}>
      {props.children}
    </CSSRuntimeContext.Provider>
  );
}
