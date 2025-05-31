import { createContext, useContext } from "solid-js";

// Moving constants and utility functions to separate modules
import {
  EASING_PRESETS,
  FONT_PRESETS,
  RADIUS_PRESETS,
  SPACING_SCALES,
} from "~/lib/styles/constants";

import {
  createColorScheme,
  getLightShade,
  getDarkShade,
  getContrastColor,
  parseColorName,
  resolveColorForMode,
  isModeSpecificColor,
} from "~/lib/styles/colorUtils";
import type {
  ColorDefinition,
  ColorMode,
  ColorScheme,
  ThemeContext as ThemeContextType,
} from "~/lib/styles/types/types";

export const ThemeContext = createContext<ThemeContextType>();

// Types
type ThemeObject = Record<string, unknown>;
type ColorTarget = {
  [key: string]: string | number | boolean | ColorDefinition | undefined;
  primary?: ColorDefinition;
  fontFamily?: string;
  spacingScale?: string;
  borderRadius?: string;
  fontSizeBase?: string;
  lineHeightBase?: number;
};

// Color handlers
const colorHandlers = {
  /**
   * Handles text color suffix access in the theme proxy.
   * Pattern: primary_text, success_text, error_text, primary_light_200_text, etc.
   */
  handleTextColorAccess: (
    target: ColorTarget,
    prop: string,
    getColorMode?: () => ColorMode,
  ): string | undefined => {
    // Pattern: colorname_text
    const textMatch = prop.match(/(.+)_text$/);
    if (textMatch) {
      const [, baseProp] = textMatch;

      // First check if there's a predefined text color for this base color
      const textColorKey = `${baseProp}_text`;
      if (target[textColorKey] !== undefined) {
        const mode = getColorMode ? getColorMode() : "light";
        return resolveColorForMode(target[textColorKey], mode);
      }

      // Check if baseProp is a shade pattern (e.g., primary_light_200)
      const shadeMatch = baseProp.match(/(.+)_(light|dark)_(\d+)$/);
      if (shadeMatch) {
        // First compute the shade color
        const shadeColor = colorHandlers.handleShadeAccess(
          target,
          baseProp,
          getColorMode,
        );
        if (shadeColor) {
          // Then get the contrast color for this shade
          return getContrastColor(shadeColor);
        }
      }

      // If not predefined or a shade, calculate the appropriate text color based on the base color
      const baseColorDef = target[baseProp];
      if (baseColorDef !== undefined) {
        const mode = getColorMode ? getColorMode() : "light";
        const resolvedColor = resolveColorForMode(baseColorDef, mode);

        // Use the getContrastColor function which finds the best contrast color
        // It defaults to choosing between white and black
        return getContrastColor(resolvedColor);
      }

      return undefined;
    }
    return undefined;
  },

  /**
   * Handles dynamic color shade access in the theme proxy.
   * Pattern: primary_light_640, error_dark_820, background_light_100, etc.
   */
  handleShadeAccess: (
    target: ColorTarget,
    prop: string,
    getColorMode?: () => ColorMode,
  ): string | undefined => {
    // Pattern: colorname_light_### or colorname_dark_###
    const shadeMatch = prop.match(/(.+)_(light|dark)_(\d+)$/);
    if (shadeMatch) {
      const [, baseProp, shadeType, shadeValue] = shadeMatch;
      const shade = Number.parseInt(shadeValue, 10);
      let baseColorDef = target[baseProp];

      // If base color doesn't exist in the target, try parsing as color name
      if (baseColorDef === undefined) {
        const parsedColor = parseColorName(baseProp);
        if (parsedColor) {
          baseColorDef = parsedColor;
        }
      }

      // Resolve the color for the current mode
      if (baseColorDef !== undefined) {
        const mode = getColorMode ? getColorMode() : "light";

        // Swap light/dark when in dark mode
        const effectiveShadeType =
          mode === "dark"
            ? shadeType === "light"
              ? "dark"
              : "light"
            : shadeType;

        if (typeof baseColorDef === "string") {
          return effectiveShadeType === "light"
            ? getLightShade(baseColorDef, shade)
            : getDarkShade(baseColorDef, shade);
        }
        if (typeof baseColorDef === "object" && baseColorDef !== null) {
          const resolvedColor = resolveColorForMode(baseColorDef, mode);
          if (typeof resolvedColor === "string") {
            return effectiveShadeType === "light"
              ? getLightShade(resolvedColor, shade)
              : getDarkShade(resolvedColor, shade);
          }
        }
      }
    } else if (target[prop]) {
      // Handle direct color access with mode resolution
      const colorDef = target[prop];
      const mode = getColorMode ? getColorMode() : "light";

      if (typeof colorDef === "string") {
        return colorDef;
      }
      if (isModeSpecificColor(colorDef)) {
        return resolveColorForMode(colorDef, mode);
      }
      return colorDef as unknown as string;
    } else if (parseColorName(prop)) {
      return prop;
    }
    return undefined;
  },

  /**
   * Handles color scheme access in the theme proxy.
   * Pattern: primaryScheme, infoScheme, etc.
   */
  handleSchemeAccess: (
    target: ColorTarget,
    prop: string,
    getColorMode?: () => ColorMode,
  ): ColorScheme | undefined => {
    const schemeMatch = prop.match(/(.+?)Scheme$/);
    if (schemeMatch) {
      const [, baseProp] = schemeMatch;
      const baseColorDef = target[`${baseProp}Color`];
      const mode = getColorMode ? getColorMode() : "light";

      if (baseColorDef !== undefined) {
        const resolvedColor = resolveColorForMode(baseColorDef, mode);

        if (
          typeof resolvedColor === "string" &&
          resolvedColor.match(/^#|rgb|hsl|oklch/)
        ) {
          return createColorScheme(resolvedColor);
        }
      }
    }
    return undefined;
  },

  /**
   * Handle direct color access with mode resolution
   */
  handleDirectColorAccess: (
    target: ColorTarget,
    prop: string,
    getColorMode?: () => ColorMode,
  ): string | number | boolean | ColorDefinition | undefined => {
    if (target[prop] !== undefined) {
      const colorDef = target[prop];
      const mode = getColorMode ? getColorMode() : "light";

      if (typeof colorDef === "string") {
        return colorDef;
      }
      if (
        typeof colorDef === "object" &&
        colorDef !== null &&
        isModeSpecificColor(colorDef as ColorDefinition)
      ) {
        return resolveColorForMode(colorDef, mode);
      }
      return colorDef;
    }
    return undefined;
  },
};

// Non-color handlers
const styleHandlers = {
  /**
   * Handles font preset access in the theme proxy.
   * Pattern: fontSystem, fontSans, fontSerif, fontMono, fontHeading, etc.
   */
  handleFontPresetAccess: (target: ColorTarget, prop: string) => {
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
        FONT_PRESETS[presetName as keyof typeof FONT_PRESETS] ||
        target.fontFamily
      );
    }
    return undefined;
  },

  /**
   * Handles spacing scale access in the theme proxy.
   * Pattern: spacingXs, spacingSm, spacingMd, spacingLg, spacingXl, spacing2xl, etc.
   */
  handleSpacingScaleAccess: (target: ColorTarget, prop: string) => {
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
  },

  /**
   * Handles border radius access in the theme proxy.
   * Pattern: radiusNone, radiusSm, radiusMd, radiusLg, radiusXl, radiusFull, etc.
   */
  handleBorderRadiusAccess: (target: ColorTarget, prop: string) => {
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
  },

  /**
   * Handles easing preset access in the theme proxy.
   * Pattern: easingLinear, easingEaseInOut, etc.
   */
  handleEasingPresetAccess: (_target: ColorTarget, prop: string) => {
    if (prop.startsWith("easing") && prop !== "defaultEasing") {
      const presetName = prop.replace(/^easing/, "");
      const presetKey = (presetName.charAt(0).toLowerCase() +
        presetName.slice(1)) as keyof typeof EASING_PRESETS;
      return EASING_PRESETS[presetKey] || EASING_PRESETS.ease;
    }
    return undefined;
  },
};

