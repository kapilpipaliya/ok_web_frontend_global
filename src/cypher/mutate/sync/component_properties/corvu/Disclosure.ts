export const Disclosure = [
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "-",
    "description": "Whether the disclosure is expanded.",
    "hashName": "Root",
    "key": "expanded"
  },
  {
    "componentName": "(expanded: boolean) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the expanded state changes.",
    "hashName": "Root",
    "key": "onExpandedChange"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the disclosure is expanded initially.",
    "hashName": "Root",
    "key": "initialExpanded"
  },
  {
    "componentName": "'remove' | 'hide'",
    "corvu": true,
    "default": "remove",
    "description": "Whether the disclosure content should be removed or hidden when collapsed. Useful if you want to always render the content for SEO reasons.",
    "hashName": "Root",
    "key": "collapseBehavior"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "createUniqueId()",
    "description": "The id attribute of the disclosure content element.",
    "hashName": "Root",
    "key": "disclosureId"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the disclosure context. Useful if you have nested disclosures and want to create components that belong to a disclosure higher up in the tree.",
    "hashName": "Root",
    "key": "contextId"
  }
];

export const DisclosureTrigger = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "hashName": "Trigger",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "hashName": "Trigger",
    "key": "contextId"
  }
];

export const DisclosureContent = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Content",
    "key": "as"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the disclosure content should be forced to render. Useful when using third-party animation libraries.",
    "hashName": "Content",
    "key": "forceMount"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "hashName": "Content",
    "key": "contextId"
  }
];