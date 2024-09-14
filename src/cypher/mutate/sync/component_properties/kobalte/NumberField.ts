export const NumberField = [
  {
    "componentName": "string | number",
    "description": "The controlled formatted value of the number field.",
    "hashName": "numberfield",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string | number",
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "hashName": "numberfield",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value of the NumberField changes as a formatted value.",
    "hashName": "numberfield",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The controlled raw value of the number field.",
    "hashName": "numberfield",
    "key": "rawValue",
    "kobalte": true
  },
  {
    "componentName": "(value: number) => void",
    "description": "Event handler called when the value of the NumberField changes as a number.",
    "hashName": "numberfield",
    "key": "onRawValueChange",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The smallest value allowed in the number field, defaults to Number.MIN_SAFE_INTEGER.",
    "hashName": "numberfield",
    "key": "minValue",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The largest value allowed in the number field, defaults to Number.MAX_SAFE_INTEGER.",
    "hashName": "numberfield",
    "key": "maxValue",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "Increment/Decrement step when using the triggers or the arrows on keyboard in the number field.",
    "hashName": "numberfield",
    "key": "step",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "Increment/Decrement step when using the Page UP/Down keys in the number field, defaults 10 * step.",
    "hashName": "numberfield",
    "key": "largeStep",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to increment/decrement on wheel scroll inside the number field.",
    "hashName": "numberfield",
    "key": "changeOnWheel",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to format the input value.",
    "hashName": "numberfield",
    "key": "format",
    "kobalte": true
  },
  {
    "componentName": "Intl.NumberFormatOptions",
    "description": "Formating options for the value of the number field.",
    "hashName": "numberfield",
    "key": "formatOptions",
    "kobalte": true
  },
  {
    "componentName": "RegExp",
    "description": "Allowed input characters in the number field (only prevents onInput, not paste), defaults to locale and format characters.",
    "hashName": "numberfield",
    "key": "allowedInput",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the NumberField.HiddenInput of the number field, used when submitting an HTML form. See MDN.",
    "hashName": "numberfield",
    "key": "name",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the number field should display its \"valid\" or \"invalid\" visual styling.",
    "hashName": "numberfield",
    "key": "validationState",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must fill the number field before the owning form can be submitted.",
    "hashName": "numberfield",
    "key": "required",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the number field is disabled.",
    "hashName": "numberfield",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the number field items can be selected but not changed by the user.",
    "hashName": "numberfield",
    "key": "readOnly",
    "kobalte": true
  }
];

export const NumberFieldErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "numberfielderrormessage",
    "key": "forceMount",
    "kobalte": true
  }
];