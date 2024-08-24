export const HoverCard = [
  {
    "description": "The controlled open state of the hovercard.",
    "property": "open",
    "type": "boolean"
  },
  {
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the open state of the hovercard changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "description": "The duration from when the mouse enters the trigger until the hovercard opens.",
    "property": "openDelay",
    "type": "number"
  },
  {
    "description": "The duration from when the mouse leaves the trigger or content until the hovercard closes.",
    "property": "closeDelay",
    "type": "number"
  },
  {
    "description": "Whether to close the hovercard even if the user cursor is inside the safe area between the trigger and hovercard.",
    "property": "ignoreSafeArea",
    "type": "boolean"
  },
  {
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "property": "id",
    "type": "string"
  },
  {
    "description": "Used to force mounting the hovercard (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "description": "Function that returns the anchor element's DOMRect.",
    "property": "getAnchorRect",
    "type": "(anchor?: HTMLElement) => AnchorRect  | undefined"
  },
  {
    "description": "The placement of the hovercard.",
    "property": "placement",
    "type": "Placement"
  },
  {
    "description": "The distance between the hovercard and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "property": "gutter",
    "type": "number"
  },
  {
    "description": "The skidding of the hovercard along the trigger element.",
    "property": "shift",
    "type": "number"
  },
  {
    "description": "Controls the behavior of the hovercard when it overflows the viewport: - If a boolean, specifies whether the hovercard should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "property": "flip",
    "type": "boolean | string"
  },
  {
    "description": "Whether the hovercard should slide when it overflows.",
    "property": "slide",
    "type": "boolean"
  },
  {
    "description": "Whether the hovercard can overlap the trigger element when it overflows.",
    "property": "overlap",
    "type": "boolean"
  },
  {
    "description": "Whether the hovercard should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "property": "sameWidth",
    "type": "boolean"
  },
  {
    "description": "Whether the hovercard should fit the viewport. If this is set to true, the hovercard content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport",
    "type": "boolean"
  },
  {
    "description": "Whether to hide the hovercard when the trigger element becomes occluded.",
    "property": "hideWhenDetached",
    "type": "boolean"
  },
  {
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "property": "detachedPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the arrow and the hovercard corner.",
    "property": "arrowPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the hovercard and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding",
    "type": "number"
  }
];