export const ToggleButton = [
  {
    "componentName": "boolean",
    "description": "The controlled pressed state of the toggle button.",
    "hashName": "togglebutton",
    "key": "pressed",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default pressed state when initially rendered. Useful when you do not need to control the pressed state.",
    "hashName": "togglebutton",
    "key": "defaultPressed",
    "kobalte": true
  },
  {
    "componentName": "(pressed: boolean) => void",
    "description": "Event handler called when the pressed state of the toggle button changes.",
    "hashName": "togglebutton",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element | (state: ToggleButtonState) => JSX.Element",
    "description": "The children of the toggle button. Can be a JSX.Element or a render prop for having access to the internal state.",
    "hashName": "togglebutton",
    "key": "children",
    "kobalte": true
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the toggle button is on (pressed) or off (not pressed).",
    "hashName": "togglebutton",
    "key": "pressed",
    "kobalte": true
  }
];