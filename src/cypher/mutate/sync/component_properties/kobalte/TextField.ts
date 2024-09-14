export const TextField = [
  {
    "componentName": "string",
    "description": "The controlled value of the text field to check.",
    "hashName": "textfield",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The default value when initially rendered. Useful when you do not need to control the value.",
    "hashName": "textfield",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value of the textfield changes.",
    "hashName": "textfield",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the text field, used when submitting an HTML form. See MDN.",
    "hashName": "textfield",
    "key": "name",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the text field should display its \"valid\" or \"invalid\" visual styling.",
    "hashName": "textfield",
    "key": "validationState",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must fill the text field before the owning form can be submitted.",
    "hashName": "textfield",
    "key": "required",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the text field is disabled.",
    "hashName": "textfield",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the text field items can be selected but not changed by the user.",
    "hashName": "textfield",
    "key": "readOnly",
    "kobalte": true
  }
];

export const TextFieldTextArea = [
  {
    "componentName": "boolean",
    "description": "Whether the textarea should adjust its height when the value changes.",
    "hashName": "textfieldtextarea",
    "key": "autoResize",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the form should be submitted when the user presses the enter key.",
    "hashName": "textfieldtextarea",
    "key": "submitOnEnter",
    "kobalte": true
  }
];

export const TextFieldErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "textfielderrormessage",
    "key": "forceMount",
    "kobalte": true
  }
];