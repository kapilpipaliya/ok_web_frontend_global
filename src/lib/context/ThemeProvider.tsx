import { oklch, formatHex } from "culori";
import { type Component, createEffect, createMemo, JSX } from "solid-js";
import { StyleRenderer } from "~/components/StyleRenderer";
import { getGlobalThemeVertex } from "../graph/get/sync/store/getGlobalThemeVertex";
import { themeConfig } from "../graph/get/sync/theme/themeConfig";
import type { ThemeContext as ThemeContextType, ColorMode, ColorAdjustments, ColorScheme, Breakpoint } from "../styles";
import { getColorShade, createColorScheme, getContrastColor, mixColors, createGradient, getHslComponents, findAccessibleColor, getContrastRatio, meetsAccessibilityStandards } from "../styles/colorUtils";
import { DEFAULT_THEME, CSS_RESET, FONT_PRESETS } from "../styles/constants";
import { getMediaQuery, getPrefersColorSchemeQuery, getAnimationDefinition } from "../styles/mediaUtils";
import { createSafeThemeProxy, ThemeContext } from "./ThemeContext";
import { deepMerge } from "./deepMerge";
import { useGraph } from "../graph/GraphContext";
import { createStore, reconcile } from "solid-js/store";

export interface ThemeProviderProps {
  children: JSX.Element;
}
export const ThemeProvider: Component<ThemeProviderProps> = (props) => {
  const [graph] = useGraph();

  const [theme, setTheme] = createStore(themeConfig(getGlobalThemeVertex(graph)));
  createEffect(() => {
    const newTheme = themeConfig(getGlobalThemeVertex(graph));
    setTheme(reconcile(newTheme));
  }, {
    defer: true,
  });
  
  const handler = {
    get(target: Partial<ThemeContextType>, prop: string | symbol) {
      if (typeof prop === "string" && prop === "var") {
        return createSafeThemeProxy(target.var || {});
      }
      return target[prop as keyof ThemeContextType];
    },
  };

  const themeProxy = new Proxy(theme || {}, handler);

  // Generate CSS styles based on the theme
  const themeCssVars = createMemo(() => {
    const safeThemeVars = createSafeThemeProxy(theme.var || {});
    const colorMode = themeProxy.var?.colorMode || "light";
    const baseColor = themeProxy.var?.color?.base || DEFAULT_THEME.color.base;

    return `
      ${CSS_RESET}
      
      /* Apply base styles to body */
      body {
        background-color: ${colorMode === "dark" ? getColorShade(baseColor, 820) : getColorShade(baseColor, 1)};
        color: ${colorMode === "dark" ? getColorShade(baseColor, 1) : getColorShade(baseColor, 820)};
        font-family: ${safeThemeVars.fontFamily || FONT_PRESETS.system};
        font-size: ${safeThemeVars.fontSizeBase || "1rem"};
        line-height: ${safeThemeVars.lineHeightBase || 1.5};
        -webkit-text-size-adjust: 100%;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Code and preformatted text */
      code, pre, kbd {
        font-family: ${safeThemeVars.fontMono || FONT_PRESETS.mono};
      }
    `;
  });

  // Color utility helpers
  const createColorHelpers = (combinedTheme: Partial<ThemeContextType>) => ({
    adjustColor: (color: string, adjustments: ColorAdjustments) => {
      const c = oklch(color);

      if (c && adjustments.lighten) {
        c.l = Math.min(1, (c.l || 0) + adjustments.lighten / 200);
      }

      if (c && adjustments.darken) {
        c.l = Math.max(0, (c.l || 0) - adjustments.darken / 200);
      }

      if (c && adjustments.saturate) {
        c.c = Math.min(0.4, (c.c || 0) + adjustments.saturate / 300);
      }

      if (c && adjustments.desaturate) {
        c.c = Math.max(0, (c.c || 0) - adjustments.desaturate / 300);
      }

      if (c && adjustments.spin) {
        c.h = ((c.h || 0) + adjustments.spin) % 360;
        if (c.h < 0) {
          c.h += 360;
        }
      }

      if (c && adjustments.alpha !== undefined) {
        c.alpha = adjustments.alpha;
      }

      return c ? formatHex(c) : color;
    },

    getColorScheme: (color: string): ColorScheme => createColorScheme(color),

    getContrastColor: (
      color: string,
      options: string[] = ["#ffffff", "#000000"]
    ): string => getContrastColor(color, options),

    getSemanticColor: (
      context: "text" | "background" | "border" | "surface" | "muted"
    ): string => {
      const colorMode = themeProxy.var?.colorMode as ColorMode;
      const baseColor = themeProxy.var?.color?.base || DEFAULT_THEME.color.base;

      switch (context) {
        case "text":
          return colorMode === "dark"
            ? getColorShade(baseColor, 20)
            : getColorShade(baseColor, 820);
        case "background":
          return colorMode === "dark"
            ? getColorShade(baseColor, 820)
            : getColorShade(baseColor, 20);
        case "surface":
          return colorMode === "dark"
            ? getColorShade(baseColor, 640)
            : "#ffffff";
        case "border":
          return colorMode === "dark"
            ? getColorShade(baseColor, 460)
            : getColorShade(baseColor, 40);
        case "muted":
          return colorMode === "dark"
            ? getColorShade(baseColor, 280)
            : getColorShade(baseColor, 80);
        default:
          return baseColor;
      }
    },

    mixColors: (color1: string, color2: string, amount = 50): string => mixColors(color1, color2, amount),

    createGradient: (
      type: "linear" | "radial",
      colors: string[],
      stops?: number[],
      angle = 0
    ): string => createGradient(type, colors, stops, angle),

    getHsl: (color: string) => getHslComponents(color),

    findAccessibleColor: (
      baseColor: string,
      backgroundColor: string,
      level: "AA" | "AAA" = "AA",
      size: "normal" | "large" = "normal"
    ): string => findAccessibleColor(baseColor, backgroundColor, level, size),
  });

  // Accessibility helpers
  const createAccessibilityHelpers = () => ({
    getContrastRatio: (color1: string, color2: string): number => getContrastRatio(color1, color2),

    meetsAccessibilityStandards: (
      foreground: string,
      background: string,
      level: "AA" | "AAA" = "AA",
      size: "normal" | "large" = "normal"
    ): boolean => meetsAccessibilityStandards(foreground, background, level, size),

    findAccessibleColor: (
      baseColor: string,
      backgroundColor: string,
      level: "AA" | "AAA" = "AA",
      size: "normal" | "large" = "normal"
    ): string => findAccessibleColor(baseColor, backgroundColor, level, size),
  });

  // Media query helpers
  const createMediaQueryHelpers = () => ({
    getMediaQuery: (breakpoint: Breakpoint): string => getMediaQuery(breakpoint),

    getPrefersColorSchemeQuery: (mode: "light" | "dark"): string => getPrefersColorSchemeQuery(mode),

    getContainerQuery: (size: string): string => `@container (min-width: ${size})`,

    // Animation helpers
    getAnimationDefinition: (
      name: string,
      duration = "300ms",
      timing = "ease",
      delay = "0ms",
      iterationCount: string | number = 1,
      direction = "normal",
      fillMode = "none"
    ): string => getAnimationDefinition(
      name,
      duration,
      timing,
      delay,
      iterationCount,
      direction,
      fillMode
    ),
  });

  return (
    <ThemeContext.Provider value={themeProxy as ThemeContextType}>
      <StyleRenderer cssContent={[themeCssVars()]} id="theme-variables" />
      {props.children}
    </ThemeContext.Provider>
  );
};
