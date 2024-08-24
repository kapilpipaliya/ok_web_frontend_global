export const Tooltip = [
  {
    "description": "The controlled open state of the tooltip.",
    "property": "open",
    "type": "boolean"
  },
  {
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the open state of the tooltip changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "description": "Whether to open the tooltip only when the trigger is focused. By default, opens for both focus and hover.",
    "property": "triggerOnFocusOnly",
    "type": "boolean"
  },
  {
    "description": "The duration from when the mouse enters the trigger until the tooltip opens.",
    "property": "openDelay",
    "type": "number"
  },
  {
    "description": "The duration from when the mouse leaves the trigger or content until the tooltip closes.",
    "property": "closeDelay",
    "type": "number"
  },
  {
    "description": "Whether to close the tooltip even if the user cursor is inside the safe area between the trigger and tooltip.",
    "property": "ignoreSafeArea",
    "type": "boolean"
  },
  {
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "property": "id",
    "type": "string"
  },
  {
    "description": "Used to force mounting the tooltip (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "description": "Function that returns the anchor element's DOMRect.",
    "property": "getAnchorRect",
    "type": "(anchor?: HTMLElement) => AnchorRect  | undefined"
  },
  {
    "description": "The placement of the tooltip.",
    "property": "placement",
    "type": "Placement"
  },
  {
    "description": "The distance between the tooltip and the trigger/anchor element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "property": "gutter",
    "type": "number"
  },
  {
    "description": "The skidding of the tooltip along the anchor element.",
    "property": "shift",
    "type": "number"
  },
  {
    "description": "Controls the behavior of the tooltip when it overflows the viewport: - If a boolean, specifies whether the tooltip should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "property": "flip",
    "type": "boolean | string"
  },
  {
    "description": "Whether the tooltip should slide when it overflows.",
    "property": "slide",
    "type": "boolean"
  },
  {
    "description": "Whether the tooltip can overlap the anchor element when it overflows.",
    "property": "overlap",
    "type": "boolean"
  },
  {
    "description": "Whether the tooltip should have the same width as the anchor element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "property": "sameWidth",
    "type": "boolean"
  },
  {
    "description": "Whether the tooltip should fit the viewport. If this is set to true, the tooltip content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport",
    "type": "boolean"
  },
  {
    "description": "Whether to hide the tooltip when the anchor element becomes occluded.",
    "property": "hideWhenDetached",
    "type": "boolean"
  },
  {
    "description": "The minimum padding in order to consider the anchor element occluded.",
    "property": "detachedPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the arrow and the tooltip corner.",
    "property": "arrowPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the tooltip and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding",
    "type": "number"
  }
];

export const TooltipContent = [
  {
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown",
    "type": "(event: KeyboardEvent) => void"
  },
  {
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onPointerDownOutside",
    "type": "(event: PointerDownOutsideEvent) => void"
  }
];

export const TooltipArrow = [
  {
    "description": "The size of the arrow.",
    "property": "size",
    "type": "number"
  }
];