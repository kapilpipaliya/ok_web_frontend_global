import { formatCss, oklch } from "culori";
/**
 * Find a color that meets contrast standards against a background
 * @param color The starting color
 * @param backgroundColor The background to contrast against
 * @param targetRatio The target contrast ratio (4.5 for AA, 7 for AAA)
 */
// TODO: instead o
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

    const newColor = formatCss(newOklch) || color;
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