// Main proxy creation function
export const createSafeThemeProxy = (
  obj: ThemeObject,
  path: string[] = [],
  getColorMode?: () => ColorMode,
): ThemeObject => {
  const handler = {
    get(target: ThemeObject, prop: string | symbol) {
      if (typeof prop === "string") {
        const currentPath = [...path, prop];
        const pathStr = currentPath.join(".");

        // Handle color-related properties
        if (pathStr.startsWith("color.")) {
          return handleColorProperties(
            target as ColorTarget,
            prop,
            currentPath,
            getColorMode,
          );
        }

        // Handle style-related properties
        const styleResult = handleStyleProperties(target as ColorTarget, prop);
        if (styleResult !== undefined) {
          return styleResult;
        }

        // Handle nested objects and default values
        return handleDefaultAccess(target, prop, currentPath, getColorMode);
      }
    },
  };

  return new Proxy(obj || {}, handler);
};

// Helper functions for proxy handling
function handleColorProperties(
  target: ColorTarget,
  prop: string,
  currentPath: string[],
  getColorMode?: () => ColorMode,
) {
  // Try specialized color handlers first
  const colorHandlerFunctions = [
    colorHandlers.handleTextColorAccess,
    colorHandlers.handleShadeAccess,
    colorHandlers.handleSchemeAccess,
  ];

  for (const handler of colorHandlerFunctions) {
    const result = handler(target, prop, getColorMode);
    if (result !== undefined) {
      return result;
    }
  }

  // Handle direct color access for properties at color level (e.g., color.primary)
  if (currentPath.length === 2) {
    const directResult = colorHandlers.handleDirectColorAccess(
      target,
      prop,
      getColorMode,
    );
    if (directResult !== undefined) {
      return directResult;
    }
  }

  return undefined;
}

function handleStyleProperties(target: ColorTarget, prop: string) {
  const styleHandlerMap: Record<
    string,
    (target: ColorTarget, prop: string) => unknown
  > = {
    font: styleHandlers.handleFontPresetAccess,
    spacing: styleHandlers.handleSpacingScaleAccess,
    radius: styleHandlers.handleBorderRadiusAccess,
    easing: styleHandlers.handleEasingPresetAccess,
  };

  for (const [prefix, handler] of Object.entries(styleHandlerMap)) {
    if (prop.startsWith(prefix)) {
      const result = handler(target, prop);
      if (result !== undefined) {
        return result;
      }
    }
  }

  return undefined;
}

function handleDefaultAccess(
  target: ThemeObject,
  prop: string,
  currentPath: string[],
  getColorMode?: () => ColorMode,
) {
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
    return createSafeThemeProxy(
      value as ThemeObject,
      currentPath,
      getColorMode,
    );
  }

  return value;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
