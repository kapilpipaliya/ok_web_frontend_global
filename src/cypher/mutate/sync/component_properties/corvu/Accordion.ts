export const Accordion = [
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether multiple accordion items can be expanded at the same time.",
    "key": "multiple",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string | string[] | null",
    "default": "-",
    "description": "The value of the accordion.",
    "key": "value",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(value: string | string[] | null) => void",
    "default": "-",
    "description": "Callback fired when the value changes.",
    "key": "onValueChange",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string | string[] | null",
    "default": "null",
    "description": "The value of the accordion initially.",
    "key": "initialValue",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the accordion can be fully collapsed.",
    "key": "collapsible",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the accordion is disabled.",
    "key": "disabled",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "'vertical' | 'horizontal'",
    "default": "vertical",
    "description": "The orientation of the accordion.",
    "key": "orientation",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the accordion should loop when navigating with the keyboard.",
    "key": "loop",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "'ltr' | 'rtl'",
    "default": "ltr",
    "description": "The text direction of the accordion.",
    "key": "textDirection",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "'remove' | 'hide'",
    "default": "remove",
    "description": "Whether the accordion content should be removed or hidden when collapsed. Useful if you want to always render the content for SEO reasons.",
    "key": "collapseBehavior",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the accordion context. Useful if you have nested accordions and want to create components that belong to a accordion higher up in the tree.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Root"
  }
];

export const AccordionItem = [
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "Value of the accordion item.",
    "key": "value",
    "corvu": true,
    "hashName": "Item"
  },
  {
    "componentName": "boolean",
    "default": "-",
    "description": "Whether the accordion item is disabled. Used to override the default provided by .",
    "key": "disabled",
    "corvu": true,
    "hashName": "Item"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the accordion item trigger element.",
    "key": "triggerId",
    "corvu": true,
    "hashName": "Item"
  },
  {
    "componentName": "ValidComponent",
    "default": "Fragment",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Item"
  }
];