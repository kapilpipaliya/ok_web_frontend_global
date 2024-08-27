export const Checkbox = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the checkbox.",
    "property": "checked"
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "property": "defaultChecked"
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the checkbox changes.",
    "property": "onChange"
  },
  {
    "componentName": "boolean",
    "description": "Whether the checkbox is in an indeterminate state.",
    "property": "indeterminate"
  },
  {
    "componentName": "string",
    "description": "The name of the checkbox, used when submitting an HTML form. See MDN.",
    "property": "name"
  },
  {
    "componentName": "string",
    "description": "The value of the checkbox, used when submitting an HTML form. See MDN.",
    "property": "value"
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the checkbox should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState"
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must check the checkbox before the owning form can be submitted.",
    "property": "required"
  },
  {
    "componentName": "boolean",
    "description": "Whether the checkbox is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the checkbox can be checked but not changed by the user.",
    "property": "readOnly"
  },
  {
    "componentName": "JSX.Element | (state: CheckboxState) => JSX.Element",
    "description": "The children of the checkbox. Can be a JSX.Element or a render prop for having access to the internal state.",
    "property": "children"
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the checkbox is checked or not.",
    "property": "checked"
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the checkbox is in an indeterminate state.",
    "property": "indeterminate"
  }
];

export const CheckboxIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];

export const CheckboxErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];