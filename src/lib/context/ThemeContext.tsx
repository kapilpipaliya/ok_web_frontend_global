import {
  type Component,
  createContext,
  createMemo,
  createSignal,
  type JSX,
  useContext,
} from "solid-js";
import type {
  Breakpoint,
  ColorAdjustments,
  ColorMode,
  ColorScheme,
  RadiusSize,
  ShadeNumber,
  SpacingScale,
  ThemeColorKey,
  ThemeContext as ThemeContextType,
  TypographySettings,
} from "~/lib/styles";
import { getGlobalThemeVertex } from "../graph/get/sync/store/getGlobalThemeVertex";
import { themeConfig } from "../graph/get/sync/theme/themeConfig";
import { createAppState } from "~/createAppState";
import { formatHex, oklch } from "culori";
import { StyleRenderer } from "~/components/StyleRenderer";

// Moving constants and utility functions to separate modules
import {
  CSS_RESET,
  DEFAULT_ACCENT,
  DEFAULT_BASE,
  DEFAULT_ERROR,
  DEFAULT_INFO,
  DEFAULT_NEUTRAL,
  DEFAULT_PRIMARY,
  DEFAULT_SECONDARY,
  DEFAULT_SUCCESS,
  DEFAULT_THEME,
  DEFAULT_WARNING,
  EASING_PRESETS,
  FONT_PRESETS,
  RADIUS_PRESETS,
  SPACING_SCALES,
} from "~/lib/styles/constants";

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
  parseColorName,
} from "~/lib/styles/colorUtils";

import {
  getAnimationDefinition,
  getMediaQuery,
  getPrefersColorSchemeQuery,
} from "~/lib/styles/mediaUtils";

const ThemeContext = createContext<ThemeContextType>();

// Define a proper type for the target object in handler functions
type ColorTarget = {
  [key: string]: string | number | boolean | undefined;
  colorMode?: ColorMode;
  baseColor?: string;
  primaryColor?: string;
  fontFamily?: string;
  spacingScale?: string;
  borderRadius?: string;
  fontSizeBase?: string;
  lineHeightBase?: number;
};

/**
 * Handles dynamic color shade access in the theme proxy.
 * Pattern: primaryColor_640, errorColor_820, etc. or direct colors like gray_280, blue_50, etc.
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The color shade value or undefined
 */
const handleColorShadeAccess = (target: ColorTarget, prop: string) => {
  const shadeMatch = prop.match(/(.+)_(\d+)$/);
  if (shadeMatch) {
    const [, baseProp, shadeValue] = shadeMatch;
    const shade = Number.parseInt(shadeValue, 10);
    let baseColor = target[baseProp];

    // If base color doesn't exist in the target, try these approaches
    if (baseColor === undefined) {
      // check if it's a color name that culori can parse
      baseColor = parseColorName(baseProp);
    }

    // Additional handling for color strings
    if (typeof baseColor === "string") {
      // Handle direct color values or attempt to parse as a color name
      return getColorShade(baseColor, shade as ShadeNumber);
    }
  } else if (parseColorName(prop)) {
    return prop;
  }
  return undefined;
};

/**
 * Handles color component (HSLA) access in the theme proxy.
 * Pattern: primaryColorH, primaryColorS, primaryColorL, primaryColorA
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The color component value or undefined
 */
