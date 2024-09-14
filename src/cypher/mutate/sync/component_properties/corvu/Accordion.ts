export const Accordion = [
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether multiple accordion items can be expanded at the same time.",
    "hashName": "Root",
    "key": "multiple"
  },
  {
    "componentName": "string | string[] | null",
    "corvu": true,
    "default": "-",
    "description": "The value of the accordion.",
    "hashName": "Root",
    "key": "value"
  },
  {
    "componentName": "(value: string | string[] | null) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the value changes.",
    "hashName": "Root",
    "key": "onValueChange"
  },
  {
    "componentName": "string | string[] | null",
    "corvu": true,
    "default": "null",
    "description": "The value of the accordion initially.",
    "hashName": "Root",
    "key": "initialValue"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the accordion can be fully collapsed.",
    "hashName": "Root",
    "key": "collapsible"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the accordion is disabled.",
    "hashName": "Root",
    "key": "disabled"
  },
  {
    "componentName": "'vertical' | 'horizontal'",
    "corvu": true,
    "default": "vertical",
    "description": "The orientation of the accordion.",
    "hashName": "Root",
    "key": "orientation"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the accordion should loop when navigating with the keyboard.",
    "hashName": "Root",
    "key": "loop"
  },
  {
    "componentName": "'ltr' | 'rtl'",
    "corvu": true,
    "default": "ltr",
    "description": "The text direction of the accordion.",
    "hashName": "Root",
    "key": "textDirection"
  },
  {
    "componentName": "'remove' | 'hide'",
    "corvu": true,
    "default": "remove",
    "description": "Whether the accordion content should be removed or hidden when collapsed. Useful if you want to always render the content for SEO reasons.",
    "hashName": "Root",
    "key": "collapseBehavior"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the accordion context. Useful if you have nested accordions and want to create components that belong to a accordion higher up in the tree.",
    "hashName": "Root",
    "key": "contextId"
  }
];

export const AccordionItem = [
  {
    "componentName": "string",
    "corvu": true,
    "default": "createUniqueId()",
    "description": "Value of the accordion item.",
    "hashName": "Item",
    "key": "value"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "-",
    "description": "Whether the accordion item is disabled. Used to override the default provided by .",
    "hashName": "Item",
    "key": "disabled"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "createUniqueId()",
    "description": "The id attribute of the accordion item trigger element.",
    "hashName": "Item",
    "key": "triggerId"
  },
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "Fragment",
    "description": "Component to render the dynamic component as.",
    "hashName": "Item",
    "key": "as"
  }
];