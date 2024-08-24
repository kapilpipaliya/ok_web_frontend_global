export const ToggleGroup = [
  {
    "description": "The controlled pressed state of the toggle button.",
    "property": "value",
    "type": "string | string[]"
  },
  {
    "description": "The default pressed state when initially rendered. Useful when you do not need to control the pressed state.",
    "property": "defaultValue",
    "type": "string | string[]"
  },
  {
    "description": "Event handler called when the pressed state of an item changes.",
    "property": "onChange",
    "type": "(value: string | string[]) => void"
  },
  {
    "description": "Whether the toggle group allows multi-selection.",
    "property": "multiple",
    "type": "boolean"
  },
  {
    "description": "The orientation of the toggle group.",
    "property": "orientation",
    "type": "'horizontal' | 'vertical'"
  },
  {
    "description": "Whether toggle group should be disabled.",
    "property": "disabled",
    "type": "boolean"
  }
];

export const ToggleGroupItem = [
  {
    "description": "A unique value for the item.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Whether the item is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "The children of the item. Can be a JSX.Element or a render prop for having access to the internal state.",
    "property": "children",
    "type": "JSX.Element | (state: ToggleButtonState) => JSX.Element"
  },
  {
    "description": "Whether the toggle button is on (pressed) or off (not pressed).",
    "property": "pressed",
    "type": "Accessor<boolean>"
  }
];