const handleColorComponentAccess = (target: ColorTarget, prop: string) => {
  const colorComponentMatch = prop.match(/(.+)([HSLA])$/);
  if (colorComponentMatch) {
    const [, baseProp, component] = colorComponentMatch;
    const baseColor = target[baseProp];
    if (typeof baseColor === "string" && baseColor.match(/^#|rgb|hsl|oklch/)) {
      const hsl = getHslComponents(baseColor);
      switch (component) {
        case "H":
          return hsl.h;
        case "S":
          return hsl.s;
        case "L":
          return hsl.l;
        case "A":
          return hsl.a;
      }
    }
  }
  return undefined;
};

/**
 * Handles color scheme access in the theme proxy.
 * Pattern: primaryScheme, accentScheme, etc.
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The color scheme or undefined
 */
const handleColorSchemeAccess = (target: ColorTarget, prop: string) => {
  const schemeMatch = prop.match(/(.+?)Scheme$/);
  if (schemeMatch) {
    const [, baseProp] = schemeMatch;
    const baseColor = target[`${baseProp}Color`];
    if (typeof baseColor === "string" && baseColor.match(/^#|rgb|hsl|oklch/)) {
      return createColorScheme(baseColor);
    }
  }
  return undefined;
};

/**
 * Handles contrast ratio access in the theme proxy.
 * Pattern: primaryContrastRatio, accentContrastRatio, etc.
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The contrast ratio or undefined
 */
const handleContrastRatioAccess = (target: ColorTarget, prop: string) => {
  const contrastMatch = prop.match(/(.+?)ContrastRatio$/);
  if (contrastMatch) {
    const [, baseProp] = contrastMatch;
    const baseColor = target[`${baseProp}Color`] || DEFAULT_PRIMARY;
    const backgroundColor = target.colorMode === "dark" ? "#ffffff" : "#000000";
    return getContrastRatio(baseColor as string, backgroundColor);
  }
  return undefined;
};

/**
 * Handles semantic color access in the theme proxy.
 * Pattern: textColor, backgroundColor, surfaceColor, etc.
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The semantic color value or undefined
 */
const handleSemanticColorAccess = (target: ColorTarget, prop: string) => {
  const baseColor = target.baseColor || DEFAULT_BASE;
  switch (prop) {
    case "textColor":
      return target.colorMode === "dark"
        ? getColorShade(baseColor, 20)
        : getColorShade(baseColor, 820);
    case "backgroundColor":
      return target.colorMode === "dark"
        ? getColorShade(baseColor, 820)
        : getColorShade(baseColor, 20);
    case "surfaceColor":
      return target.colorMode === "dark"
        ? getColorShade(baseColor, 640)
        : "#ffffff";
    case "borderColor":
      return target.colorMode === "dark"
        ? getColorShade(baseColor, 460)
        : getColorShade(baseColor, 40);
    case "mutedColor":
      return target.colorMode === "dark"
        ? getColorShade(baseColor, 280)
        : getColorShade(baseColor, 80);
    default:
      return undefined;
  }
};

/**
 * Handles font preset access in the theme proxy.
 * Pattern: fontSystem, fontSans, fontSerif, fontMono, fontHeading, etc.
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The font preset value or undefined
 */
const handleFontPresetAccess = (target: ColorTarget, prop: string) => {
  if (
    prop.startsWith("font") &&
    ![
      "fontFamily",
      "fontSizeBase",
      "fontWeightBase",
      "fontHeading",
      "fontMono",
    ].includes(prop)
  ) {
    const presetName = prop.replace(/^font/, "").toLowerCase();
    return (
      FONT_PRESETS[presetName as keyof typeof FONT_PRESETS] || target.fontFamily
    );
  }
  return undefined;
};

/**
 * Handles spacing scale access in the theme proxy.
 * Pattern: spacingXs, spacingSm, spacingMd, spacingLg, spacingXl, spacing2xl, etc.
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The spacing scale value or undefined
 */
const handleSpacingScaleAccess = (target: ColorTarget, prop: string) => {
  if (prop.startsWith("spacing") && prop !== "spacingScale") {
    const scaleName = target.spacingScale || "default";
    const scale =
      SPACING_SCALES[scaleName as keyof typeof SPACING_SCALES] ||
      SPACING_SCALES.default;

    const sizeMatch = prop.match(/^spacing(.+)$/);
    if (sizeMatch) {
      const size = sizeMatch[1].toLowerCase();
      return scale[size as keyof typeof scale] || scale.md;
    }
    return scale;
  }
  return undefined;
};

/**
 * Handles border radius access in the theme proxy.
 * Pattern: radiusNone, radiusSm, radiusMd, radiusLg, radiusXl, radiusFull, etc.
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The border radius value or undefined
 */
const handleBorderRadiusAccess = (target: ColorTarget, prop: string) => {
  if (prop.startsWith("radius") && prop !== "borderRadius") {
    const sizeMatch = prop.match(/^radius(.+)$/);
    if (sizeMatch) {
      const size = sizeMatch[1].toLowerCase();
      return (
        RADIUS_PRESETS[size as keyof typeof RADIUS_PRESETS] ||
        target.borderRadius
      );
    }
    return target.borderRadius;
  }
  return undefined;
};

/**
 * Handles easing preset access in the theme proxy.
 * Pattern: easingLinear, easingEaseInOut, etc.
 * @param target The target object being accessed
 * @param prop The property name being accessed
 * @returns The easing preset value or undefined
 */
const handleEasingPresetAccess = (_target: ColorTarget, prop: string) => {
  if (prop.startsWith("easing") && prop !== "defaultEasing") {
    const presetName = prop.replace(/^easing/, "");
    const presetKey = (presetName.charAt(0).toLowerCase() +
      presetName.slice(1)) as keyof typeof EASING_PRESETS;
    return EASING_PRESETS[presetKey] || EASING_PRESETS.ease;
  }
  return undefined;
};

// Create a proper type for the theme object
type ThemeObject = Record<string, unknown>;

// Create a safe proxy that handles deep property access, dynamic colors, and helper functions
const createSafeThemeProxy = (
  obj: ThemeObject,
  path: string[] = [],
): ThemeObject => {
  const handler = {
    get(target: ThemeObject, prop: string | symbol) {
      if (typeof prop === "string") {
        const currentPath = [...path, prop];
        const pathStr = currentPath.join(".");

        // If we're accessing a color value under var.color.*
        if (pathStr.startsWith("color.")) {
          //  && typeof target[prop] === 'string' &&  target[prop].match(/^#|rgb|hsl|oklch/)
          // Try each color-related handler in sequence
          const colorHandlers = [
            handleColorShadeAccess,
            handleColorComponentAccess,
            handleColorSchemeAccess,
            handleContrastRatioAccess,
          ];

          for (const handler of colorHandlers) {
            const result = handler(target as ColorTarget, prop);
            if (result !== undefined) {
              return result;
            }
          }
        }

        // Handle semantic colors if we're directly under var.color
        if (pathStr.startsWith("color.") && currentPath.length === 2) {
          const semanticResult = handleSemanticColorAccess(
            target as ColorTarget,
            prop,
          );
          if (semanticResult !== undefined) {
            return semanticResult;
          }
        }

        // Additional handlers that can be used if needed
        const additionalHandlers: Record<
          string,
          (target: ColorTarget, prop: string) => unknown
        > = {
          font: handleFontPresetAccess,
          spacing: handleSpacingScaleAccess,
          radius: handleBorderRadiusAccess,
          easing: handleEasingPresetAccess,
        };

        // Check if the property starts with any of the handler keys
        for (const [prefix, handler] of Object.entries(additionalHandlers)) {
          if (prop.startsWith(prefix)) {
            const result = handler(target as ColorTarget, prop);
            if (result !== undefined) {
              return result;
            }
          }
        }

        // Return undefined for undefined or null targets
        if (target === undefined || target === null) {
          return undefined;
        }

        const value = target[prop];

        // Return undefined for undefined or null properties
        if (value === undefined || value === null) {
          return undefined;
        }

        // Wrap objects in proxy with updated path
        if (typeof value === "object") {
          return createSafeThemeProxy(value as ThemeObject, currentPath);
        }

        return value;
      }
    },
  };

  return new Proxy(obj || {}, handler);
};

// Helper function to perform deep merge of objects
const deepMerge = <
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
>(
  target: T,
  source: U,
): Record<string, unknown> => {
  if (!source) {
    return target;
  }
  if (!target) {
    return source;
  }

  const result = { ...target };

  for (const key in source) {
    if (
      source[key] !== null &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>,
      );
    } else {
      result[key] = source[key];
    }
  }

  return result;
};

interface ThemeProviderProps {
  children: JSX.Element;
  initialTheme?: Partial<ThemeContextType>;
}

export const ThemeProvider: Component<ThemeProviderProps> = (props) => {
  const [graph] = createAppState();
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

    return result;
  });

  // Generate CSS styles based on the theme
  const themeCssVars = createMemo(() => {
    const theme = combinedTheme();
    const safeThemeVars = createSafeThemeProxy(theme.var || {});
    const colorMode = safeThemeVars.colorMode || "light";
    const baseColor =
      (safeThemeVars.color as Record<string, string>)?.base || DEFAULT_BASE;
    const _primaryColor =
      (safeThemeVars.color as Record<string, string>)?.primary ||
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
      fn: (current: Partial<ThemeContextType>) => Partial<ThemeContextType>,
    ) => void,
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
      fn: (current: Partial<ThemeContextType>) => Partial<ThemeContextType>,
    ) => void,
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
        {} as Record<string, string>,
      );

      setThemeOverrides((current: Partial<ThemeContextType>) => ({
        ...current,
        ...colorUpdates,
      }));
    },

    setColorScheme: (
      baseColor: string,
      colorKeys: ThemeColorKey[] = ["primary"],
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
      options: string[] = ["#ffffff", "#000000"],
    ): string => getContrastColor(color, options),

    getSemanticColor: (
      context: "text" | "background" | "border" | "surface" | "muted",
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

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
