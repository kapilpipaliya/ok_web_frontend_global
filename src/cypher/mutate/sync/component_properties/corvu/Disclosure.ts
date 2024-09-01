export const Disclosure = [
  {
    "componentName": "boolean",
    "default": "-",
    "description": "Whether the disclosure is expanded.",
    "key": "expanded",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(expanded: boolean) => void",
    "default": "-",
    "description": "Callback fired when the expanded state changes.",
    "key": "onExpandedChange",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the disclosure is expanded initially.",
    "key": "initialExpanded",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "'remove' | 'hide'",
    "default": "remove",
    "description": "Whether the disclosure content should be removed or hidden when collapsed. Useful if you want to always render the content for SEO reasons.",
    "key": "collapseBehavior",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the disclosure content element.",
    "key": "disclosureId",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context. Useful if you have nested disclosures and want to create components that belong to a disclosure higher up in the tree.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Root"
  }
];

export const DisclosureTrigger = [
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Trigger"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Trigger"
  }
];

export const DisclosureContent = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Content"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the disclosure content should be forced to render. Useful when using third-party animation libraries.",
    "key": "forceMount",
    "corvu": true,
    "hashName": "Content"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Content"
  }
];