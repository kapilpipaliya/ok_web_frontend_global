export const Tabs = [
  {
    "componentName": "string",
    "description": "The controlled value of the tab to activate.",
    "hashName": "tabs-1",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the tab that should be active when initially rendered. Useful when you do not need to control the state.",
    "hashName": "tabs-1",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "tabs-1",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "'horizontal' | 'vertical'",
    "description": "The orientation of the tabs.",
    "hashName": "tabs-1",
    "key": "orientation",
    "kobalte": true
  },
  {
    "componentName": "'automatic' | 'manual'",
    "description": "Whether tabs are activated automatically on focus or manually.",
    "hashName": "tabs-1",
    "key": "activationMode",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the tabs are disabled.",
    "hashName": "tabs-1",
    "key": "disabled",
    "kobalte": true
  }
];

export const TabsTrigger = [
  {
    "componentName": "string",
    "description": "The unique key that associates the tab with a tab panel.",
    "hashName": "tabstrigger",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the tab should be disabled.",
    "hashName": "tabstrigger",
    "key": "disabled",
    "kobalte": true
  }
];

export const TabsContent = [
  {
    "componentName": "string",
    "description": "The unique key that associates the tab panel with a tab.",
    "hashName": "tabscontent",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "tabscontent",
    "key": "forceMount",
    "kobalte": true
  }
];