import {
  createContext,
  createSignal,
  onMount,
  useContext,
  type Accessor,
  type ParentProps,
} from "solid-js";
import { isServer } from "solid-js/web";

import { removePerComponentStyleElements } from "~/components/ComponentScopedStyle";
import {
  createInitialCssState,
  type ComponentCssState,
} from "~/lib/styles/componentCssTypes";
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
  const cssState: ComponentCssState = createInitialCssState();
  const [hydrated, setHydrated] = createSignal(false);

  const usePerComponentStyles = () => isServer || !hydrated();

  const isGlobalStylesActive = () =>
    cssState.globalStylesActive && typeof document !== "undefined";

  const acquireComponentCss = (hash: string, css: string) => {
    const prev = cssState.refCounts.get(hash) ?? 0;
    cssState.refCounts.set(hash, prev + 1);

    if (prev === 0) {
      cssState.registry.set(hash, css);
      if (isGlobalStylesActive()) {
        insertRulesForHash(cssState, hash, css);
      }
    }
  };

  const releaseComponentCss = (hash: string | undefined) => {
    if (!hash) {
      return;
    }

    const prev = cssState.refCounts.get(hash) ?? 0;

    if (prev <= 1) {
      cssState.refCounts.delete(hash);
      cssState.registry.delete(hash);

      if (isGlobalStylesActive()) {
        removeRulesForHash(cssState, hash);
      }
    } else {
      cssState.refCounts.set(hash, prev - 1);
    }
  };

  onMount(() => {
    removePerComponentStyleElements();
    setHydrated(true);
    cssState.globalStylesActive = true;
    syncAllRegistryRulesToSheet(cssState);
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
