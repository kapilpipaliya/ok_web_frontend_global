export const Collapsible = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the collapsible.",
    "property": "open"
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen"
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the collapsible changes.",
    "property": "onOpenChange"
  },
  {
    "componentName": "boolean",
    "description": "Whether the collapsible is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the collapsible content when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];