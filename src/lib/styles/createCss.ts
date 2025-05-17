import {
  formatCss,
  formatRgb,
  interpolate,
  oklch,
  wcagLuminance,
} from "culori";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

// Theme color palette type
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  base: string;
  info: string;
  success: string;
  warning: string;
  error: string;

  [key: string]: string;
}

// Default theme colors (for reference only, actual defaults are in ThemeContext)
export const defaultColors: ThemeColors = {
  primary: "#3b82f6", // Blue
  secondary: "#64748b", // Slate
  accent: "#f59e0b", // Amber
  neutral: "#a3e635", // Lime
  base: "#1e293b", // Dark slate
  info: "#0ea5e9", // Sky blue
  success: "#10b981", // Emerald
  warning: "#f97316", // Orange
  error: "#ef4444", // Red
};

// Helper to get color shade - using the same implementation as in colorUtils.ts
export function getColorShade(baseColor: string, shade: number): string {
  // Ensure shade is between 0 and 100
  const safeShade = Math.max(0, Math.min(100, shade));

  // Get the base color in OKLCH
  const baseOklch = oklch(baseColor);
  if (!baseOklch) {
    return baseColor;
  }

  if (safeShade === 50) {
    // Return the base color at 50% shade
    return formatCss(baseOklch) || baseColor;
  }
  if (safeShade < 50) {
    // For lighter shades (0-49)
    // Linearly interpolate from white (0) to base color (50)
    const ratio = safeShade / 50;
    const white = oklch("white");
    if (!white) {
      return baseColor;
    }

    const interpolated = interpolate([white, baseOklch])(ratio);
    return formatCss(interpolated) || baseColor;
  }
  // For darker shades (51-100)
  // Linearly interpolate from base color (50) to black (100)
  const ratio = (safeShade - 50) / 50;
  const black = oklch("black");
  if (!black) {
    return baseColor;
  }

  const interpolated = interpolate([baseOklch, black])(ratio);
  return formatCss(interpolated) || baseColor;
}

// Helper to create CSS with ._id selector
export function createIdCss(cssContent: string): string {
  return `._id { ${cssContent} }`;
}

// Helper to create a CSS function
export function createCssFunction(
  cssGenerator: (options?: FunctionArgumentType) => string,
) {
  return (options?: FunctionArgumentType) => cssGenerator(options);
}

// Merge multiple CSS strings
export function mergeCss(
  ...cssFunctions: ((options?: FunctionArgumentType) => string)[]
): (options?: FunctionArgumentType) => string {
  return (options?: FunctionArgumentType) => {
    return cssFunctions.map((fn) => fn(options)).join("\n");
  };
}

// Create a responsive variation of a CSS function
export function responsive(
  cssGenerator: (options?: FunctionArgumentType) => string,
  breakpoints: Record<string, string> = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
): (options?: FunctionArgumentType) => string {
  return (options?: FunctionArgumentType) => {
    let css = cssGenerator(options);

    // Add media queries
    Object.entries(breakpoints).forEach(([name, width]) => {
      css += `
        @media (min-width: ${width}) {
          ._id-${name} {
            /* Add responsive styles here */
          }
        }
      `;
    });

    return css;
  };
}

// Color utility functions for direct use in CSS
export const colors = {
  lighten: (color: string, amount: number) => {
    const c = oklch(color);
    if (!c) {
      return color;
    }

    c.l = Math.min(1, (c.l || 0) + amount / 200); // Smaller steps for OKLCH lightness
    return formatCss(c) || color;
  },

  darken: (color: string, amount: number) => {
    const c = oklch(color);
    if (!c) {
      return color;
    }

    c.l = Math.max(0, (c.l || 0) - amount / 200); // Smaller steps for OKLCH lightness
    return formatCss(c) || color;
  },

  setAlpha: (color: string, alpha: number) => {
    const c = oklch(color);
    if (!c) {
      return color;
    }

    c.alpha = alpha;
    return formatRgb(c) || color;
  },

  spin: (color: string, amount: number) => {
    const c = oklch(color);
    if (!c) {
      return color;
    }

    c.h = ((c.h || 0) + amount) % 360;
    if (c.h < 0) {
      c.h += 360;
    }
    return formatCss(c) || color;
  },

  complement: (color: string) => {
    const c = oklch(color);
    if (!c) {
      return color;
    }

    c.h = ((c.h || 0) + 180) % 360;
    return formatCss(c) || color;
  },

  mix: (color1: string, color2: string, amount = 50) => {
    const c1 = oklch(color1);
    const c2 = oklch(color2);
    if (!(c1 && c2)) {
      return color1;
    }

    // Convert amount from percentage to 0-1 range
    const ratio = amount / 100;
    const mixed = interpolate([c1, c2])(ratio);
    return formatCss(mixed) || color1;
  },

  mostReadable: (color: string, options: string[] = ["#fff", "#000"]) => {
    const bgLuminanceVal = wcagLuminance(color);

    // Calculate contrast ratios for each option
    const contrastRatios = options.map((optionColor) => {
      const luminanceVal = wcagLuminance(optionColor);
      const light = Math.max(luminanceVal, bgLuminanceVal);
      const dark = Math.min(luminanceVal, bgLuminanceVal);
      return {
        color: optionColor,
        ratio: (light + 0.05) / (dark + 0.05),
      };
    });

    // Return the color with the highest contrast ratio
    return contrastRatios.sort((a, b) => b.ratio - a.ratio)[0].color;
  },
};
