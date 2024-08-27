export const ToggleGroup = [
  {
    "componentName": "string | string[]",
    "description": "The controlled pressed state of the toggle button.",
    "property": "value"
  },
  {
    "componentName": "string | string[]",
    "description": "The default pressed state when initially rendered. Useful when you do not need to control the pressed state.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: string | string[]) => void",
    "description": "Event handler called when the pressed state of an item changes.",
    "property": "onChange"
  },
  {
    "componentName": "boolean",
    "description": "Whether the toggle group allows multi-selection.",
    "property": "multiple"
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the toggle group.",
    "property": "orientation"
  },
  {
    "componentName": "boolean",
    "description": "Whether toggle group should be disabled.",
    "property": "disabled"
  }
];

export const ToggleGroupItem = [
  {
    "componentName": "string",
    "description": "A unique value for the item.",
    "property": "value"
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "JSX.Element | (state: ToggleButtonState) => JSX.Element",
    "description": "The children of the item. Can be a JSX.Element or a render prop for having access to the internal state.",
    "property": "children"
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the toggle button is on (pressed) or off (not pressed).",
    "property": "pressed"
  }
];