import { RuntimeCSS, type Config } from "@master/css";
import {createContext, createEffect, JSX, useContext} from "solid-js";
import { createStore } from "solid-js/store";

export const CSSContext = createContext<{m?:  RuntimeCSS }>({m: undefined});
export function useCSS() {
  return useContext(CSSContext)
}

// https://github.com/master-co/css/blob/beta/packages/react/src/CSSProvider.tsx
export function CSSProvider(props: {
  children: JSX.Element,
  config?: Config | Promise<Config> | Promise<any>,
  root?: Document | ShadowRoot | null
}) {
  const root = typeof document !== 'undefined' ? document : null
  const [runtimeCSS, setRuntimeCSS] = createStore({} as {m?: RuntimeCSS});

  createEffect(() => {
    let newRuntimeCSS: RuntimeCSS | undefined = globalThis.runtimeCSSs?.find((eachCSS) => eachCSS.root === root)
    if (newRuntimeCSS) {
      setRuntimeCSS({m: newRuntimeCSS})
    } else if (!runtimeCSS.m) {
      const init = (resolvedConfig?: Config) => {
        const existingCSS = globalThis.runtimeCSSs.find((eachCSS) => eachCSS.root === root)
        if (existingCSS) {
          setRuntimeCSS({m: existingCSS})
        } else {
          newRuntimeCSS = new RuntimeCSS(root, resolvedConfig).observe()
          setRuntimeCSS({m: newRuntimeCSS})
        }
      }
      if (props.config instanceof Promise) {
        (async () => {
          const configModule = await props.config
          init(configModule?.config || configModule?.default || configModule)
        })()
      } else {
        init(props.config)
      }
    } else if (!runtimeCSS.m!.observing) {
      runtimeCSS.m!.observe()
    }
    return () => {
      newRuntimeCSS?.destroy()
    }
  })
  return <CSSContext.Provider value={runtimeCSS}>{props.children}</CSSContext.Provider>
}
