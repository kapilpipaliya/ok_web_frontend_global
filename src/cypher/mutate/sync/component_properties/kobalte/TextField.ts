export const TextField = [
  {
    "description": "The controlled value of the text field to check.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "property": "defaultValue",
    "type": "string"
  },
  {
    "description": "Event handler called when the value of the textfield changes.",
    "property": "onChange",
    "type": "(value: string) => void"
  },
  {
    "description": "The name of the text field, used when submitting an HTML form. See MDN.",
    "property": "name",
    "type": "string"
  },
  {
    "description": "Whether the text field should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState",
    "type": "'valid' | 'invalid'"
  },
  {
    "description": "Whether the user must fill the text field before the owning form can be submitted.",
    "property": "required",
    "type": "boolean"
  },
  {
    "description": "Whether the text field is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the text field items can be selected but not changed by the user.",
    "property": "readOnly",
    "type": "boolean"
  }
];

export const TextFieldTextArea = [
  {
    "description": "Whether the textarea should adjust its height when the value changes.",
    "property": "autoResize",
    "type": "boolean"
  },
  {
    "description": "Whether the form should be submitted when the user presses the enter key.",
    "property": "submitOnEnter",
    "type": "boolean"
  }
];

export const TextFieldErrorMessage = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];