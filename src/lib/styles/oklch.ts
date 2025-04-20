/**
 * OKLCH color utilities
 *
 * This file exports all OKLCH-related utilities from various files
 * to create a unified API for working with OKLCH colors.
 */

// Export culori-based utilities from colorUtils.ts
export {
  getColorShade,
  generateColorPalette,
  createColorScheme,
  createGradient,
  getHslComponents,
  mixColors,
  getContrastRatio,
  meetsAccessibilityStandards,
  getContrastColor,
  findAccessibleColor,
  parseColorName,
} from "./colorUtils";

// Export OKLCH adapter functions
export {
  generateOklchPalette,
  createSemanticColors,
  adjustLightness,
  adjustChroma,
  findContrastingColor,
} from "../shade-generator/oklchAdapter";

// Export CSS creator functions
export {
  getColorShade as getCssColorShade,
  colors,
} from "./createCss";

/**
 * OKLCH Color Space Guide
 *
 * OKLCH is a perceptually uniform color space that provides several
 * advantages over traditional RGB, HSL, and other color models:
 *
 * Components:
 * - L: Lightness (0-1) - Perceptually uniform brightness
 * - C: Chroma (0-0.4 approx) - Color intensity/saturation
 * - H: Hue (0-360) - Similar to hue in HSL
 *
 * Benefits of OKLCH:
 *
 * 1. Perceptual Uniformity: Changes in lightness are consistent across
 *    different hues, unlike HSL where yellow appears much lighter than blue
 *    at the same lightness value.
 *
 * 2. Better Color Transformations: When interpolating between colors or
 *    adjusting brightness, results look more natural and avoid the "muddy"
 *    colors that can happen with RGB or HSL.
 *
 * 3. Improved Accessibility: More accurate contrast calculations and
 *    better algorithms for ensuring text remains readable on various backgrounds.
 *
 * 4. Color Harmonies: Creating schemes like complementary, analogous, and
 *    triadic produces more balanced and aesthetically pleasing results.
 *
 * 5. Modern Standard: Aligns with modern color standards like CSS Color Module
 *    Level 4, which introduces OKLCH as a supported color space.
 *
 * Using with culori:
 *
 * The culori library provides robust tools for working with OKLCH:
 *
 * ```ts
 * import { oklch, formatHex } from "culori";
 *
 * // Convert any CSS color to OKLCH
 * const color = oklch("#3b82f6");
 *
 * // Modify components
 * color.l = 0.7;  // Increase lightness
 * color.c = 0.2;  // Adjust chroma (saturation)
 *
 * // Convert back to hex
 * const newColor = formatHex(color);
 * ```
 *
 * This module combines utilities from colorUtils.ts and the ShadeGenerator
 * to provide a comprehensive set of tools for working with OKLCH colors.
 */
