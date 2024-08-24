export const PopoverRoot = [
  {
    "default": "'bottom'",
    "description": "The initial placement of the popover.",
    "property": "placement",
    "type": "Placement"
  },
  {
    "default": "'absolute'",
    "description": "The strategy to use when positioning the popover.",
    "property": "strategy",
    "type": "Strategy"
  },
  {
    "default": "{ flip: true, shift: true }",
    "description": "Floating options of the popover.",
    "property": "floatingOptions",
    "type": "FloatingOptions | null"
  }
];

export const PopoverAnchor = [
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the popover context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const PopoverArrow = [
  {
    "default": "16",
    "description": "Size of the arrow in px.",
    "property": "size",
    "type": "number"
  },
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the popover context to use.",
    "property": "contextId",
    "type": "string"
  }
];