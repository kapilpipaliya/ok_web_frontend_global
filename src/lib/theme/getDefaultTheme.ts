import {
  DEFAULT_ERROR,
  DEFAULT_INFO,
  DEFAULT_PRIMARY,
  DEFAULT_SUCCESS,
  DEFAULT_WARNING,
  DEFAULT_TEXT,
  DEFAULT_BACKGROUND,
  DEFAULT_SURFACE,
  DEFAULT_BORDER,
  DEFAULT_MUTED,
  DEFAULT_ERROR_DARK,
  DEFAULT_INFO_DARK,
  DEFAULT_PRIMARY_DARK,
  DEFAULT_SUCCESS_DARK,
  DEFAULT_WARNING_DARK,
  DEFAULT_TEXT_DARK,
  DEFAULT_BACKGROUND_DARK,
  DEFAULT_SURFACE_DARK,
  DEFAULT_BORDER_DARK,
  DEFAULT_MUTED_DARK,
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
      },
      "text": {
        "light": "${DEFAULT_TEXT}",
        "dark": "${DEFAULT_TEXT_DARK}"
      },
      "background": {
        "light": "${DEFAULT_BACKGROUND}",
        "dark": "${DEFAULT_BACKGROUND_DARK}"
      },
      "surface": {
        "light": "${DEFAULT_SURFACE}",
        "dark": "${DEFAULT_SURFACE_DARK}"
      },
      "border": {
        "light": "${DEFAULT_BORDER}",
        "dark": "${DEFAULT_BORDER_DARK}"
      },
      "muted": {
        "light": "${DEFAULT_MUTED}",
        "dark": "${DEFAULT_MUTED_DARK}"
      }
    }
  }
}`;
}
