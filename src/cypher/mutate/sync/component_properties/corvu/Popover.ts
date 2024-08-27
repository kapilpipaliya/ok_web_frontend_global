export const Popover = [
  {
    "componentName": "Placement",
    "default": "'bottom'",
    "description": "The initial placement of the popover.",
    "property": "placement"
  },
  {
    "componentName": "Strategy",
    "default": "'absolute'",
    "description": "The strategy to use when positioning the popover.",
    "property": "strategy"
  },
  {
    "componentName": "FloatingOptions | null",
    "default": "{ flip: true, shift: true }",
    "description": "Floating options of the popover.",
    "property": "floatingOptions"
  }
];

export const PopoverAnchor = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the popover context to use.",
    "property": "contextId"
  }
];

export const PopoverArrow = [
  {
    "componentName": "number",
    "default": "16",
    "description": "Size of the arrow in px.",
    "property": "size"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the popover context to use.",
    "property": "contextId"
  }
];