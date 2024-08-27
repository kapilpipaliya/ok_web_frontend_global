export const RadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the radio button to check.",
    "name": "value",
    "hashName": "radiogroup",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the radio button that should be checked when initially rendered. Useful when you do not need to control the state of the radio buttons.",
    "name": "defaultValue",
    "hashName": "radiogroup",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "name": "onChange",
    "hashName": "radiogroup",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The axis the radio group items should align with.",
    "name": "orientation",
    "hashName": "radiogroup",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the radio group. Submitted with its owning form as part of a name/value pair.",
    "name": "name",
    "hashName": "radiogroup",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the radio group should display its \"valid\" or \"invalid\" visual styling.",
    "name": "validationState",
    "hashName": "radiogroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "name": "required",
    "hashName": "radiogroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled.",
    "name": "disabled",
    "hashName": "radiogroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "name": "readOnly",
    "hashName": "radiogroup",
    "kobalte": true
  }
];

export const RadioGroupErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "radiogrouperrormessage",
    "kobalte": true
  }
];

export const RadioGroupItem = [
  {
    "componentName": "string",
    "description": "The value of the radio button, used when submitting an HTML form. See MDN.",
    "name": "value",
    "hashName": "radiogroupitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio button is disabled or not.",
    "name": "disabled",
    "hashName": "radiogroupitem",
    "kobalte": true
  }
];

export const RadioGroupItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "radiogroupitemindicator",
    "kobalte": true
  }
];