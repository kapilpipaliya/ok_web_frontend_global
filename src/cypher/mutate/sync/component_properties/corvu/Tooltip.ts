export const Tooltip = [
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "-",
    "description": "Whether the tooltip is open.",
    "hashName": "Root",
    "key": "open"
  },
  {
    "componentName": "(open: boolean) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the open state changes.",
    "hashName": "Root",
    "key": "onOpenChange"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the tooltip is open initially.",
    "hashName": "Root",
    "key": "initialOpen"
  },
  {
    "componentName": "Placement",
    "corvu": true,
    "default": "'bottom'",
    "description": "The initial placement of the tooltip.",
    "hashName": "Root",
    "key": "placement"
  },
  {
    "componentName": "Strategy",
    "corvu": true,
    "default": "'absolute'",
    "description": "The strategy to use when positioning the tooltip.",
    "hashName": "Root",
    "key": "strategy"
  },
  {
    "componentName": "FloatingOptions | null",
    "corvu": true,
    "default": "{ flip: true, shift: true }",
    "description": "Floating options of the tooltip.",
    "hashName": "Root",
    "key": "floatingOptions"
  },
  {
    "componentName": "number",
    "corvu": true,
    "default": "500",
    "description": "The delay in milliseconds before the tooltip opens after the mouse pointer is moved over the trigger.",
    "hashName": "Root",
    "key": "openDelay"
  },
  {
    "componentName": "number",
    "corvu": true,
    "default": "0",
    "description": "The delay in milliseconds before the tooltip closes after the mouse pointer leaves.",
    "hashName": "Root",
    "key": "closeDelay"
  },
  {
    "componentName": "number",
    "corvu": true,
    "default": "0",
    "description": "The duration in milliseconds that the tooltip should ignore the openDelay when the mouse pointer leaves and re-enters.",
    "hashName": "Root",
    "key": "skipDelayDuration"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the tooltip content should be hoverable.",
    "hashName": "Root",
    "key": "hoverableContent"
  },
  {
    "componentName": "'true' | string",
    "corvu": true,
    "default": "-",
    "description": "Optionally add this tooltip to a group. With the same group property will close when another tooltip in the same group opens.",
    "hashName": "Root",
    "key": "group"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the tooltip should open when the trigger is focused.",
    "hashName": "Root",
    "key": "openOnFocus"
  },
  {
    "componentName": "(event: FocusEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the trigger is focused and openOnFocus is true. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onFocus"
  },
  {
    "componentName": "(event: FocusEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the trigger is blurred and openOnFocus is true. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onBlur"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the tooltip should open when the mouse pointer is moved over the trigger.",
    "hashName": "Root",
    "key": "openOnHover"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the mouse pointer is moved over the trigger and openOnHover is true. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onHover"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the mouse pointer leaves the tooltip and openOnHover is true. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onLeave"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the tooltip should close when the user presses the Escape key.",
    "hashName": "Root",
    "key": "closeOnEscapeKeyDown"
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the user presses the Escape key. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onEscapeKeyDown"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the tooltip should close when the user presses on the trigger.",
    "hashName": "Root",
    "key": "closeOnPointerDown"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the user presses on the trigger and closeOnPointerDown is true. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onPointerDown"
  },
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "true",
    "description": "Whether the tooltip should close when the user scrolls.",
    "hashName": "Root",
    "key": "closeOnScroll"
  },
  {
    "componentName": "(event: Event) => void",
    "corvu": true,
    "default": "-",
    "description": "Callback fired when the user scrolls and the tooltip is about to close. Can be prevented by calling event.preventDefault.",
    "hashName": "Root",
    "key": "onScroll"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "createUniqueId()",
    "description": "The id attribute of the tooltip element.",
    "hashName": "Root",
    "key": "tooltipId"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the tooltip context. Useful if you have nested tooltips and want to create components that belong to a tooltip higher up in the tree.",
    "hashName": "Root",
    "key": "contextId"
  }
];

export const TooltipAnchor = [
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
    "description": "The id of the tooltip context to use.",
    "hashName": "Anchor",
    "key": "contextId"
  }
];

export const TooltipTrigger = [
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "hashName": "Trigger",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "hashName": "Trigger",
    "key": "contextId"
  }
];

export const TooltipPortal = [
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the tooltip portal should be forced to render. Useful when using third-party animation libraries.",
    "hashName": "Portal",
    "key": "forceMount"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "hashName": "Portal",
    "key": "contextId"
  }
];

export const TooltipContent = [
  {
    "componentName": "boolean",
    "corvu": true,
    "default": "false",
    "description": "Whether the tooltip content should be forced to render. Useful when using third-party animation libraries.",
    "hashName": "Content",
    "key": "forceMount"
  },
  {
    "componentName": "ValidComponent",
    "corvu": true,
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "hashName": "Content",
    "key": "as"
  },
  {
    "componentName": "string",
    "corvu": true,
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "hashName": "Content",
    "key": "contextId"
  }
];

export const TooltipArrow = [
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
    "description": "The id of the tooltip context to use.",
    "hashName": "Arrow",
    "key": "contextId"
  }
];