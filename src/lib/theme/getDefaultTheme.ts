import {
  DEFAULT_ACCENT,
  DEFAULT_BASE,
  DEFAULT_ERROR,
  DEFAULT_INFO,
  DEFAULT_NEUTRAL,
  DEFAULT_PRIMARY,
  DEFAULT_SECONDARY,
  DEFAULT_SUCCESS,
  DEFAULT_WARNING,
} from "../styles/constants";

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
