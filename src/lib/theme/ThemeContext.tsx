import { createContext, useContext } from "solid-js";

import {
  colorToHex,
  colorToHexFromBase,
  createColorScheme,
  getLightShade,
  getDarkShade,
  getContrastColorFromBase,
  parseColorName,
  resolveColorForMode,
  isModeSpecificColor,
  type ShadeType,
} from "~/lib/styles/colorUtils";
import type {
  ColorDefinition,
  ColorMode,
  ColorScheme,
  ThemeContext as ThemeContextType,
} from "~/lib/styles/types/types";

export const ThemeContext = createContext<ThemeContextType>();

type ThemeObject = Record<string, unknown>;
type ColorTarget = {
  [key: string]: string | number | boolean | ColorDefinition | undefined;
  primary?: ColorDefinition;
};

type ResolvedShade = {
  baseColor: string;
  shadeType: ShadeType;
  shade: number;
  css: string;
};

function resolveEffectiveShadeType(
  shadeType: string,
  mode: ColorMode,
): ShadeType {
  if (mode === "dark") {
    return shadeType === "light" ? "dark" : "light";
  }
  return shadeType === "dark" ? "dark" : "light";
}

function resolveBaseColorString(
  target: ColorTarget,
  baseProp: string,
  mode: ColorMode,
): string | undefined {
  let baseColorDef = target[baseProp];

  if (baseColorDef === undefined) {
    const parsedColor = parseColorName(baseProp);
    if (parsedColor) {
      baseColorDef = parsedColor;
    }
  }

  if (baseColorDef === undefined) {
    return undefined;
  }

  if (typeof baseColorDef === "string") {
    return baseColorDef;
  }

  if (typeof baseColorDef === "object" && baseColorDef !== null) {
    const resolved = resolveColorForMode(baseColorDef, mode);
    return typeof resolved === "string" ? resolved : undefined;
  }

  return undefined;
}

function resolveShade(
  target: ColorTarget,
  prop: string,
  getColorMode?: () => ColorMode,
): ResolvedShade | undefined {
  const shadeMatch = prop.match(/(.+)_(light|dark)_(\d+)$/);
  if (!shadeMatch) {
    return undefined;
  }

  const [, baseProp, shadeTypeRaw, shadeValue] = shadeMatch;
  const shade = Number.parseInt(shadeValue, 10);
  const mode = getColorMode ? getColorMode() : "light";
  const baseColor = resolveBaseColorString(target, baseProp, mode);
  if (!baseColor) {
    return undefined;
  }

  const shadeType = resolveEffectiveShadeType(shadeTypeRaw, mode);
  const css =
    shadeType === "light"
      ? getLightShade(baseColor, shade)
      : getDarkShade(baseColor, shade);

  return { baseColor, shadeType, shade, css };
}

const colorHandlers = {
  /**
   * Handles text color suffix access in the theme proxy.
   * Pattern: primary_text, success_text, error_text, primary_light_200_text, etc.
   * Contrast is computed from original base OKLCH (+ shade ratio), never from color-mix CSS.
   */
  handleTextColorAccess: (
    target: ColorTarget,
    prop: string,
    getColorMode?: () => ColorMode,
  ): string | undefined => {
    const textMatch = prop.match(/(.+)_text$/);
    if (!textMatch) {
      return undefined;
    }

    const [, baseProp] = textMatch;

    const textColorKey = `${baseProp}_text`;
    if (target[textColorKey] !== undefined) {
      const mode = getColorMode ? getColorMode() : "light";
      return resolveColorForMode(target[textColorKey], mode);
    }

    const shade = resolveShade(target, baseProp, getColorMode);
    if (shade) {
      return getContrastColorFromBase(
        shade.baseColor,
        shade.shadeType,
        shade.shade,
      );
    }

    const mode = getColorMode ? getColorMode() : "light";
    const baseColor = resolveBaseColorString(target, baseProp, mode);
    if (baseColor) {
      return getContrastColorFromBase(baseColor);
    }

    return undefined;
  },

  /**
   * Handles dynamic color shade access in the theme proxy.
   * Pattern: primary_light_640, error_dark_820, background_light_100, etc.
   * Returns color-mix() CSS for stylesheets only.
   */
  handleShadeAccess: (
    target: ColorTarget,
    prop: string,
    getColorMode?: () => ColorMode,
  ): string | undefined => {
    const shade = resolveShade(target, prop, getColorMode);
    if (shade) {
      return shade.css;
    }

    if (target[prop]) {
      const colorDef = target[prop];
      const mode = getColorMode ? getColorMode() : "light";

      if (typeof colorDef === "string") {
        return colorDef;
      }
      if (isModeSpecificColor(colorDef)) {
        return resolveColorForMode(colorDef, mode);
      }
      return colorDef as unknown as string;
    }

    if (parseColorName(prop)) {
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

        if (pathStr.startsWith("color.")) {
          return handleColorProperties(
            target as ColorTarget,
            prop,
            currentPath,
            getColorMode,
          );
        }

        return handleDefaultAccess(target, prop, currentPath, getColorMode);
      }
    },
  };

  return new Proxy(obj || {}, handler);
};

/**
 * Resolve a color prop to hex from the original base (+ shade), never from color-mix CSS.
 */
function resolveColorToHex(
  target: ColorTarget,
  colorProp: string,
  getColorMode?: () => ColorMode,
): string | undefined {
  const shade = resolveShade(target, colorProp, getColorMode);
  if (shade) {
    return colorToHexFromBase(shade.baseColor, shade.shadeType, shade.shade);
  }

  const textMatch = colorProp.match(/(.+)_text$/);
  if (textMatch) {
    const textColor = colorHandlers.handleTextColorAccess(
      target,
      colorProp,
      getColorMode,
    );
    if (typeof textColor === "string") {
      return colorToHex(textColor);
    }
  }

  const mode = getColorMode ? getColorMode() : "light";
  const baseColor = resolveBaseColorString(target, colorProp, mode);
  if (baseColor) {
    return colorToHexFromBase(baseColor);
  }

  return undefined;
}

function handleColorProperties(
  target: ColorTarget,
  prop: string,
  currentPath: string[],
  getColorMode?: () => ColorMode,
) {
  const hexMatch = prop.match(/(.+)_hex$/);
  if (hexMatch) {
    return resolveColorToHex(target, hexMatch[1], getColorMode);
  }

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

  if (currentPath.length === 2) {
    return colorHandlers.handleDirectColorAccess(target, prop, getColorMode);
  }

  return undefined;
}

function handleDefaultAccess(
  target: ThemeObject,
  prop: string,
  currentPath: string[],
  getColorMode?: () => ColorMode,
) {
  if (target === undefined || target === null) {
    return undefined;
  }

  const value = target[prop];

  if (value === undefined || value === null) {
    return undefined;
  }

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
