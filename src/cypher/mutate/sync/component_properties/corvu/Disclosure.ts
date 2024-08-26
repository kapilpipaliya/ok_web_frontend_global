export const Disclosure = [
  {
    "default": "-",
    "description": "Whether the disclosure is expanded.",
    "property": "expanded",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the expanded state changes.",
    "property": "onExpandedChange",
    "type": "(expanded: boolean) => void"
  },
  {
    "default": "false",
    "description": "Whether the disclosure is expanded initially.",
    "property": "initialExpanded",
    "type": "boolean"
  },
  {
    "default": "remove",
    "description": "Whether the disclosure content should be removed or hidden when collapsed. Useful if you want to always render the content for SEO reasons.",
    "property": "collapseBehavior",
    "type": "'remove' | 'hide'"
  },
  {
    "default": "createUniqueId()",
    "description": "The id attribute of the disclosure content element.",
    "property": "disclosureId",
    "type": "string"
  },
  {
    "default": "-",
    "description": "The id of the disclosure context. Useful if you have nested disclosures and want to create components that belong to a disclosure higher up in the tree.",
    "property": "contextId",
    "type": "string"
  }
];

export const DisclosureTrigger = [
  {
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const DisclosureContent = [
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "false",
    "description": "Whether the disclosure content should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "The id of the disclosure context to use.",
    "property": "contextId",
    "type": "string"
  }
];