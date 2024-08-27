export const Tabs = [
  {
    "componentName": "string",
    "description": "The controlled value of the tab to activate.",
    "name": "value",
    "hashName": "tabs-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the tab that should be active when initially rendered. Useful when you do not need to control the state.",
    "name": "defaultValue",
    "hashName": "tabs-1",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "name": "onChange",
    "hashName": "tabs-1",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the tabs.",
    "name": "orientation",
    "hashName": "tabs-1",
    "kobalte": true
  },
  {
    "componentName": "'automatic' | 'manual'",
    "description": "Whether tabs are activated automatically on focus or manually.",
    "name": "activationMode",
    "hashName": "tabs-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the tabs are disabled.",
    "name": "disabled",
    "hashName": "tabs-1",
    "kobalte": true
  }
];

export const TabsTrigger = [
  {
    "componentName": "string",
    "description": "The unique key that associates the tab with a tab panel.",
    "name": "value",
    "hashName": "tabstrigger",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the tab should be disabled.",
    "name": "disabled",
    "hashName": "tabstrigger",
    "kobalte": true
  }
];

export const TabsContent = [
  {
    "componentName": "string",
    "description": "The unique key that associates the tab panel with a tab.",
    "name": "value",
    "hashName": "tabscontent",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "tabscontent",
    "kobalte": true
  }
];