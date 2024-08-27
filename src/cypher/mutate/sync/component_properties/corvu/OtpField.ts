export const OtpField = [
  {
    "componentName": "number",
    "default": "-",
    "description": "Max number of chars. Is required.",
    "property": "maxLength"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The value of the OTP Field.",
    "property": "value"
  },
  {
    "componentName": "(value: string) => void",
    "default": "-",
    "description": "Callback fired when the OTP Field value changes.",
    "property": "onValueChange"
  },
  {
    "componentName": "(value: string) => void",
    "default": "-",
    "description": "Callback fired when the OTP Field is filled.",
    "property": "onComplete"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether to create extra space on the right for password managers.",
    "property": "shiftPWManagers"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the OTP Field context. Useful if you have nested OTP Fields and want to create components that belong to an OTP Field higher up in the tree.",
    "property": "contextId"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  }
];

export const OtpFieldInput = [
  {
    "componentName": "string | null",
    "default": "'^\\\\d*$'",
    "description": "Regex pattern for the input. null disables the pattern and allow all chars.",
    "property": "pattern"
  },
  {
    "componentName": "string | null",
    "default": "-",
    "description": "Override the styles to apply when JavaScript is disabled. corvu provides a default for this but you're free to define your own styling. null disables the fallback.",
    "property": "noScriptCSSFallback"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the OTP Field context. Useful if you have nested OTP Fields and want to create components that belong to an OTP Field higher up in the tree.",
    "property": "contextId"
  },
  {
    "componentName": "ValidComponent",
    "default": "input",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  }
];