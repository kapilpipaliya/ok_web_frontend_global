export const ToggleButton = [
  {
    "componentName": "boolean",
    "description": "The controlled pressed state of the toggle button.",
    "property": "pressed"
  },
  {
    "componentName": "boolean",
    "description": "The default pressed state when initially rendered. Useful when you do not need to control the pressed state.",
    "property": "defaultPressed"
  },
  {
    "componentName": "(pressed: boolean) => void",
    "description": "Event handler called when the pressed state of the toggle button changes.",
    "property": "onChange"
  },
  {
    "componentName": "JSX.Element | (state: ToggleButtonState) => JSX.Element",
    "description": "The children of the toggle button. Can be a JSX.Element or a render prop for having access to the internal state.",
    "property": "children"
  },
  {
    "componentName": "Accessor<boolean>",
    "description": "Whether the toggle button is on (pressed) or off (not pressed).",
    "property": "pressed"
  }
];