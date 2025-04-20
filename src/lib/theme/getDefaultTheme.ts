import { DEFAULT_INFO, DEFAULT_ACCENT, DEFAULT_WARNING, DEFAULT_BASE, DEFAULT_NEUTRAL, DEFAULT_ERROR, DEFAULT_SUCCESS } from "../styles/constants";

import { DEFAULT_PRIMARY, DEFAULT_SECONDARY } from "../styles/constants";

// https://github.com/bgrins/TinyColor/blob/master/npm/tinycolor.js#L784
export function getDefaultTheme() {
  return `return {
  "var": {
    "primary": "${DEFAULT_PRIMARY}",
    "secondary": "${DEFAULT_SECONDARY}", 
    "accent": "${DEFAULT_ACCENT}",
    "neutral": "${DEFAULT_NEUTRAL}",
    "base": "${DEFAULT_BASE}",
    "info": "${DEFAULT_INFO}",
    "success": "${DEFAULT_SUCCESS}",
    "warning": "${DEFAULT_WARNING}",
    "error": "${DEFAULT_ERROR}"
  }
}`;
}
