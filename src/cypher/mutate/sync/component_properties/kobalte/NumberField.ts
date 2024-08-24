export const NumberField = [
  {
    "description": "The controlled formatted value of the number field.",
    "property": "value",
    "type": "string | number"
  },
  {
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "property": "defaultValue",
    "type": "string | number"
  },
  {
    "description": "Event handler called when the value of the NumberField changes as a formatted value.",
    "property": "onChange",
    "type": "(value: string) => void"
  },
  {
    "description": "The controlled raw value of the number field.",
    "property": "rawValue",
    "type": "number"
  },
  {
    "description": "Event handler called when the value of the NumberField changes as a number.",
    "property": "onRawValueChange",
    "type": "(value: number) => void"
  },
  {
    "description": "The smallest value allowed in the number field, defaults to Number.MIN_SAFE_INTEGER.",
    "property": "minValue",
    "type": "number"
  },
  {
    "description": "The largest value allowed in the number field, defaults to Number.MAX_SAFE_INTEGER.",
    "property": "maxValue",
    "type": "number"
  },
  {
    "description": "Increment/Decrement step when using the triggers or the arrows on keyboard in the number field.",
    "property": "step",
    "type": "number"
  },
  {
    "description": "Increment/Decrement step when using the Page UP/Down keys in the number field, defaults 10 * step.",
    "property": "largeStep",
    "type": "number"
  },
  {
    "description": "Whether to increment/decrement on wheel scroll inside the number field.",
    "property": "changeOnWheel",
    "type": "boolean"
  },
  {
    "description": "Whether to format the input value.",
    "property": "format",
    "type": "boolean"
  },
  {
    "description": "Formating options for the value of the number field.",
    "property": "formatOptions",
    "type": "Intl.NumberFormatOptions"
  },
  {
    "description": "Allowed input characters in the number field (only prevents onInput, not paste), defaults to locale and format characters.",
    "property": "allowedInput",
    "type": "RegExp"
  },
  {
    "description": "The name of the NumberField.HiddenInput of the number field, used when submitting an HTML form. See MDN.",
    "property": "name",
    "type": "string"
  },
  {
    "description": "Whether the number field should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState",
    "type": "'valid' | 'invalid'"
  },
  {
    "description": "Whether the user must fill the number field before the owning form can be submitted.",
    "property": "required",
    "type": "boolean"
  },
  {
    "description": "Whether the number field is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the number field items can be selected but not changed by the user.",
    "property": "readOnly",
    "type": "boolean"
  }
];

export const NumberFieldErrorMessage = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];