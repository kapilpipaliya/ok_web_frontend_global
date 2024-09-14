export const ToggleGroup = [
  {
    "componentName": "string | string[]",
    "description": "The controlled pressed state of the toggle button.",
    "hashName": "togglegroup",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string | string[]",
    "description": "The default pressed state when initially rendered. Useful when you do not need to control the pressed state.",
    "hashName": "togglegroup",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string | string[]) => void",
    "description": "Event handler called when the pressed state of an item changes.",
    "hashName": "togglegroup",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the toggle group allows multi-selection.",
    "hashName": "togglegroup",
    "key": "multiple",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the toggle group.",
    "hashName": "togglegroup",
    "key": "orientation",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether toggle group should be disabled.",
    "hashName": "togglegroup",
    "key": "disabled",
    "kobalte": true
  }
];

export const ToggleGroupItem = [
  {
    "componentName": "string",
    "description": "A unique value for the item.",
    "hashName": "togglegroupitem",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled.",
    "hashName": "togglegroupitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element | (state: ToggleButtonState) => JSX.Element",
    "description": "The children of the item. Can be a JSX.Element or a render prop for having access to the internal state.",
    "hashName": "togglegroupitem",
    "key": "children",
    "kobalte": true
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the toggle button is on (pressed) or off (not pressed).",
    "hashName": "togglegroupitem",
    "key": "pressed",
    "kobalte": true
  }
];