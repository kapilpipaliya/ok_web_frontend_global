export const TextField = [
  {
    "componentName": "string",
    "description": "The controlled value of the text field to check.",
    "property": "value"
  },
  {
    "componentName": "string",
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value of the textfield changes.",
    "property": "onChange"
  },
  {
    "componentName": "string",
    "description": "The name of the text field, used when submitting an HTML form. See MDN.",
    "property": "name"
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the text field should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState"
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must fill the text field before the owning form can be submitted.",
    "property": "required"
  },
  {
    "componentName": "boolean",
    "description": "Whether the text field is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the text field items can be selected but not changed by the user.",
    "property": "readOnly"
  }
];

export const TextFieldTextArea = [
  {
    "componentName": "boolean",
    "description": "Whether the textarea should adjust its height when the value changes.",
    "property": "autoResize"
  },
  {
    "componentName": "boolean",
    "description": "Whether the form should be submitted when the user presses the enter key.",
    "property": "submitOnEnter"
  }
];

export const TextFieldErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];