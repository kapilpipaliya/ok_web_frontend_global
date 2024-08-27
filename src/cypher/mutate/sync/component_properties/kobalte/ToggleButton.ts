export const ToggleButton = [
  {
    "componentName": "boolean",
    "description": "The controlled pressed state of the toggle button.",
    "name": "pressed",
    "hashName": "togglebutton",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default pressed state when initially rendered. Useful when you do not need to control the pressed state.",
    "name": "defaultPressed",
    "hashName": "togglebutton",
    "kobalte": true
  },
  {
    "componentName": "(pressed: boolean) => void",
    "description": "Event handler called when the pressed state of the toggle button changes.",
    "name": "onChange",
    "hashName": "togglebutton",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element | (state: ToggleButtonState) => JSX.Element",
    "description": "The children of the toggle button. Can be a JSX.Element or a render prop for having access to the internal state.",
    "name": "children",
    "hashName": "togglebutton",
    "kobalte": true
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the toggle button is on (pressed) or off (not pressed).",
    "name": "pressed",
    "hashName": "togglebutton",
    "kobalte": true
  }
];