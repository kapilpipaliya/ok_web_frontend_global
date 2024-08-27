export const Disclosure = [
  {
    "componentName": "boolean",
    "default": "-",
    "description": "Whether the disclosure is expanded.",
    "property": "expanded"
  },
  {
    "componentName": "(expanded: boolean) => void",
    "default": "-",
    "description": "Callback fired when the expanded state changes.",
    "property": "onExpandedChange"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the disclosure is expanded initially.",
    "property": "initialExpanded"
  },
  {
    "componentName": "'remove' | 'hide'",
    "default": "remove",
    "description": "Whether the disclosure content should be removed or hidden when collapsed. Useful if you want to always render the content for SEO reasons.",
    "property": "collapseBehavior"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the disclosure content element.",
    "property": "disclosureId"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context. Useful if you have nested disclosures and want to create components that belong to a disclosure higher up in the tree.",
    "property": "contextId"
  }
];

export const DisclosureTrigger = [
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "property": "contextId"
  }
];

export const DisclosureContent = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the disclosure content should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "property": "contextId"
  }
];