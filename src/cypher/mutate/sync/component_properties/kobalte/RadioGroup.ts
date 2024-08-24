export const RadioGroup = [
  {
    "description": "The controlled value of the radio button to check.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "The value of the radio button that should be checked when initially rendered. Useful when you do not need to control the state of the radio buttons.",
    "property": "defaultValue",
    "type": "string"
  },
  {
    "description": "Event handler called when the value changes.",
    "property": "onChange",
    "type": "(value: string) => void"
  },
  {
    "description": "The axis the radio group items should align with.",
    "property": "orientation",
    "type": "'horizontal' | 'vertical'"
  },
  {
    "description": "The name of the radio group. Submitted with its owning form as part of a name/value pair.",
    "property": "name",
    "type": "string"
  },
  {
    "description": "Whether the radio group should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState",
    "type": "'valid' | 'invalid'"
  },
  {
    "description": "Whether the user must check a radio group item before the owning form can be submitted.",
    "property": "required",
    "type": "boolean"
  },
  {
    "description": "Whether the radio group is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the radio group items can be selected but not changed by the user.",
    "property": "readOnly",
    "type": "boolean"
  }
];

export const RadioGroupErrorMessage = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];

export const RadioGroupItem = [
  {
    "description": "The value of the radio button, used when submitting an HTML form. See MDN.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Whether the radio button is disabled or not.",
    "property": "disabled",
    "type": "boolean"
  }
];

export const RadioGroupItemIndicator = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];