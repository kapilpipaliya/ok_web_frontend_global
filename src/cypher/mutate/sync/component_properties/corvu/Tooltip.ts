export const Tooltip = [
  {
    "default": "-",
    "description": "Whether the tooltip is open.",
    "property": "open",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the open state changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "default": "false",
    "description": "Whether the tooltip is open initially.",
    "property": "initialOpen",
    "type": "boolean"
  },
  {
    "default": "'bottom'",
    "description": "The initial placement of the tooltip.",
    "property": "placement",
    "type": "Placement"
  },
  {
    "default": "'absolute'",
    "description": "The strategy to use when positioning the tooltip.",
    "property": "strategy",
    "type": "Strategy"
  },
  {
    "default": "{ flip: true, shift: true }",
    "description": "Floating options of the tooltip.",
    "property": "floatingOptions",
    "type": "FloatingOptions | null"
  },
  {
    "default": "500",
    "description": "The delay in milliseconds before the tooltip opens after the mouse pointer is moved over the trigger.",
    "property": "openDelay",
    "type": "number"
  },
  {
    "default": "0",
    "description": "The delay in milliseconds before the tooltip closes after the mouse pointer leaves.",
    "property": "closeDelay",
    "type": "number"
  },
  {
    "default": "0",
    "description": "The duration in milliseconds that the tooltip should ignore the openDelay when the mouse pointer leaves and re-enters.",
    "property": "skipDelayDuration",
    "type": "number"
  },
  {
    "default": "true",
    "description": "Whether the tooltip content should be hoverable.",
    "property": "hoverableContent",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Optionally add this tooltip to a group. With the same group property will close when another tooltip in the same group opens.",
    "property": "group",
    "type": "'true' | string"
  },
  {
    "default": "true",
    "description": "Whether the tooltip should open when the trigger is focused.",
    "property": "openOnFocus",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the trigger is focused and openOnFocus is true. Can be prevented by calling event.preventDefault.",
    "property": "onFocus",
    "type": "(event: FocusEvent) => void"
  },
  {
    "default": "-",
    "description": "Callback fired when the trigger is blurred and openOnFocus is true. Can be prevented by calling event.preventDefault.",
    "property": "onBlur",
    "type": "(event: FocusEvent) => void"
  },
  {
    "default": "true",
    "description": "Whether the tooltip should open when the mouse pointer is moved over the trigger.",
    "property": "openOnHover",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the mouse pointer is moved over the trigger and openOnHover is true. Can be prevented by calling event.preventDefault.",
    "property": "onHover",
    "type": "(event: MouseEvent) => void"
  },
  {
    "default": "-",
    "description": "Callback fired when the mouse pointer leaves the tooltip and openOnHover is true. Can be prevented by calling event.preventDefault.",
    "property": "onLeave",
    "type": "(event: MouseEvent) => void"
  },
  {
    "default": "true",
    "description": "Whether the tooltip should close when the user presses the Escape key.",
    "property": "closeOnEscapeKeyDown",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the user presses the Escape key. Can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown",
    "type": "(event: KeyboardEvent) => void"
  },
  {
    "default": "true",
    "description": "Whether the tooltip should close when the user presses on the trigger.",
    "property": "closeOnPointerDown",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the user presses on the trigger and closeOnPointerDown is true. Can be prevented by calling event.preventDefault.",
    "property": "onPointerDown",
    "type": "(event: MouseEvent) => void"
  },
  {
    "default": "true",
    "description": "Whether the tooltip should close when the user scrolls.",
    "property": "closeOnScroll",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "Callback fired when the user scrolls and the tooltip is about to close. Can be prevented by calling event.preventDefault.",
    "property": "onScroll",
    "type": "(event: Event) => void"
  },
  {
    "default": "createUniqueId()",
    "description": "The id attribute of the tooltip element.",
    "property": "tooltipId",
    "type": "string"
  },
  {
    "default": "-",
    "description": "The id of the tooltip context. Useful if you have nested tooltips and want to create components that belong to a tooltip higher up in the tree.",
    "property": "contextId",
    "type": "string"
  }
];

export const TooltipAnchor = [
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const TooltipTrigger = [
  {
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const TooltipPortal = [
  {
    "default": "false",
    "description": "Whether the tooltip portal should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const TooltipContent = [
  {
    "default": "false",
    "description": "Whether the tooltip content should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  },
  {
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "property": "contextId",
    "type": "string"
  }
];

export const TooltipArrow = [
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
    "description": "The id of the tooltip context to use.",
    "property": "contextId",
    "type": "string"
  }
];