import type {
  EasingPreset,
  SpacingScale,
  ThemeContext,
} from "~/lib/styles/types/types";

// Default theme values
export const DEFAULT_THEME = {
  color: {
    primary: {
      light: "oklch(0.57 0.19 250)", // Blue
      dark: "oklch(0.7 0.15 250)", // Brighter blue
    },
    info: {
      light: "oklch(0.65 0.15 220)", // Sky blue
      dark: "oklch(0.75 0.12 220)", // Brighter sky blue
    },
    success: {
      light: "oklch(0.7 0.15 160)", // Emerald
      dark: "oklch(0.75 0.12 160)", // Brighter emerald
    },
    warning: {
      light: "oklch(0.7 0.2 60)", // Orange
      dark: "oklch(0.8 0.18 60)", // Brighter orange
    },
    error: {
      light: "oklch(0.65 0.25 25)", // Red
      dark: "oklch(0.75 0.22 25)", // Brighter red
    },
    text: {
      light: "oklch(0.2 0.02 250)", // Dark text
      dark: "oklch(0.9 0.02 250)", // Light text
    },
    background: {
      light: "oklch(0.98 0.01 250)", // Light background
      dark: "oklch(0.1 0.02 250)", // Dark background
    },
    border: {
      light: "oklch(0.85 0.02 250)", // Light border
      dark: "oklch(0.3 0.03 250)", // Dark border
    },
    muted: {
      light: "oklch(0.6 0.03 250)", // Muted text
      dark: "oklch(0.6 0.03 250)", // Muted text
    },
  },
  fontFamily: "system-ui, sans-serif",
  fontSizeBase: "1rem",
  lineHeightBase: 1.5,
  fontWeightBase: 400,
  borderRadius: "0.25rem",
  spacingScale: "default" as SpacingScale,
  containerPadding: "1.5rem",
  sectionPadding: "2rem",
  transitionDurationFast: "150ms",
  transitionDurationNormal: "300ms",
  transitionDurationSlow: "500ms",
  defaultEasing: "ease" as EasingPreset,
} as ThemeContext["var"];

// Font presets
export const FONT_PRESETS = {
  system: "system-ui, sans-serif",
  sans: '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Roboto Mono", Menlo, Monaco, Consolas, monospace',
  heading: '"Poppins", system-ui, sans-serif',
};

// Spacing scales
export const SPACING_SCALES = {
  compact: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
  },
  default: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
    "2xl": "4rem",
  },
  loose: {
    xs: "0.75rem",
    sm: "1.5rem",
    md: "2.25rem",
    lg: "3rem",
    xl: "4.5rem",
    "2xl": "6rem",
  },
};

// Border radius presets
export const RADIUS_PRESETS = {
  none: "0",
  sm: "0.125rem",
  md: "0.25rem",
  lg: "0.5rem",
  xl: "1rem",
  full: "9999px",
};

// Animation easing presets
export const EASING_PRESETS = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  easeInQuad: "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
  easeOutQuad: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  easeInOutQuad: "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
};

// CSS Reset styles
export const CSS_RESET = `
/* https://www.joshwcomeau.com/css/custom-css-reset/ */
/* 1. Use a more-intuitive box-sizing model */
*, *::before, *::after {
  box-sizing: border-box;
}
/* 2. Remove default margin */
* {
  margin: 0;
}
/* 3. Enable keyword animations */
@media (prefers-reduced-motion: no-preference) {
  html {
    interpolate-size: allow-keywords;
  }
}
body {
  /* 4. Add accessible line-height */
  line-height: 1.5rem;
  /* 5. Improve text rendering */
  -webkit-font-smoothing: antialiased;
}
/* 6. Improve media defaults */
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}
/* 7. Inherit fonts for form controls */
input, button, textarea, select {
  font: inherit;
}
/* 8. Avoid text overflows */
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
/* 9. Improve line wrapping */
p {
  text-wrap: pretty;
}
h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
}
`;
