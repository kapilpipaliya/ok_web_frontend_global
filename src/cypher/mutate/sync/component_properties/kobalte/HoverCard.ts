export const HoverCard = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the hovercard.",
    "key": "open",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "key": "defaultOpen",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the hovercard changes.",
    "key": "onOpenChange",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The duration from when the mouse enters the trigger until the hovercard opens.",
    "key": "openDelay",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The duration from when the mouse leaves the trigger or content until the hovercard closes.",
    "key": "closeDelay",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to close the hovercard even if the user cursor is inside the safe area between the trigger and hovercard.",
    "key": "ignoreSafeArea",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "key": "id",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the hovercard (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the anchor element's DOMRect.",
    "key": "getAnchorRect",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the hovercard.",
    "key": "placement",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the hovercard and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "key": "gutter",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the hovercard along the trigger element.",
    "key": "shift",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the hovercard when it overflows the viewport: - If a boolean, specifies whether the hovercard should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "key": "flip",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should slide when it overflows.",
    "key": "slide",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard can overlap the trigger element when it overflows.",
    "key": "overlap",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "key": "sameWidth",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should fit the viewport. If this is set to true, the hovercard content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "key": "fitViewport",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the hovercard when the trigger element becomes occluded.",
    "key": "hideWhenDetached",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "key": "detachedPadding",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the hovercard corner.",
    "key": "arrowPadding",
    "hashName": "hovercard",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the hovercard and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "key": "overflowPadding",
    "hashName": "hovercard",
    "kobalte": true
  }
];