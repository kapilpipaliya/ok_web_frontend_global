import { type Component, createMemo, onMount, type JSX } from "solid-js";
import { StyleRenderer } from "~/components/StyleRenderer";
import { ComponentStylesProvider } from "~/lib/styles/ComponentStylesContext";
import { getGlobalThemeVertex } from "../graph/get/sync/store/getGlobalThemeVertex";
import { themeConfig } from "../graph/get/sync/theme/themeConfig";
import { CSS_RESET } from "../styles/constants";
import { createSafeThemeProxy, ThemeContext } from "./ThemeContext";
import type { ThemeContext as ThemeContextType } from "~/lib/styles/types/types";
import { useGraph } from "~/lib/graph/context/UseGraph";
import {
  getThemeColorMode,
  hydrateThemeColorModeFromLocalStorage,
  initThemeColorModeStorageSync,
} from "./themeColorModeStorage";

export interface ThemeProviderProps {
  children: JSX.Element;
}
export const ThemeProvider: Component<ThemeProviderProps> = (props) => {
  const [graph, setGraph] = useGraph();

  onMount(() => {
    hydrateThemeColorModeFromLocalStorage(graph, setGraph);
    return initThemeColorModeStorageSync(graph, setGraph);
  });

  const currentMode = createMemo(() => getThemeColorMode(graph));

  const themeMemo = createMemo(() => {
    return themeConfig(getGlobalThemeVertex(graph));
  });

  const themeProxy = new Proxy(
    {},
    {
      get(_target: Partial<ThemeContextType>, prop: string | symbol) {
        if (typeof prop === "string" && prop === "var") {
          const safeTheme = themeMemo();
          const themeVar = safeTheme.var || {};
          return createSafeThemeProxy(themeVar, [], currentMode);
        }
        return themeMemo()[prop as keyof ThemeContextType];
      },
    },
  );

  // Generate CSS styles based on the theme
  const themeCssVars = createMemo(() => {
    const safeTheme = themeMemo();
    const themeVar = safeTheme.var || ({} as ThemeContextType["var"]);
    const safeThemeVars = createSafeThemeProxy(
      themeVar,
      [],
      currentMode,
    ) as ThemeContextType["var"];

    // font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    // body {
    //   background-color: ${safeThemeVars.color?.background};
    //   color: ${safeThemeVars.color?.text};
    // }
    return `
      ${CSS_RESET}
    `;
  });

  return (
    <ThemeContext.Provider value={themeProxy as ThemeContextType}>
      <ComponentStylesProvider>
        <StyleRenderer cssContent={[themeCssVars()]} id="theme-variables" />
        {props.children}
      </ComponentStylesProvider>
    </ThemeContext.Provider>
  );
};
