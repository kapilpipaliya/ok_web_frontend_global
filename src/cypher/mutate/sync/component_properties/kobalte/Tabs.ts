export const Tabs = [
  {
    "componentName": "string",
    "description": "The controlled value of the tab to activate.",
    "property": "value"
  },
  {
    "componentName": "string",
    "description": "The value of the tab that should be active when initially rendered. Useful when you do not need to control the state.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "property": "onChange"
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the tabs.",
    "property": "orientation"
  },
  {
    "componentName": "'automatic' | 'manual'",
    "description": "Whether tabs are activated automatically on focus or manually.",
    "property": "activationMode"
  },
  {
    "componentName": "boolean",
    "description": "Whether the tabs are disabled.",
    "property": "disabled"
  }
];

export const TabsTrigger = [
  {
    "componentName": "string",
    "description": "The unique key that associates the tab with a tab panel.",
    "property": "value"
  },
  {
    "componentName": "boolean",
    "description": "Whether the tab should be disabled.",
    "property": "disabled"
  }
];

export const TabsContent = [
  {
    "componentName": "string",
    "description": "The unique key that associates the tab panel with a tab.",
    "property": "value"
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];