import {
  createContext,
  type JSX,
  useContext,
} from "solid-js";
import type {
  ColorMode,
  ShadeNumber,
  ThemeContext as ThemeContextType,
} from "~/lib/styles";

// Moving constants and utility functions to separate modules
import {
  DEFAULT_BASE,
  DEFAULT_PRIMARY,
  EASING_PRESETS,
  FONT_PRESETS,
  RADIUS_PRESETS,
  SPACING_SCALES,
} from "~/lib/styles/constants";

import {
  createColorScheme,
  getColorShade,
  getContrastRatio,
  getHslComponents,
  parseColorName,
} from "~/lib/styles/colorUtils";


export const ThemeContext = createContext<ThemeContextType>();

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
  } else if (target[prop]) {
    return target[prop];
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
export const createSafeThemeProxy = (
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
export const deepMerge = <
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



export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
