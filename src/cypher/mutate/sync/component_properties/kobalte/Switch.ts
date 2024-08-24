export const Switch = [
  {
    "description": "The controlled checked state of the switch.",
    "property": "checked",
    "type": "boolean"
  },
  {
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "property": "defaultChecked",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the checked state of the switch changes.",
    "property": "onChange",
    "type": "(checked: boolean) => void"
  },
  {
    "description": "The name of the switch, used when submitting an HTML form. See MDN.",
    "property": "name",
    "type": "string"
  },
  {
    "description": "The value of the switch, used when submitting an HTML form. See MDN.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Whether the switch should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState",
    "type": "'valid' | 'invalid'"
  },
  {
    "description": "Whether the user must check the switch before the owning form can be submitted.",
    "property": "required",
    "type": "boolean"
  },
  {
    "description": "Whether the switch is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the switch can be checked but not changed by the user.",
    "property": "readOnly",
    "type": "boolean"
  },
  {
    "description": "Whether the switch is checked or not.",
    "property": "checked",
    "type": "Accessor<boolean>"
  }
];

export const SwitchErrorMessage = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];