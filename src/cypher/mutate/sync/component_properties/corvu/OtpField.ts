export const OtpField = [
  {
    "componentName": "number",
    "corvu": true,
    "default": "-",
    "description": "Max number of chars. Is required.",
    "hashName": "Root",
    "key": "maxLength"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The value of the OTP Field.",
    "hashName": "Root",
    "key": "value"
  },
  {
    "componentName": "(value: string) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the OTP Field value changes.",
    "hashName": "Root",
    "key": "onValueChange"
  },
  {
    "componentName": "(value: string) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the OTP Field is filled.",
    "hashName": "Root",
    "key": "onComplete"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether to create extra space on the right for password managers.",
    "hashName": "Root",
    "key": "shiftPWManagers"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the OTP Field context. Useful if you have nested OTP Fields and want to create components that belong to an OTP Field higher up in the tree.",
    "hashName": "Root",
    "key": "contextId"
  },
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Root",
    "key": "as"
  }
];

export const OtpFieldInput = [
  {
    "componentName": "string | null",
    "corvu": true,
    "default": "'^\\\\d*$'",
    "description": "Regex pattern for the input. null disables the pattern and allow all chars.",
    "hashName": "Input",
    "key": "pattern"
  },
  {
    "componentName": "string | null",
    "corvu": true,
    "default": "-",
    "description": "Override the styles to apply when JavaScript is disabled. corvu provides a default for this but you're free to define your own styling. null disables the fallback.",
    "hashName": "Input",
    "key": "noScriptCSSFallback"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the OTP Field context. Useful if you have nested OTP Fields and want to create components that belong to an OTP Field higher up in the tree.",
    "hashName": "Input",
    "key": "contextId"
  },
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "input",
    "description": "Component to render the dynamic component as.",
    "hashName": "Input",
    "key": "as"
  }
];