import { DEFAULT_THEME } from "../styles/constants";
import type { ModeSpecificColor } from "../styles/types/types";

// https://github.com/bgrins/TinyColor/blob/master/npm/tinycolor.js#L784
export function getDefaultTheme() {
  return `return {
  "var": {
    "color": {
      "primary": {
        "light": "${(DEFAULT_THEME.color.primary as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.primary as ModeSpecificColor).dark}"
      },
      "info": {
        "light": "${(DEFAULT_THEME.color.info as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.info as ModeSpecificColor).dark}"
      },
      "success": {
        "light": "${(DEFAULT_THEME.color.success as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.success as ModeSpecificColor).dark}"
      },
      "warning": {
        "light": "${(DEFAULT_THEME.color.warning as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.warning as ModeSpecificColor).dark}"
      },
      "error": {
        "light": "${(DEFAULT_THEME.color.error as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.error as ModeSpecificColor).dark}"
      },
      "text": {
        "light": "${(DEFAULT_THEME.color.text as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.text as ModeSpecificColor).dark}"
      },
      "background": {
        "light": "${(DEFAULT_THEME.color.background as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.background as ModeSpecificColor).dark}"
      },
      "border": {
        "light": "${(DEFAULT_THEME.color.border as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.border as ModeSpecificColor).dark}"
      },
      "muted": {
        "light": "${(DEFAULT_THEME.color.muted as ModeSpecificColor).light}",
        "dark": "${(DEFAULT_THEME.color.muted as ModeSpecificColor).dark}"
      }
    },
    // Custom spacing for mobile-first design
    spacing: {
      xxs: "0.125rem",
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      xxl: "3rem"
    },
    // Border radius for modern look
    borderRadius: {
      sm: "0.375rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
      full: "9999px"
    },
    // Animation timing
    animation: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms"
    },
    // Touch-friendly sizing
    touch: {
      minTarget: "44px",
      button: "48px",
      input: "52px"
    },
    // Typography scale
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      xxl: "1.5rem",
      title: "2rem"
    },
  }
}`;
}
