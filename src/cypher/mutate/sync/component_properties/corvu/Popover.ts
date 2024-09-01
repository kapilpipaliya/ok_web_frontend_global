export const Popover = [
  {
    "componentName": "Placement",
    "default": "'bottom'",
    "description": "The initial placement of the popover.",
    "key": "placement",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "Strategy",
    "default": "'absolute'",
    "description": "The strategy to use when positioning the popover.",
    "key": "strategy",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "FloatingOptions | null",
    "default": "{ flip: true, shift: true }",
    "description": "Floating options of the popover.",
    "key": "floatingOptions",
    "corvu": true,
    "hashName": "Root"
  }
];

export const PopoverAnchor = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Anchor"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the popover context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Anchor"
  }
];

export const PopoverArrow = [
  {
    "componentName": "number",
    "default": "16",
    "description": "Size of the arrow in px.",
    "key": "size",
    "corvu": true,
    "hashName": "Arrow"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "key": "as",
    "corvu": true,
    "hashName": "Arrow"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the popover context to use.",
    "key": "contextId",
    "corvu": true,
    "hashName": "Arrow"
  }
];