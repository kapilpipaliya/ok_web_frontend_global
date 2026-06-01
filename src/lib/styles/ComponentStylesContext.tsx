import {
  createContext,
  createSignal,
  onMount,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

import { removePerComponentStyleElements } from "~/components/ComponentScopedStyle";
import { createInitialCssState } from "~/lib/styles/componentCssTypes";
import {
  insertRulesForHash,
  removeRulesForHash,
  syncAllRegistryRulesToSheet,
} from "~/lib/styles/globalComponentStyleSheet";

type ComponentStylesContextValue = {
  usePerComponentStyles: Accessor<boolean>;
  acquireComponentCss: (hash: string, css: string) => void;
  releaseComponentCss: (hash: string | undefined) => void;
};

const ComponentStylesContext = createContext<ComponentStylesContextValue>();

export function ComponentStylesProvider(props: ParentProps) {
  const [cssState, setCssState] = createStore(createInitialCssState());
  const [hydrated, setHydrated] = createSignal(false);

  const usePerComponentStyles = () => isServer || !hydrated();

  const isGlobalStylesActive = () =>
    cssState.globalStylesActive && typeof document !== "undefined";

  const acquireComponentCss = (hash: string, css: string) => {
    const prev = cssState.refCounts.get(hash) ?? 0;
    const nextRefCounts = new Map(cssState.refCounts);
    nextRefCounts.set(hash, prev + 1);
    setCssState("refCounts", nextRefCounts);

    if (prev === 0) {
      const nextRegistry = new Map(cssState.registry);
      nextRegistry.set(hash, css);
      setCssState("registry", nextRegistry);
      if (isGlobalStylesActive()) {
        insertRulesForHash(cssState, setCssState, hash, css);
      }
    }
  };

  const releaseComponentCss = (hash: string | undefined) => {
    if (!hash) {
      return;
    }

    const prev = cssState.refCounts.get(hash) ?? 0;

    if (prev <= 1) {
      const nextRefCounts = new Map(cssState.refCounts);
      nextRefCounts.delete(hash);
      setCssState("refCounts", nextRefCounts);

      const nextRegistry = new Map(cssState.registry);
      nextRegistry.delete(hash);
      setCssState("registry", nextRegistry);

      if (isGlobalStylesActive()) {
        removeRulesForHash(cssState, setCssState, hash);
      }
    } else {
      const nextRefCounts = new Map(cssState.refCounts);
      nextRefCounts.set(hash, prev - 1);
      setCssState("refCounts", nextRefCounts);
    }
  };

  onMount(() => {
    removePerComponentStyleElements();
    setHydrated(true);
    setCssState("globalStylesActive", true);
    syncAllRegistryRulesToSheet(() => cssState, setCssState);
  });

  return (
    <ComponentStylesContext.Provider
      value={{
        usePerComponentStyles,
        acquireComponentCss,
        releaseComponentCss,
      }}
    >
      {props.children}
    </ComponentStylesContext.Provider>
  );
}

export function useComponentStylesMode() {
  const ctx = useContext(ComponentStylesContext);
  return {
    usePerComponentStyles:
      ctx?.usePerComponentStyles ?? (() => true as boolean),
  };
}

export function useComponentCssActions() {
  const ctx = useContext(ComponentStylesContext);
  if (!ctx) {
    throw new Error(
      "useComponentCssActions must be used within ComponentStylesProvider",
    );
  }
  return ctx;
}
