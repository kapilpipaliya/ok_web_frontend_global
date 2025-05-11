import { ShadeGenerator } from "./shadeGenerator";
import { formatHex, interpolate, oklch } from "culori";

import type { ColorPalette, ShadeNumber } from "~/lib/styles/types/types";

/**
 * Generates a color palette from a base color using OKLCH color space
 * @param baseColor The base color to generate shades from (hex, rgb, hsl)
 * @returns A color palette with shades from 0-1000
 */
export function generateOklchPalette(baseColor: string): ColorPalette {
  // Define the shades we want in our palette
  const shades: ShadeNumber[] = [
    0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
    95, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
  ];

  // Create a palette object
  const palette = {} as ColorPalette;

  // Get the base color in OKLCH space
  const baseOklch = oklch(baseColor);

  if (!baseOklch) {
    // Fallback to ShadeGenerator if oklch conversion fails
    const hexPalette = ShadeGenerator.hue(baseColor).shadesMap("hex");
    shades.forEach((shade) => {
      // Use the closest available shade from ShadeGenerator
      const closestShade = findClosestShade(shade.toString());
      palette[shade] = hexPalette[closestShade] || baseColor;
    });
    return palette;
  }

  // White and black in OKLCH for interpolation
  const white = oklch("white");
  const black = oklch("black");

  if (!(white && black)) {
    return palette;
  }

  shades.forEach((shade) => {
    if (shade === 100) {
      // Base color at shade 100
      palette[shade] = formatHex(baseOklch) || baseColor;
    } else if (shade < 100) {
      // For tints (lighter than base)
      // Linear interpolation between white and base color
      const ratio = shade / 100;
      const color = interpolate([white, baseOklch])(ratio);
      palette[shade] = formatHex(color) || baseColor;
    } else {
      // For shades (darker than base)
      // Linear interpolation between base color and black
      const ratio = (shade - 100) / 900;
      const color = interpolate([baseOklch, black])(ratio);
      palette[shade] = formatHex(color) || baseColor;
    }
  });

  return palette;
}

/**
 * Finds the closest shade in ShadeGenerator to the requested shade
 */
function findClosestShade(shade: string): string {
  const availableShades = [
    "10",
    "20",
    "30",
    "40",
    "50",
    "60",
    "70",
    "80",
    "90",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ];
  const shadeNum = Number.parseInt(shade, 10);

  if (shadeNum === 0) {
    return "10"; // Use lightest shade for 0
  }

  // Find closest available shade
  let closest = availableShades[0];
  let minDiff = Math.abs(Number.parseInt(closest, 10) - shadeNum);

  for (const availableShade of availableShades) {
    const diff = Math.abs(Number.parseInt(availableShade, 10) - shadeNum);
    if (diff < minDiff) {
      minDiff = diff;
      closest = availableShade;
    }
  }

  return closest;
}

/**
 * Create a semantic color system from a base color using OKLCH
 * @param baseColor The base color to derive semantic colors from
 * @param isDark Whether to use dark mode semantics
 */
export function createSemanticColors(baseColor: string, isDark = false) {
  // Generate a full palette from the base color
  const palette = generateOklchPalette(baseColor);

  // Return semantic color mapping
  return {
    text: isDark ? palette[20] : palette[800],
    background: isDark ? palette[900] : palette[5],
    surface: isDark ? palette[800] : palette[0],
    border: isDark ? palette[700] : palette[100],
    muted: isDark ? palette[600] : palette[200],
    primaryDark: palette[600],
    primary: palette[500],
    primaryLight: palette[400],
  };
}

/**
 * Adjust the lightness of a color using OKLCH
 * @param color The color to adjust
 * @param amount Amount to adjust (-100 to 100, negative values darken)
 */
export function adjustLightness(color: string, amount: number): string {
  const colorObj = oklch(color);
  if (!colorObj) {
    return color;
  }

  // Convert amount to a decimal adjustment
  const adjustment = amount / 200; // Scaled for OKLCH range

  // Adjust lightness while staying in valid range
  colorObj.l = Math.max(0, Math.min(1, (colorObj.l || 0) + adjustment));

  return formatHex(colorObj) || color;
}

/**
 * Adjust the chroma (saturation) of a color using OKLCH
 * @param color The color to adjust
 * @param amount Amount to adjust (-100 to 100, negative values desaturate)
 */
export function adjustChroma(color: string, amount: number): string {
  const colorObj = oklch(color);
  if (!colorObj) {
    return color;
  }

  // Convert amount to a decimal adjustment
  // OKLCH chroma has a smaller range than traditional saturation
  const adjustment = amount / 300;

  // Adjust chroma while staying in valid range (max around 0.4)
  colorObj.c = Math.max(0, Math.min(0.4, (colorObj.c || 0) + adjustment));

  return formatHex(colorObj) || color;
}

/**
 * Find a color that meets contrast standards against a background
 * @param color The starting color
 * @param backgroundColor The background to contrast against
 * @param targetRatio The target contrast ratio (4.5 for AA, 7 for AAA)
 */
export function findContrastingColor(
  color: string,
  backgroundColor: string,
  targetRatio = 4.5,
): string {
  const baseOklch = oklch(color);
  const bgOklch = oklch(backgroundColor);

  if (!(baseOklch && bgOklch)) {
    return color;
  }

  // Calculate current contrast ratio
  let currentRatio = getContrastRatio(color, backgroundColor);

  // If already meeting the target, return the original color
  if (currentRatio >= targetRatio) {
    return color;
  }

  // Determine if we need to lighten or darken the color
  const bgLightness = bgOklch.l || 0;
  const step = 0.02; // Small step size for gradual adjustment
  const newOklch = { ...baseOklch };

  // Lighten or darken based on background
  const shouldLighten = bgLightness < 0.5;

  // Adjust until we meet target ratio or reach max iterations
  let iterations = 0;
  const maxIterations = 30;

  while (currentRatio < targetRatio && iterations < maxIterations) {
    if (shouldLighten) {
      // Lighten color
      newOklch.l = Math.min(1, (newOklch.l || 0) + step);
    } else {
      // Darken color
      newOklch.l = Math.max(0, (newOklch.l || 0) - step);
    }

    const newColor = formatHex(newOklch) || color;
    currentRatio = getContrastRatio(newColor, backgroundColor);

    iterations++;
  }

  return formatHex(newOklch) || color;
}

/**
 * Get the contrast ratio between two colors
 * Simple implementation using relative luminance formula
 */
function getContrastRatio(color1: string, color2: string): number {
  const c1 = oklch(color1);
  const c2 = oklch(color2);

  if (!(c1 && c2)) {
    return 1;
  }

  // Estimate relative luminance from OKLCH lightness
  // This is a simplification, but works reasonably well
  const lum1 = c1.l || 0;
  const lum2 = c2.l || 0;

  // Calculate contrast ratio
  const light = Math.max(lum1, lum2);
  const dark = Math.min(lum1, lum2);

  // Formula: (L1 + 0.05) / (L2 + 0.05), where L1 is the lighter color
  return (light + 0.05) / (dark + 0.05);
}
