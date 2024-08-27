export const Tooltip = [
  {
    "componentName": "boolean",
    "default": "-",
    "description": "Whether the tooltip is open.",
    "property": "open"
  },
  {
    "componentName": "(open: boolean) => void",
    "default": "-",
    "description": "Callback fired when the open state changes.",
    "property": "onOpenChange"
  },
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the tooltip is open initially.",
    "property": "initialOpen"
  },
  {
    "componentName": "Placement",
    "default": "'bottom'",
    "description": "The initial placement of the tooltip.",
    "property": "placement"
  },
  {
    "componentName": "Strategy",
    "default": "'absolute'",
    "description": "The strategy to use when positioning the tooltip.",
    "property": "strategy"
  },
  {
    "componentName": "FloatingOptions | null",
    "default": "{ flip: true, shift: true }",
    "description": "Floating options of the tooltip.",
    "property": "floatingOptions"
  },
  {
    "componentName": "number",
    "default": "500",
    "description": "The delay in milliseconds before the tooltip opens after the mouse pointer is moved over the trigger.",
    "property": "openDelay"
  },
  {
    "componentName": "number",
    "default": "0",
    "description": "The delay in milliseconds before the tooltip closes after the mouse pointer leaves.",
    "property": "closeDelay"
  },
  {
    "componentName": "number",
    "default": "0",
    "description": "The duration in milliseconds that the tooltip should ignore the openDelay when the mouse pointer leaves and re-enters.",
    "property": "skipDelayDuration"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip content should be hoverable.",
    "property": "hoverableContent"
  },
  {
    "componentName": "'true' | string",
    "default": "-",
    "description": "Optionally add this tooltip to a group. With the same group property will close when another tooltip in the same group opens.",
    "property": "group"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should open when the trigger is focused.",
    "property": "openOnFocus"
  },
  {
    "componentName": "(event: FocusEvent) => void",
    "default": "-",
    "description": "Callback fired when the trigger is focused and openOnFocus is true. Can be prevented by calling event.preventDefault.",
    "property": "onFocus"
  },
  {
    "componentName": "(event: FocusEvent) => void",
    "default": "-",
    "description": "Callback fired when the trigger is blurred and openOnFocus is true. Can be prevented by calling event.preventDefault.",
    "property": "onBlur"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should open when the mouse pointer is moved over the trigger.",
    "property": "openOnHover"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "default": "-",
    "description": "Callback fired when the mouse pointer is moved over the trigger and openOnHover is true. Can be prevented by calling event.preventDefault.",
    "property": "onHover"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "default": "-",
    "description": "Callback fired when the mouse pointer leaves the tooltip and openOnHover is true. Can be prevented by calling event.preventDefault.",
    "property": "onLeave"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should close when the user presses the Escape key.",
    "property": "closeOnEscapeKeyDown"
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "default": "-",
    "description": "Callback fired when the user presses the Escape key. Can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should close when the user presses on the trigger.",
    "property": "closeOnPointerDown"
  },
  {
    "componentName": "(event: MouseEvent) => void",
    "default": "-",
    "description": "Callback fired when the user presses on the trigger and closeOnPointerDown is true. Can be prevented by calling event.preventDefault.",
    "property": "onPointerDown"
  },
  {
    "componentName": "boolean",
    "default": "true",
    "description": "Whether the tooltip should close when the user scrolls.",
    "property": "closeOnScroll"
  },
  {
    "componentName": "(event: Event) => void",
    "default": "-",
    "description": "Callback fired when the user scrolls and the tooltip is about to close. Can be prevented by calling event.preventDefault.",
    "property": "onScroll"
  },
  {
    "componentName": "string",
    "default": "createUniqueId()",
    "description": "The id attribute of the tooltip element.",
    "property": "tooltipId"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context. Useful if you have nested tooltips and want to create components that belong to a tooltip higher up in the tree.",
    "property": "contextId"
  }
];

export const TooltipAnchor = [
  {
    "componentName": "ValidComponent",
    "default": "div",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "property": "contextId"
  }
];

export const TooltipTrigger = [
  {
    "componentName": "ValidComponent",
    "default": "button",
    "description": "Component to render the dynamic component as.",
    "property": "as"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "property": "contextId"
  }
];

export const TooltipPortal = [
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the tooltip portal should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount"
  },
  {
    "componentName": "string",
    "default": "-",
    "description": "The id of the tooltip context to use.",
    "property": "contextId"
  }
];

export const TooltipContent = [
  {
    "componentName": "boolean",
    "default": "false",
    "description": "Whether the tooltip content should be forced to render. Useful when using third-party animation libraries.",
    "property": "forceMount"
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
    "description": "The id of the tooltip context to use.",
    "property": "contextId"
  }
];

export const TooltipArrow = [
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
    "description": "The id of the tooltip context to use.",
    "property": "contextId"
  }
];