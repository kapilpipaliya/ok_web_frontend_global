export const Checkbox = [
  {
    "description": "The controlled checked state of the checkbox.",
    "property": "checked",
    "type": "boolean"
  },
  {
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "property": "defaultChecked",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the checked state of the checkbox changes.",
    "property": "onChange",
    "type": "(checked: boolean) => void"
  },
  {
    "description": "Whether the checkbox is in an indeterminate state.",
    "property": "indeterminate",
    "type": "boolean"
  },
  {
    "description": "The name of the checkbox, used when submitting an HTML form. See MDN.",
    "property": "name",
    "type": "string"
  },
  {
    "description": "The value of the checkbox, used when submitting an HTML form. See MDN.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Whether the checkbox should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState",
    "type": "'valid' | 'invalid'"
  },
  {
    "description": "Whether the user must check the checkbox before the owning form can be submitted.",
    "property": "required",
    "type": "boolean"
  },
  {
    "description": "Whether the checkbox is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the checkbox can be checked but not changed by the user.",
    "property": "readOnly",
    "type": "boolean"
  },
  {
    "description": "The children of the checkbox. Can be a JSX.Element or a render prop for having access to the internal state.",
    "property": "children",
    "type": "JSX.Element | (state: CheckboxState) => JSX.Element"
  },
  {
    "description": "Whether the checkbox is checked or not.",
    "property": "checked",
    "type": "Accessor<boolean>"
  },
  {
    "description": "Whether the checkbox is in an indeterminate state.",
    "property": "indeterminate",
    "type": "Accessor<boolean>"
  }
];

export const CheckboxIndicator = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];

export const CheckboxErrorMessage = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];