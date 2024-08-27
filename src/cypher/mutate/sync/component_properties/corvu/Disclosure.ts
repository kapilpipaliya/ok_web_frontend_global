export const Disclosure = [
  {
    "componentName": "boolean",
    "default": "-",
    "description": "Whether the disclosure is expanded.",
    "name": "expanded",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(expanded: boolean) => void",
    "default": "-",
    "description": "Callback fired when the expanded state changes.",
    "name": "onExpandedChange",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the disclosure is expanded initially.",
    "name": "initialExpanded",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "'remove' | 'hide'",
    "default": "remove",
    "description": "Whether the disclosure content should be removed or hidden when collapsed. Useful if you want to always render the content for SEO reasons.",
    "name": "collapseBehavior",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the disclosure content element.",
    "name": "disclosureId",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context. Useful if you have nested disclosures and want to create components that belong to a disclosure higher up in the tree.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Root"
  }
];

export const DisclosureTrigger = [
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Trigger"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Trigger"
  }
];

export const DisclosureContent = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Content"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the disclosure content should be forced to render. Useful when using third-party animation libraries.",
    "name": "forceMount",
    "corvu": true,
    "hashName": "Content"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Content"
  }
];