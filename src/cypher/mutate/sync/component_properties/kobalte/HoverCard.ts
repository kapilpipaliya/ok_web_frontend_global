export const HoverCard = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the hovercard.",
    "hashName": "hovercard",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "hovercard",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the hovercard changes.",
    "hashName": "hovercard",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The duration from when the mouse enters the trigger until the hovercard opens.",
    "hashName": "hovercard",
    "key": "openDelay",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The duration from when the mouse leaves the trigger or content until the hovercard closes.",
    "hashName": "hovercard",
    "key": "closeDelay",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to close the hovercard even if the user cursor is inside the safe area between the trigger and hovercard.",
    "hashName": "hovercard",
    "key": "ignoreSafeArea",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "hashName": "hovercard",
    "key": "id",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the hovercard (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "hovercard",
    "key": "forceMount",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the anchor element's DOMRect.",
    "hashName": "hovercard",
    "key": "getAnchorRect",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the hovercard.",
    "hashName": "hovercard",
    "key": "placement",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the hovercard and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "hovercard",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the hovercard along the trigger element.",
    "hashName": "hovercard",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the hovercard when it overflows the viewport: - If a boolean, specifies whether the hovercard should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "hashName": "hovercard",
    "key": "flip",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should slide when it overflows.",
    "hashName": "hovercard",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard can overlap the trigger element when it overflows.",
    "hashName": "hovercard",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "hashName": "hovercard",
    "key": "sameWidth",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the hovercard should fit the viewport. If this is set to true, the hovercard content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "hovercard",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the hovercard when the trigger element becomes occluded.",
    "hashName": "hovercard",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "hovercard",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the hovercard corner.",
    "hashName": "hovercard",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the hovercard and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "hovercard",
    "key": "overflowPadding",
    "kobalte": true
  }
];