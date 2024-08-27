export const Switch = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the switch.",
    "property": "checked"
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "property": "defaultChecked"
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the switch changes.",
    "property": "onChange"
  },
  {
    "componentName": "string",
    "description": "The name of the switch, used when submitting an HTML form. See MDN.",
    "property": "name"
  },
  {
    "componentName": "string",
    "description": "The value of the switch, used when submitting an HTML form. See MDN.",
    "property": "value"
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the switch should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState"
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check the switch before the owning form can be submitted.",
    "property": "required"
  },
  {
    "componentName": "boolean",
    "description": "Whether the switch is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the switch can be checked but not changed by the user.",
    "property": "readOnly"
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the switch is checked or not.",
    "property": "checked"
  }
];

export const SwitchErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];