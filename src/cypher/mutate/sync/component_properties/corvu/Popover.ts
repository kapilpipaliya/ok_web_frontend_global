export const Popover = [
  {
    "componentName": "Placement",
    "corvu": true,
    "default": "'bottom'",
    "description": "The initial placement of the popover.",
    "hashName": "Root",
    "key": "placement"
  },
  {
    "componentName": "Strategy",
    "corvu": true,
    "default": "'absolute'",
    "description": "The strategy to use when positioning the popover.",
    "hashName": "Root",
    "key": "strategy"
  },
  {
    "componentName": "FloatingOptions | null",
    "corvu": true,
    "default": "{ flip: true, shift: true }",
    "description": "Floating options of the popover.",
    "hashName": "Root",
    "key": "floatingOptions"
  }
];

export const PopoverAnchor = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Anchor",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the popover context to use.",
    "hashName": "Anchor",
    "key": "contextId"
  }
];

export const PopoverArrow = [
  {
    "componentName": "number",
    "corvu": true,
    "default": "16",
    "description": "Size of the arrow in px.",
    "hashName": "Arrow",
    "key": "size"
  },
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Arrow",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the popover context to use.",
    "hashName": "Arrow",
    "key": "contextId"
  }
];