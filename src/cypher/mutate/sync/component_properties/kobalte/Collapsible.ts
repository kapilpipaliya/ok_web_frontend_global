export const Collapsible = [
  {
    "description": "The controlled open state of the collapsible.",
    "property": "open",
    "type": "boolean"
  },
  {
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the open state of the collapsible changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "description": "Whether the collapsible is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Used to force mounting the collapsible content when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];