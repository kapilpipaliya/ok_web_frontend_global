import type { Config } from "@master/css";

import { RuntimeCSS } from "@master/css-runtime";
import {
  createContext,
  createEffect,
  createSignal,
  type JSX,
  on,
  onCleanup,
  useContext,
} from "solid-js";

export const RuntimeCSSContext = createContext<RuntimeCSS | undefined>();

export function useRuntimeCSS() {
  return useContext(RuntimeCSSContext);
}

// https://github.com/master-co/css/blob/beta/packages/react/src/CSSProvider.tsx
export function CSSRuntimeProvider(
  props: Readonly<{
    children: JSX.Element;
    config?: Config | Promise<any>;
    root?: Document | ShadowRoot;
  }>,
) {
  const [runtimeCSS, setCSSRuntime] = createSignal<RuntimeCSS | undefined>(
    undefined,
  );
  let identifier = 0;
  let initializing = false;
  let newRuntimeCSS: RuntimeCSS | undefined = undefined;
  let isExternalRuntimeCSS = false;

  const waitInitialized = async () => {
    const currentIdentifier = ++identifier;
    if (initializing) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!initializing) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });
    }
    return currentIdentifier === identifier;
  };

  createEffect(on([() => JSON.stringify(props.config), () => props.root], async () => {
    (async () => {
      if (!(typeof window !== "undefined")) { return; }
      if (!(await waitInitialized())) { return; }

      const configModule = await props.config;
      const resolvedConfig =
        configModule?.config || configModule?.default || configModule;

      const init = async () => {
        initializing = true;

        const currentRoot = props.root ?? document;
        const existingCSSRuntime = (globalThis as any).runtimeCSSs.find(
          (eachCSS: RuntimeCSS) => eachCSS.root === currentRoot,
        );
        if (existingCSSRuntime) {
          setCSSRuntime((newRuntimeCSS = existingCSSRuntime));
          isExternalRuntimeCSS = true;
        } else {
          setCSSRuntime(
            (newRuntimeCSS = new RuntimeCSS(
              props.root,
              resolvedConfig,
            ).observe()),
          );
          isExternalRuntimeCSS = false;
        }

        initializing = false;
      };

      if (!newRuntimeCSS) {
        await init();
      } else if (
        newRuntimeCSS.root !== props.root &&
        (props.root || newRuntimeCSS.root !== document)
      ) {
        newRuntimeCSS.destroy();
        await init();
      } else {
        newRuntimeCSS.refresh(resolvedConfig);
      }
    })();
  }));

  createEffect(() => {
    onCleanup(() => {
      if (!isExternalRuntimeCSS) {
        (async () => {
          if (!(await waitInitialized())) { return; }

          newRuntimeCSS?.destroy();
          newRuntimeCSS = undefined;
        })();
      }
    });
  });

  return (
    <RuntimeCSSContext.Provider value={runtimeCSS()}>
      {props.children}
    </RuntimeCSSContext.Provider>
  );
}
