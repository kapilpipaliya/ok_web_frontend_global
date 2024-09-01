export const NumberField = [
  {
    "componentName": "string | number",
    "description": "The controlled formatted value of the number field.",
    "key": "value",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "string | number",
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "key": "defaultValue",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value of the NumberField changes as a formatted value.",
    "key": "onChange",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The controlled raw value of the number field.",
    "key": "rawValue",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "(value: number) => void",
    "description": "Event handler called when the value of the NumberField changes as a number.",
    "key": "onRawValueChange",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The smallest value allowed in the number field, defaults to Number.MIN_SAFE_INTEGER.",
    "key": "minValue",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The largest value allowed in the number field, defaults to Number.MAX_SAFE_INTEGER.",
    "key": "maxValue",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "Increment/Decrement step when using the triggers or the arrows on keyboard in the number field.",
    "key": "step",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "Increment/Decrement step when using the Page UP/Down keys in the number field, defaults 10 * step.",
    "key": "largeStep",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to increment/decrement on wheel scroll inside the number field.",
    "key": "changeOnWheel",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to format the input value.",
    "key": "format",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "Intl.NumberFormatOptions",
    "description": "Formating options for the value of the number field.",
    "key": "formatOptions",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "RegExp",
    "description": "Allowed input characters in the number field (only prevents onInput, not paste), defaults to locale and format characters.",
    "key": "allowedInput",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the NumberField.HiddenInput of the number field, used when submitting an HTML form. See MDN.",
    "key": "name",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the number field should display its \"valid\" or \"invalid\" visual styling.",
    "key": "validationState",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must fill the number field before the owning form can be submitted.",
    "key": "required",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the number field is disabled.",
    "key": "disabled",
    "hashName": "numberfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the number field items can be selected but not changed by the user.",
    "key": "readOnly",
    "hashName": "numberfield",
    "kobalte": true
  }
];

export const NumberFieldErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "numberfielderrormessage",
    "kobalte": true
  }
];