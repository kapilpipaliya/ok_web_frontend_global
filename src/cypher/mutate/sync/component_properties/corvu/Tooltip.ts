export const Tooltip = [
  {
    "componentName": "boolean",
    "default": "-",
    "description": "Whether the tooltip is open.",
    "name": "open",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(open: boolean) => void",
    "default": "-",
    "description": "Callback fired when the open state changes.",
    "name": "onOpenChange",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the tooltip is open initially.",
    "name": "initialOpen",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "Placement",
    "default": "'bottom'",
    "description": "The initial placement of the tooltip.",
    "name": "placement",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "Strategy",
    "default": "'absolute'",
    "description": "The strategy to use when positioning the tooltip.",
    "name": "strategy",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "FloatingOptions | null",
    "default": "{ flip: true, shift: true }",
    "description": "Floating options of the tooltip.",
    "name": "floatingOptions",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "number",
    "default": "500",
    "description": "The delay in milliseconds before the tooltip opens after the mouse pointer is moved over the trigger.",
    "name": "openDelay",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "number",
    "default": "0",
    "description": "The delay in milliseconds before the tooltip closes after the mouse pointer leaves.",
    "name": "closeDelay",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "number",
    "default": "0",
    "description": "The duration in milliseconds that the tooltip should ignore the openDelay when the mouse pointer leaves and re-enters.",
    "name": "skipDelayDuration",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip content should be hoverable.",
    "name": "hoverableContent",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "'true' | string",
    "default": "-",
    "description": "Optionally add this tooltip to a group. With the same group property will close when another tooltip in the same group opens.",
    "name": "group",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should open when the trigger is focused.",
    "name": "openOnFocus",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: FocusEvent) => void",
    "default": "-",
    "description": "Callback fired when the trigger is focused and openOnFocus is true. Can be prevented by calling event.preventDefault.",
    "name": "onFocus",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: FocusEvent) => void",
    "default": "-",
    "description": "Callback fired when the trigger is blurred and openOnFocus is true. Can be prevented by calling event.preventDefault.",
    "name": "onBlur",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should open when the mouse pointer is moved over the trigger.",
    "name": "openOnHover",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "default": "-",
    "description": "Callback fired when the mouse pointer is moved over the trigger and openOnHover is true. Can be prevented by calling event.preventDefault.",
    "name": "onHover",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "default": "-",
    "description": "Callback fired when the mouse pointer leaves the tooltip and openOnHover is true. Can be prevented by calling event.preventDefault.",
    "name": "onLeave",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should close when the user presses the Escape key.",
    "name": "closeOnEscapeKeyDown",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "default": "-",
    "description": "Callback fired when the user presses the Escape key. Can be prevented by calling event.preventDefault.",
    "name": "onEscapeKeyDown",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should close when the user presses on the trigger.",
    "name": "closeOnPointerDown",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "default": "-",
    "description": "Callback fired when the user presses on the trigger and closeOnPointerDown is true. Can be prevented by calling event.preventDefault.",
    "name": "onPointerDown",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should close when the user scrolls.",
    "name": "closeOnScroll",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "(event: Event) => void",
    "default": "-",
    "description": "Callback fired when the user scrolls and the tooltip is about to close. Can be prevented by calling event.preventDefault.",
    "name": "onScroll",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the tooltip element.",
    "name": "tooltipId",
    "corvu": true,
    "hashName": "Root"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context. Useful if you have nested tooltips and want to create components that belong to a tooltip higher up in the tree.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Root"
  }
];

export const TooltipAnchor = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Anchor"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Anchor"
  }
];

export const TooltipTrigger = [
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
    "description": "The id of the tooltip context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Trigger"
  }
];

export const TooltipPortal = [
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the tooltip portal should be forced to render. Useful when using third-party animation libraries.",
    "name": "forceMount",
    "corvu": true,
    "hashName": "Portal"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Portal"
  }
];

export const TooltipContent = [
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the tooltip content should be forced to render. Useful when using third-party animation libraries.",
    "name": "forceMount",
    "corvu": true,
    "hashName": "Content"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Content"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Content"
  }
];

export const TooltipArrow = [
  {
    "componentName": "number",
    "default": "16",
    "description": "Size of the arrow in px.",
    "name": "size",
    "corvu": true,
    "hashName": "Arrow"
  },
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "name": "as",
    "corvu": true,
    "hashName": "Arrow"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "name": "contextId",
    "corvu": true,
    "hashName": "Arrow"
  }
];