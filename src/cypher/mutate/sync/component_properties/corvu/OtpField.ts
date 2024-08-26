export const OtpField = [
  {
    "default": "-",
    "description": "Max number of chars. Is required.",
    "property": "maxLength",
    "type": "number"
  },
  {
    "default": "-",
    "description": "The value of the OTP Field.",
    "property": "value",
    "type": "string"
  },
  {
    "default": "-",
    "description": "Callback fired when the OTP Field value changes.",
    "property": "onValueChange",
    "type": "(value: string) => void"
  },
  {
    "default": "-",
    "description": "Callback fired when the OTP Field is filled.",
    "property": "onComplete",
    "type": "(value: string) => void"
  },
  {
    "default": "true",
    "description": "Whether to create extra space on the right for password managers.",
    "property": "shiftPWManagers",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "The id of the OTP Field context. Useful if you have nested OTP Fields and want to create components that belong to an OTP Field higher up in the tree.",
    "property": "contextId",
    "type": "string"
  },
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  }
];

export const OtpFieldInput = [
  {
    "default": "'^\\\\d*$'",
    "description": "Regex pattern for the input. null disables the pattern and allow all chars.",
    "property": "pattern",
    "type": "string | null"
  },
  {
    "default": "-",
    "description": "Override the styles to apply when JavaScript is disabled. corvu provides a default for this but you're free to define your own styling. null disables the fallback.",
    "property": "noScriptCSSFallback",
    "type": "string | null"
  },
  {
    "default": "-",
    "description": "The id of the OTP Field context. Useful if you have nested OTP Fields and want to create components that belong to an OTP Field higher up in the tree.",
    "property": "contextId",
    "type": "string"
  },
  {
    "default": "input",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  }
];