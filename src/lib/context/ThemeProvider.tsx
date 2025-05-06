import { oklch, formatHex } from "culori";
import { type Component, createSignal, createMemo, JSX } from "solid-js";
import { StyleRenderer } from "~/components/StyleRenderer";
import { getGlobalThemeVertex } from "../graph/get/sync/store/getGlobalThemeVertex";
import { themeConfig } from "../graph/get/sync/theme/themeConfig";
import type { ThemeContext as ThemeContextType, ColorMode, ThemeColorKey, SpacingScale, TypographySettings, RadiusSize, ColorAdjustments, ColorScheme, Breakpoint } from "../styles";
import { getColorShade, createColorScheme, getContrastColor, mixColors, createGradient, getHslComponents, findAccessibleColor, getContrastRatio, meetsAccessibilityStandards } from "../styles/colorUtils";
import { DEFAULT_PRIMARY, DEFAULT_SECONDARY, DEFAULT_ACCENT, DEFAULT_NEUTRAL, DEFAULT_BASE, DEFAULT_INFO, DEFAULT_SUCCESS, DEFAULT_WARNING, DEFAULT_ERROR, DEFAULT_THEME, CSS_RESET, FONT_PRESETS, RADIUS_PRESETS } from "../styles/constants";
import { getMediaQuery, getPrefersColorSchemeQuery, getAnimationDefinition } from "../styles/mediaUtils";
import { deepMerge, createSafeThemeProxy, ThemeContext } from "./ThemeContext";
import { useGraph } from "../graph/GraphContext";

export interface ThemeProviderProps {
  children: JSX.Element;
  initialTheme?: Partial<ThemeContextType>;
}
export const ThemeProvider: Component<ThemeProviderProps> = (props) => {
  const [graph] = useGraph();
  const [themeOverrides, setThemeOverrides] = createSignal<
    Partial<ThemeContextType>
  >(props.initialTheme || {});

  // Get combined theme data from all sources using createMemo
  const combinedTheme = createMemo(() => {
    // Get config from graph
    const graphConfig = themeConfig(getGlobalThemeVertex(graph)) || {};

    // Create base structure with default colors
    const result: Partial<ThemeContextType> = {
      var: {
        color: {
          primary: DEFAULT_PRIMARY,
          secondary: DEFAULT_SECONDARY,
          accent: DEFAULT_ACCENT,
          neutral: DEFAULT_NEUTRAL,
          base: DEFAULT_BASE,
          info: DEFAULT_INFO,
          success: DEFAULT_SUCCESS,
          warning: DEFAULT_WARNING,
          error: DEFAULT_ERROR,
        },
      },
    };

    // Helper function to merge properties
    const mergeProperties = (source: Record<string, any>) => {
      if (!source) {
        return;
      }

      // Handle properties inside the "var" key using deep merge
      if (source.var) {
        result.var = deepMerge(result.var || {}, source.var);
      }

      // Keep non-var properties at the root level
      Object.keys(source).forEach((key) => {
        if (key !== "var") {
          (result as any)[key] = source[key];
        }
      });
    };

    // Merge in order: DEFAULT_THEME, graphConfig, themeOverrides
    mergeProperties({ var: DEFAULT_THEME });
    mergeProperties(graphConfig);
    mergeProperties(themeOverrides());
    console.log(result);
    return result;
  });

  // Generate CSS styles based on the theme
  const themeCssVars = createMemo(() => {
    const theme = combinedTheme();
    const safeThemeVars = createSafeThemeProxy(theme.var || {});
    const colorMode = safeThemeVars.colorMode || "light";
    const baseColor = (safeThemeVars.color as Record<string, string>)?.base || DEFAULT_BASE;
    const _primaryColor = (safeThemeVars.color as Record<string, string>)?.primary ||
      DEFAULT_PRIMARY;

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

  // Basic theme helper functions
  const createBasicThemeHelpers = (
    setThemeOverrides: (
      fn: (current: Partial<ThemeContextType>) => Partial<ThemeContextType>
    ) => void
  ) => ({
    setTheme: (newTheme: Partial<ThemeContextType>) => {
      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        ...newTheme,
      }));
    },

    setColorMode: (mode: ColorMode) => {
      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        colorMode: mode,
      }));
    },

    toggleColorMode: () => {
      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        colorMode: current.colorMode === "dark" ? "light" : "dark",
      }));
    },

    setColor: (colorName: ThemeColorKey | string, value: string) => {
      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        [`${colorName}Color`]: value,
      }));
    },

    resetTheme: () => {
      setThemeOverrides(() => ({}));
    },
  });

  // Advanced theme configuration helpers
  const createConfigurationHelpers = (
    setThemeOverrides: (
      fn: (current: Partial<ThemeContextType>) => Partial<ThemeContextType>
    ) => void
  ) => ({
    setSpacingScale: (scale: SpacingScale) => {
      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        spacingScale: scale,
      }));
    },

    setTypography: (settings: TypographySettings) => {
      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        ...settings,
      }));
    },

    setAllColors: (colors: Record<ThemeColorKey, string>) => {
      const colorUpdates = Object.entries(colors).reduce(
        (acc, [key, value]) => {
          acc[`${key}Color`] = value;
          return acc;
        },
        {} as Record<string, string>
      );

      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        ...colorUpdates,
      }));
    },

    setColorScheme: (
      baseColor: string,
      colorKeys: ThemeColorKey[] = ["primary"]
    ) => {
      const scheme = createColorScheme(baseColor);
      const updates: Record<string, string> = {};

      // Map scheme colors to theme colors based on the keys provided
      if (colorKeys.includes("primary")) {
        updates.primaryColor = scheme.base;
      }
      if (colorKeys.includes("secondary")) {
        updates.secondaryColor = scheme.analogous1;
      }
      if (colorKeys.includes("accent")) {
        updates.accentColor = scheme.analogous2;
      }
      if (colorKeys.includes("neutral")) {
        updates.neutralColor = scheme.triadic1;
      }
      if (colorKeys.includes("info")) {
        updates.infoColor = scheme.triadic2;
      }
      if (colorKeys.includes("success")) {
        updates.successColor = scheme.complementary;
      }
      if (colorKeys.includes("warning")) {
        updates.warningColor = scheme.split1;
      }
      if (colorKeys.includes("error")) {
        updates.errorColor = scheme.split2;
      }

      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        ...updates,
      }));
    },

    getBorderRadius: (size: RadiusSize) => {
      return RADIUS_PRESETS[size] || RADIUS_PRESETS.md;
    },
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
      const safeThemeVars = createSafeThemeProxy(combinedTheme.var || {});
      const colorMode = safeThemeVars.colorMode as ColorMode;
      const baseColor = (safeThemeVars.color?.base as string) || DEFAULT_BASE;

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

  const themeHelpers = createMemo(() => {
    const theme = combinedTheme();
    const safeThemeVars = createSafeThemeProxy(theme.var || {});

    return {
      // Spread root level properties
      ...theme,

      // Override var with safe proxied theme variables
      var: safeThemeVars,

      // Include all helper functions at top level
      ...createBasicThemeHelpers(setThemeOverrides),
      ...createConfigurationHelpers(setThemeOverrides),
      ...createColorHelpers(theme),
      ...createAccessibilityHelpers(),
      ...createMediaQueryHelpers(),
    } as ThemeContextType;
  });

  return (
    <ThemeContext.Provider value={themeHelpers()}>
      <StyleRenderer cssContent={[themeCssVars()]} id="theme-variables" />
      {props.children}
    </ThemeContext.Provider>
  );
};
