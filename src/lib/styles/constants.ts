import type { ThemeContext } from "~/lib/styles/types/types";

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
    secondary: {
      light: "oklch(0.92 0.015 250)", // Subtle neutral for hover/selection
      dark: "oklch(0.22 0.02 250)",
    },
  },
  spacing: {
    xxs: "0.125rem",
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
    xxxl: "4rem",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  animation: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
  touch: {
    minTarget: "44px",
    button: "48px",
    input: "52px",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    xxl: "1.5rem",
    title: "2rem",
  },
} as ThemeContext["var"];

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
  /* 5. Improve text rendering */
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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

/* Code and preformatted text */
code, pre, kbd {
  font-family: "Roboto Mono", Menlo, Monaco, Consolas, monospace;
}
`;
