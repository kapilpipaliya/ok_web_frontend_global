import { MasterCSS, initRuntime, type Config } from "@master/css";
import {createContext, createEffect, JSX, useContext} from "solid-js";
import { createStore } from "solid-js/store";

export const CSSContext = createContext<{m:  MasterCSS | undefined }>({m: undefined});
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
  const [css, setCSS] = createStore<{m: MasterCSS | undefined}>({m: MasterCSS.instances.find((eachCSS) => eachCSS.root === root)});

  createEffect(() => {
    let newCSS: MasterCSS;

    if (!css.m) {
      const init = (resolvedConfig?: Config) => {
        const existingCSS = MasterCSS.instances.find((eachCSS) => eachCSS.root === root)
        if (existingCSS) {
          setCSS({m: existingCSS})
        } else {
          newCSS = initRuntime(resolvedConfig)
          setCSS({m: newCSS})
        }
      }

      if (props.config instanceof Promise) {
        (async () => {
          const configModule = await props.config;
          init(configModule?.config || configModule?.default || configModule)
        })()
      } else {
        init(props.config);
      }
    } else if (!css.m.observing) {

      css.m.observe(root)
    }

    return () => {
      newCSS?.destroy()
    }
  })
  return <CSSContext.Provider value={css}>{props.children}</CSSContext.Provider>
}
