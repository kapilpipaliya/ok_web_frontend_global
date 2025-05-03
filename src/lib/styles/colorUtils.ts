import {
  formatCss,
  interpolate,
  oklch,
  parse,
  wcagContrast,
  wcagLuminance,
} from "culori";
import type {
  ColorAdjustments,
  ColorScheme,
  ShadeNumber,
} from "~/lib/styles";

/**
 * Format an OKLCH color object as a string
 */
export function formatOklchString(
  oklchColor: ReturnType<typeof oklch>,
): string | undefined {
  if (!oklchColor) {
    return undefined;
  }
  return formatCss(oklchColor);
}

/**
 * Uses culori to parse a color name and handle variants like 'lightblue' and 'darkred'
 * Returns the color in OKLCH string format for consistent handling in the system
 */
export function parseColorName(colorName: string): string | undefined {
  try {
    // Try to parse the color directly using culori
    const color = parse(colorName);
    if (color) {
      // Convert to OKLCH for consistency with the rest of the system
      const oklchColor = oklch(color);
      if (oklchColor) {
        return formatOklchString(oklchColor);
      }
    }

    // Handle variant colors like "lightblue", "darkred", etc.
    const lightMatch = colorName.match(/^light(.+)$/i);
    const darkMatch = colorName.match(/^dark(.+)$/i);

    if (lightMatch) {
      const baseColorName = lightMatch[1];
      const baseColor = parse(baseColorName);
      if (baseColor) {
        const oklchBaseColor = oklch(baseColor);
        if (oklchBaseColor) {
          // Lighten the color
          oklchBaseColor.l = Math.min(0.95, (oklchBaseColor.l || 0.7) + 0.15);
          return formatOklchString(oklchBaseColor);
        }
      }
    }

    if (darkMatch) {
      const baseColorName = darkMatch[1];
      const baseColor = parse(baseColorName);
      if (baseColor) {
        const oklchBaseColor = oklch(baseColor);
        if (oklchBaseColor) {
          // Darken the color
          oklchBaseColor.l = Math.max(0.2, (oklchBaseColor.l || 0.5) - 0.15);
          return formatOklchString(oklchBaseColor);
        }
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Returns the color at the specified shade level (0-1000) in OKLCH format
 * 0 = white, 100 = base color, 1000 = black
 */
export function getColorShade(
  baseColor: string,
  shade: ShadeNumber | number,
): string {
  // Ensure shade is between 0 and 1000
  const safeShade = Math.max(0, Math.min(1000, shade));

  // Get the base color in OKLCH
  const baseOklch = oklch(baseColor);
  if (!baseOklch) {
    return baseColor;
  }

  if (safeShade === 100) {
    // Return the base color if shade is 100
    return formatOklchString(baseOklch) || baseColor;
  }
  if (safeShade < 100) {
    // For shades lighter than the base color (0-99)
    // Linearly interpolate from white (0) to base color (100)
    const ratio = safeShade / 100;
    const white = oklch("white");
    if (!white) {
      return baseColor;
    }

    const interpolated = interpolate([white, baseOklch])(ratio);
    // Make sure we convert to OKLCH if not already
    const oklchInterpolated = oklch(interpolated);
    return formatOklchString(oklchInterpolated) || baseColor;
  }
  // For shades darker than the base color (101-1000)
  // Linearly interpolate from base color (100) to black (1000)
  const ratio = (safeShade - 100) / 900;
  const black = oklch("black");
  if (!black) {
    return baseColor;
  }

  const interpolated = interpolate([baseOklch, black])(ratio);
  // Make sure we convert to OKLCH if not already
  const oklchInterpolated = oklch(interpolated);
  return formatOklchString(oklchInterpolated) || baseColor;
}

/**
 * Create a color scheme from a base color with harmonious variations
 */
export function createColorScheme(baseColor: string): ColorScheme {
  // Convert to OKLCH
  const colorObj = oklch(baseColor);
  if (!colorObj) {
    return {
      base: baseColor,
      analogous1: baseColor,
      analogous2: baseColor,
      triadic1: baseColor,
      triadic2: baseColor,
      complementary: baseColor,
      split1: baseColor,
      split2: baseColor,
    };
  }

  // Convert to OKLCH and work with hue in degrees (0-360)
  const h = colorObj.h || 0;

  // Create variants with different hues
  return {
    base: formatOklchString(colorObj) || baseColor,
    analogous1:
      formatOklchString(oklch({ ...colorObj, h: (h + 30) % 360 })) || baseColor,
    analogous2:
      formatOklchString(oklch({ ...colorObj, h: (h - 30 + 360) % 360 })) || baseColor,
    triadic1:
      formatOklchString(oklch({ ...colorObj, h: (h + 120) % 360 })) || baseColor,
    triadic2:
      formatOklchString(oklch({ ...colorObj, h: (h - 120 + 360) % 360 })) || baseColor,
    complementary:
      formatOklchString(oklch({ ...colorObj, h: (h + 180) % 360 })) || baseColor,
    split1: formatOklchString(oklch({ ...colorObj, h: (h + 150) % 360 })) || baseColor,
    split2:
      formatOklchString(oklch({ ...colorObj, h: (h - 150 + 360) % 360 })) || baseColor,
  };
}

/**
 * Create a gradient from a list of colors
 */
export function createGradient(
  type: "linear" | "radial",
  colors: string[],
  stops?: number[],
  angle = 0,
): string {
  if (colors.length < 2) {
    return colors[0] || "transparent";
  }

  const colorStops = colors
    .map((color, i) => {
      if (stops && stops[i] !== undefined) {
        return `${color} ${stops[i]}%`;
      }
      return color;
    })
    .join(", ");

  if (type === "linear") {
    return `linear-gradient(${angle}deg, ${colorStops})`;
  }
  return `radial-gradient(circle, ${colorStops})`;
}

/**
 * Get OKLCH components from a color
 */
export function getHslComponents(color: string): {
  h: number;
  s: number;
  l: number;
  a: number;
} {
  const oklchColor = oklch(color);
  return {
    h: Math.round(oklchColor?.h || 0),
    s: Math.round((oklchColor?.c || 0) * 100), // Chroma as saturation
    l: Math.round((oklchColor?.l || 0) * 100),
    a:
      oklchColor?.alpha !== undefined
        ? Math.round(oklchColor.alpha * 100) / 100
        : 1,
  };
}

/**
 * Mix two colors together with the specified amount
 */
export function mixColors(color1: string, color2: string, amount = 50): string {
  const c1 = oklch(color1);
  const c2 = oklch(color2);

  // If conversion failed, return first color as fallback
  if (!(c1 && c2)) {
    return color1;
  }

  // Convert amount from percentage to 0-1 range
  const ratio = amount / 100;

  // Mix colors using interpolation
  const mixed = interpolate([c1, c2], "oklch")(ratio);
  return formatOklchString(mixed) || color1;
}

/**
 * Get contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  return wcagContrast(color1, color2);
}

/**
 * Check if a color combination meets accessibility standards
 */
export function meetsAccessibilityStandards(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal",
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === "AA") {
    return size === "normal" ? ratio >= 4.5 : ratio >= 3;
  }
  return size === "normal" ? ratio >= 7 : ratio >= 4.5;
}

/**
 * Get the most readable color from a list of options against a background
 */
export function getContrastColor(
  bgColor: string,
  options: string[] = ["#ffffff", "#000000"],
): string {
  const bgLuminanceVal = wcagLuminance(bgColor);

  // Calculate contrast ratios for each option
  const contrastRatios = options.map((color) => {
    const luminanceVal = wcagLuminance(color);
    const light = Math.max(luminanceVal, bgLuminanceVal);
    const dark = Math.min(luminanceVal, bgLuminanceVal);
    return {
      color,
      ratio: (light + 0.05) / (dark + 0.05),
    };
  });

  // Return the color with the highest contrast ratio
  return contrastRatios.sort((a, b) => b.ratio - a.ratio)[0].color;
}

/**
 * Adjust a color with various transformations
 */
export function adjustColor(
  color: string,
  adjustments: ColorAdjustments,
): string {
  const c = oklch(color);
  if (!c) {
    return color;
  }

  if (adjustments.lighten) {
    c.l = Math.min(1, (c.l || 0) + adjustments.lighten / 200); // Smaller steps for OKLCH lightness
  }

  if (adjustments.darken) {
    c.l = Math.max(0, (c.l || 0) - adjustments.darken / 200); // Smaller steps for OKLCH lightness
  }

  if (adjustments.saturate) {
    c.c = Math.min(0.4, (c.c || 0) + adjustments.saturate / 300); // Chroma (saturation) has a smaller range in OKLCH
  }

  if (adjustments.desaturate) {
    c.c = Math.max(0, (c.c || 0) - adjustments.desaturate / 300);
  }

  if (adjustments.spin) {
    c.h = ((c.h || 0) + adjustments.spin) % 360;
    if (c.h < 0) {
      c.h += 360;
    }
  }

  if (adjustments.alpha !== undefined) {
    c.alpha = adjustments.alpha;
  }

  return formatOklchString(c) || color;
}

/**
 * Find an accessible color by adjusting a base color until it meets standards
 */
export function findAccessibleColor(
  baseColor: string,
  backgroundColor: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal",
): string {
  // Start with the base color
  const c = oklch(baseColor);
  if (!c) {
    return baseColor;
  }

  let attempts = 0;
  const maxAttempts = 20;

  // If the original color meets standards, return it
  const initialColor = formatOklchString(c) || baseColor;
  if (meetsAccessibilityStandards(initialColor, backgroundColor, level, size)) {
    return initialColor;
  }

  // Otherwise, adjust lightness until we find a suitable color
  const bgLuminanceVal = wcagLuminance(backgroundColor);
  const isLight = bgLuminanceVal > 0.5;

  // Step size for adjustments - OKLCH lightness needs smaller steps
  const step = 0.03;
  const oklchCopy = { ...c };

  // Iteratively adjust until we find a color that meets standards or hit max attempts
  while (attempts < maxAttempts) {
    attempts++;

    // If background is light, darken the text; if dark, lighten it
    if (isLight) {
      oklchCopy.l = Math.max(0, (oklchCopy.l || 0) - step);
    } else {
      oklchCopy.l = Math.min(1, (oklchCopy.l || 0) + step);
    }

    const newColor = formatOklchString(oklchCopy) || baseColor;
    if (meetsAccessibilityStandards(newColor, backgroundColor, level, size)) {
      return newColor;
    }
  }

  // If we can't find a suitable color, return black or white for maximum contrast
  return isLight ? "#000000" : "#ffffff";
}
