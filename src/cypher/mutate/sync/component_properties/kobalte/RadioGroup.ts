export const RadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the radio button to check.",
    "hashName": "radiogroup",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the radio button that should be checked when initially rendered. Useful when you do not need to control the state of the radio buttons.",
    "hashName": "radiogroup",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "radiogroup",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The axis the radio group items should align with.",
    "hashName": "radiogroup",
    "key": "orientation",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the radio group. Submitted with its owning form as part of a name/value pair.",
    "hashName": "radiogroup",
    "key": "name",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the radio group should display its \"valid\" or \"invalid\" visual styling.",
    "hashName": "radiogroup",
    "key": "validationState",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "hashName": "radiogroup",
    "key": "required",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled.",
    "hashName": "radiogroup",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "hashName": "radiogroup",
    "key": "readOnly",
    "kobalte": true
  }
];

export const RadioGroupErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "radiogrouperrormessage",
    "key": "forceMount",
    "kobalte": true
  }
];

export const RadioGroupItem = [
  {
    "componentName": "string",
    "description": "The value of the radio button, used when submitting an HTML form. See MDN.",
    "hashName": "radiogroupitem",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio button is disabled or not.",
    "hashName": "radiogroupitem",
    "key": "disabled",
    "kobalte": true
  }
];

export const RadioGroupItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "radiogroupitemindicator",
    "key": "forceMount",
    "kobalte": true
  }
];