export const HoverCard = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the hovercard.",
    "name": "open",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "name": "defaultOpen",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the hovercard changes.",
    "name": "onOpenChange",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The duration from when the mouse enters the trigger until the hovercard opens.",
    "name": "openDelay",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The duration from when the mouse leaves the trigger or content until the hovercard closes.",
    "name": "closeDelay",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to close the hovercard even if the user cursor is inside the safe area between the trigger and hovercard.",
    "name": "ignoreSafeArea",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "name": "id",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the hovercard (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the anchor element's DOMRect.",
    "name": "getAnchorRect",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the hovercard.",
    "name": "placement",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the hovercard and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "name": "gutter",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the hovercard along the trigger element.",
    "name": "shift",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the hovercard when it overflows the viewport: - If a boolean, specifies whether the hovercard should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "name": "flip",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should slide when it overflows.",
    "name": "slide",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard can overlap the trigger element when it overflows.",
    "name": "overlap",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "name": "sameWidth",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should fit the viewport. If this is set to true, the hovercard content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "name": "fitViewport",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the hovercard when the trigger element becomes occluded.",
    "name": "hideWhenDetached",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "name": "detachedPadding",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the hovercard corner.",
    "name": "arrowPadding",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the hovercard and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "name": "overflowPadding",
    "hashName": "hovercard",
    "kobalte": true
  }
];