export const TextField = [
  {
    "componentName": "string",
    "description": "The controlled value of the text field to check.",
    "key": "value",
    "hashName": "textfield",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "key": "defaultValue",
    "hashName": "textfield",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value of the textfield changes.",
    "key": "onChange",
    "hashName": "textfield",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the text field, used when submitting an HTML form. See MDN.",
    "key": "name",
    "hashName": "textfield",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the text field should display its \"valid\" or \"invalid\" visual styling.",
    "key": "validationState",
    "hashName": "textfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must fill the text field before the owning form can be submitted.",
    "key": "required",
    "hashName": "textfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the text field is disabled.",
    "key": "disabled",
    "hashName": "textfield",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the text field items can be selected but not changed by the user.",
    "key": "readOnly",
    "hashName": "textfield",
    "kobalte": true
  }
];

export const TextFieldTextArea = [
  {
    "componentName": "boolean",
    "description": "Whether the textarea should adjust its height when the value changes.",
    "key": "autoResize",
    "hashName": "textfieldtextarea",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the form should be submitted when the user presses the enter key.",
    "key": "submitOnEnter",
    "hashName": "textfieldtextarea",
    "kobalte": true
  }
];

export const TextFieldErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "textfielderrormessage",
    "kobalte": true
  }
];