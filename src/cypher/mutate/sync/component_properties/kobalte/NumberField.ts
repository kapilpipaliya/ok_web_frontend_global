export const NumberField = [
  {
    "componentName": "string | number",
    "description": "The controlled formatted value of the number field.",
    "property": "value"
  },
  {
    "componentName": "string | number",
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value of the NumberField changes as a formatted value.",
    "property": "onChange"
  },
  {
    "componentName": "number",
    "description": "The controlled raw value of the number field.",
    "property": "rawValue"
  },
  {
    "componentName": "(value: number) => void",
    "description": "Event handler called when the value of the NumberField changes as a number.",
    "property": "onRawValueChange"
  },
  {
    "componentName": "number",
    "description": "The smallest value allowed in the number field, defaults to Number.MIN_SAFE_INTEGER.",
    "property": "minValue"
  },
  {
    "componentName": "number",
    "description": "The largest value allowed in the number field, defaults to Number.MAX_SAFE_INTEGER.",
    "property": "maxValue"
  },
  {
    "componentName": "number",
    "description": "Increment/Decrement step when using the triggers or the arrows on keyboard in the number field.",
    "property": "step"
  },
  {
    "componentName": "number",
    "description": "Increment/Decrement step when using the Page UP/Down keys in the number field, defaults 10 * step.",
    "property": "largeStep"
  },
  {
    "componentName": "boolean",
    "description": "Whether to increment/decrement on wheel scroll inside the number field.",
    "property": "changeOnWheel"
  },
  {
    "componentName": "boolean",
    "description": "Whether to format the input value.",
    "property": "format"
  },
  {
    "componentName": "Intl.NumberFormatOptions",
    "description": "Formating options for the value of the number field.",
    "property": "formatOptions"
  },
  {
    "componentName": "RegExp",
    "description": "Allowed input characters in the number field (only prevents onInput, not paste), defaults to locale and format characters.",
    "property": "allowedInput"
  },
  {
    "componentName": "string",
    "description": "The name of the NumberField.HiddenInput of the number field, used when submitting an HTML form. See MDN.",
    "property": "name"
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the number field should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState"
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must fill the number field before the owning form can be submitted.",
    "property": "required"
  },
  {
    "componentName": "boolean",
    "description": "Whether the number field is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the number field items can be selected but not changed by the user.",
    "property": "readOnly"
  }
];

export const NumberFieldErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];