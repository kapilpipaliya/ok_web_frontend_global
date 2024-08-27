export const RadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the radio button to check.",
    "property": "value"
  },
  {
    "componentName": "string",
    "description": "The value of the radio button that should be checked when initially rendered. Useful when you do not need to control the state of the radio buttons.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "property": "onChange"
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The axis the radio group items should align with.",
    "property": "orientation"
  },
  {
    "componentName": "string",
    "description": "The name of the radio group. Submitted with its owning form as part of a name/value pair.",
    "property": "name"
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the radio group should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState"
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "property": "required"
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "property": "readOnly"
  }
];

export const RadioGroupErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];

export const RadioGroupItem = [
  {
    "componentName": "string",
    "description": "The value of the radio button, used when submitting an HTML form. See MDN.",
    "property": "value"
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio button is disabled or not.",
    "property": "disabled"
  }
];

export const RadioGroupItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];