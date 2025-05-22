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
  DEFAULT_ACCENT_DARK,
  DEFAULT_BASE_DARK,
  DEFAULT_ERROR_DARK,
  DEFAULT_INFO_DARK,
  DEFAULT_NEUTRAL_DARK,
  DEFAULT_PRIMARY_DARK,
  DEFAULT_SECONDARY_DARK,
  DEFAULT_SUCCESS_DARK,
  DEFAULT_WARNING_DARK,
} from "../styles/constants";

// https://github.com/bgrins/TinyColor/blob/master/npm/tinycolor.js#L784
export function getDefaultTheme() {
  return `return {
  "var": {
    "color": {
      "primary": {
        "light": "${DEFAULT_PRIMARY}",
        "dark": "${DEFAULT_PRIMARY_DARK}"
      },
      "secondary": {
        "light": "${DEFAULT_SECONDARY}",
        "dark": "${DEFAULT_SECONDARY_DARK}"
      },
      "accent": {
        "light": "${DEFAULT_ACCENT}",
        "dark": "${DEFAULT_ACCENT_DARK}"
      },
      "neutral": {
        "light": "${DEFAULT_NEUTRAL}",
        "dark": "${DEFAULT_NEUTRAL_DARK}"
      },
      "base": {
        "light": "${DEFAULT_BASE}",
        "dark": "${DEFAULT_BASE_DARK}"
      },
      "info": {
        "light": "${DEFAULT_INFO}",
        "dark": "${DEFAULT_INFO_DARK}"
      },
      "success": {
        "light": "${DEFAULT_SUCCESS}",
        "dark": "${DEFAULT_SUCCESS_DARK}"
      },
      "warning": {
        "light": "${DEFAULT_WARNING}",
        "dark": "${DEFAULT_WARNING_DARK}"
      },
      "error": {
        "light": "${DEFAULT_ERROR}",
        "dark": "${DEFAULT_ERROR_DARK}"
      }
    }
  }
}`;
}
