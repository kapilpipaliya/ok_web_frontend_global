export const ToggleGroup = [
  {
    "componentName": "string | string[]",
    "description": "The controlled pressed state of the toggle button.",
    "name": "value",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "string | string[]",
    "description": "The default pressed state when initially rendered. Useful when you do not need to control the pressed state.",
    "name": "defaultValue",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "(value: string | string[]) => void",
    "description": "Event handler called when the pressed state of an item changes.",
    "name": "onChange",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the toggle group allows multi-selection.",
    "name": "multiple",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the toggle group.",
    "name": "orientation",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether toggle group should be disabled.",
    "name": "disabled",
    "hashName": "togglegroup",
    "kobalte": true
  }
];

export const ToggleGroupItem = [
  {
    "componentName": "string",
    "description": "A unique value for the item.",
    "name": "value",
    "hashName": "togglegroupitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled.",
    "name": "disabled",
    "hashName": "togglegroupitem",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element | (state: ToggleButtonState) => JSX.Element",
    "description": "The children of the item. Can be a JSX.Element or a render prop for having access to the internal state.",
    "name": "children",
    "hashName": "togglegroupitem",
    "kobalte": true
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the toggle button is on (pressed) or off (not pressed).",
    "name": "pressed",
    "hashName": "togglegroupitem",
    "kobalte": true
  }
];