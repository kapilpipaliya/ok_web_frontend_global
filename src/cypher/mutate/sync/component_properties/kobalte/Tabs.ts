export const Tabs = [
  {
    "description": "The controlled value of the tab to activate.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "The value of the tab that should be active when initially rendered. Useful when you do not need to control the state.",
    "property": "defaultValue",
    "type": "string"
  },
  {
    "description": "Event handler called when the value changes.",
    "property": "onChange",
    "type": "(value: string) => void"
  },
  {
    "description": "The orientation of the tabs.",
    "property": "orientation",
    "type": "'horizontal' | 'vertical'"
  },
  {
    "description": "Whether tabs are activated automatically on focus or manually.",
    "property": "activationMode",
    "type": "'automatic' | 'manual'"
  },
  {
    "description": "Whether the tabs are disabled.",
    "property": "disabled",
    "type": "boolean"
  }
];

export const TabsTrigger = [
  {
    "description": "The unique key that associates the tab with a tab panel.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Whether the tab should be disabled.",
    "property": "disabled",
    "type": "boolean"
  }
];

export const TabsContent = [
  {
    "description": "The unique key that associates the tab panel with a tab.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];