import { formatHex, oklch } from "culori";
import { type Component, createMemo, type JSX } from "solid-js";
import { StyleRenderer } from "~/components/StyleRenderer";
import { getGlobalThemeVertex } from "../graph/get/sync/store/getGlobalThemeVertex";
import { getGlobalStore } from "../graph/get/sync/store/getGlobalStore";
import { themeConfig } from "../graph/get/sync/theme/themeConfig";
import {
  createColorScheme,
  createGradient,
  findAccessibleColor,
  getColorShade,
  getContrastColor,
  getContrastRatio,
  getHslComponents,
  meetsAccessibilityStandards,
  mixColors,
  resolveColorForMode,
} from "../styles/colorUtils";
import { CSS_RESET, DEFAULT_THEME, FONT_PRESETS } from "../styles/constants";
import {
  getAnimationDefinition,
  getMediaQuery,
  getPrefersColorSchemeQuery,
} from "../styles/mediaUtils";
import { createSafeThemeProxy, ThemeContext } from "./ThemeContext";
import type {
  Breakpoint,
  ColorAdjustments,
  ColorDefinition,
  ColorMode,
  ColorScheme,
  ThemeContext as ThemeContextType,
} from "~/lib/styles/types/types";
import { useGraph } from "~/lib/graph/context/UseGraph";

export interface ThemeProviderProps {
  children: JSX.Element;
}
export const ThemeProvider: Component<ThemeProviderProps> = (props) => {
  const [graph] = useGraph();

  const currentMode = createMemo(() => {
    const globalStore = getGlobalStore(graph);
    const userSettingId = globalStore?.P?.userSettingId;
    const userThemeColorMode =
      userSettingId && graph.vertexes[userSettingId]?.P?.themeColorMode;
    return (userThemeColorMode || "light") as ColorMode;
  });

  const themeMemo = createMemo(() => {
    return themeConfig(getGlobalThemeVertex(graph));
  });

  const themeProxy = new Proxy(
    {},
    {
      get(target: Partial<ThemeContextType>, prop: string | symbol) {
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

    return `
      ${CSS_RESET}

      body {
        background-color: ${safeThemeVars.color?.backgroundColor};
        color: ${safeThemeVars.color?.textColor};
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
      options: string[] = ["#ffffff", "#000000"],
    ): string => getContrastColor(color, options),

    getSemanticColor: (
      context: "text" | "background" | "border" | "surface" | "muted",
    ): string => {
      // Get values from themeMemo which should always be safely initialized
      const safeTheme = themeMemo();
      const themeVar = safeTheme.var || ({} as ThemeContextType["var"]);
      const safeThemeVars = createSafeThemeProxy(
        themeVar,
        [],
        currentMode,
      ) as ThemeContextType["var"];

      // Check if semantic color is explicitly defined
      const explicitSemanticColor =
        safeThemeVars.color?.[context as keyof typeof safeThemeVars.color];
      if (explicitSemanticColor) {
        return resolveColorForMode(
          explicitSemanticColor as ColorDefinition,
          currentMode(),
        );
      }

      // Fall back to computed semantic colors based on primary
      const backgroundRef =
        safeTheme.var?.color?.background || DEFAULT_THEME.color.background;
      const resolvedBackground = resolveColorForMode(
        backgroundRef as ColorDefinition,
        currentMode(),
      );

      switch (context) {
        case "text":
          return currentMode() === "dark"
            ? getColorShade(resolvedBackground, 20)
            : getColorShade(resolvedBackground, 820);
        case "background":
          return currentMode() === "dark"
            ? getColorShade(resolvedBackground, 820)
            : getColorShade(resolvedBackground, 20);
        case "surface":
          return currentMode() === "dark"
            ? getColorShade(resolvedBackground, 640)
            : "#ffffff";
        case "border":
          return currentMode() === "dark"
            ? getColorShade(resolvedBackground, 460)
            : getColorShade(resolvedBackground, 40);
        case "muted":
          return currentMode() === "dark"
            ? getColorShade(resolvedBackground, 280)
            : getColorShade(resolvedBackground, 80);
        default:
          return resolvedBackground;
      }
    },

    mixColors: (color1: string, color2: string, amount = 50): string =>
      mixColors(color1, color2, amount),

    createGradient: (
      type: "linear" | "radial",
      colors: string[],
      stops?: number[],
      angle = 0,
    ): string => createGradient(type, colors, stops, angle),

    getHsl: (color: string) => getHslComponents(color),

    findAccessibleColor: (
      baseColor: string,
      backgroundColor: string,
      level: "AA" | "AAA" = "AA",
      size: "normal" | "large" = "normal",
    ): string => findAccessibleColor(baseColor, backgroundColor, level, size),
  });

  // Accessibility helpers
  const createAccessibilityHelpers = () => ({
    getContrastRatio: (color1: string, color2: string): number =>
      getContrastRatio(color1, color2),

    meetsAccessibilityStandards: (
      foreground: string,
      background: string,
      level: "AA" | "AAA" = "AA",
      size: "normal" | "large" = "normal",
    ): boolean =>
      meetsAccessibilityStandards(foreground, background, level, size),

    findAccessibleColor: (
      baseColor: string,
      backgroundColor: string,
      level: "AA" | "AAA" = "AA",
      size: "normal" | "large" = "normal",
    ): string => findAccessibleColor(baseColor, backgroundColor, level, size),
  });

  // Media query helpers
  const createMediaQueryHelpers = () => ({
    getMediaQuery: (breakpoint: Breakpoint): string =>
      getMediaQuery(breakpoint),

    getPrefersColorSchemeQuery: (mode: "light" | "dark"): string =>
      getPrefersColorSchemeQuery(mode),

    getContainerQuery: (size: string): string =>
      `@container (min-width: ${size})`,

    // Animation helpers
    getAnimationDefinition: (
      name: string,
      duration = "300ms",
      timing = "ease",
      delay = "0ms",
      iterationCount: string | number = 1,
      direction = "normal",
      fillMode = "none",
    ): string =>
      getAnimationDefinition(
        name,
        duration,
        timing,
        delay,
        iterationCount,
        direction,
        fillMode,
      ),
  });

  return (
    <ThemeContext.Provider value={themeProxy as ThemeContextType}>
      <StyleRenderer cssContent={[themeCssVars()]} id="theme-variables" />
      {props.children}
    </ThemeContext.Provider>
  );
};
