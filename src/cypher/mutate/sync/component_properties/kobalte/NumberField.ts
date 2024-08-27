export const NumberField = [
  {
    "componentName": "string | number",
    "description": "The controlled formatted value of the number field.",
    "name": "value",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "string | number",
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "name": "defaultValue",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value of the NumberField changes as a formatted value.",
    "name": "onChange",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The controlled raw value of the number field.",
    "name": "rawValue",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "(value: number) => void",
    "description": "Event handler called when the value of the NumberField changes as a number.",
    "name": "onRawValueChange",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The smallest value allowed in the number field, defaults to Number.MIN_SAFE_INTEGER.",
    "name": "minValue",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The largest value allowed in the number field, defaults to Number.MAX_SAFE_INTEGER.",
    "name": "maxValue",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "Increment/Decrement step when using the triggers or the arrows on keyboard in the number field.",
    "name": "step",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "Increment/Decrement step when using the Page UP/Down keys in the number field, defaults 10 * step.",
    "name": "largeStep",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to increment/decrement on wheel scroll inside the number field.",
    "name": "changeOnWheel",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to format the input value.",
    "name": "format",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "Intl.NumberFormatOptions",
    "description": "Formating options for the value of the number field.",
    "name": "formatOptions",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "RegExp",
    "description": "Allowed input characters in the number field (only prevents onInput, not paste), defaults to locale and format characters.",
    "name": "allowedInput",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the NumberField.HiddenInput of the number field, used when submitting an HTML form. See MDN.",
    "name": "name",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the number field should display its \"valid\" or \"invalid\" visual styling.",
    "name": "validationState",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must fill the number field before the owning form can be submitted.",
    "name": "required",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the number field is disabled.",
    "name": "disabled",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the number field items can be selected but not changed by the user.",
    "name": "readOnly",
    "hashName": "numberfield",
    "kobalte": true
  }
];

export const NumberFieldErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "numberfielderrormessage",
    "kobalte": true
  }
];