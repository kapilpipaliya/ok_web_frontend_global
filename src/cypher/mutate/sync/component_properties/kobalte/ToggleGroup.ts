export const ToggleGroup = [
  {
    "componentName": "string | string[]",
    "description": "The controlled pressed state of the toggle button.",
    "key": "value",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "string | string[]",
    "description": "The default pressed state when initially rendered. Useful when you do not need to control the pressed state.",
    "key": "defaultValue",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "(value: string | string[]) => void",
    "description": "Event handler called when the pressed state of an item changes.",
    "key": "onChange",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the toggle group allows multi-selection.",
    "key": "multiple",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the toggle group.",
    "key": "orientation",
    "hashName": "togglegroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether toggle group should be disabled.",
    "key": "disabled",
    "hashName": "togglegroup",
    "kobalte": true
  }
];

export const ToggleGroupItem = [
  {
    "componentName": "string",
    "description": "A unique value for the item.",
    "key": "value",
    "hashName": "togglegroupitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled.",
    "key": "disabled",
    "hashName": "togglegroupitem",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element | (state: ToggleButtonState) => JSX.Element",
    "description": "The children of the item. Can be a JSX.Element or a render prop for having access to the internal state.",
    "key": "children",
    "hashName": "togglegroupitem",
    "kobalte": true
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the toggle button is on (pressed) or off (not pressed).",
    "key": "pressed",
    "hashName": "togglegroupitem",
    "kobalte": true
  }
];