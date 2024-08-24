export const Popover = [
  {
    "description": "The controlled open state of the popover.",
    "property": "open",
    "type": "boolean"
  },
  {
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the open state of the popover changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "property": "id",
    "type": "string"
  },
  {
    "description": "Whether the popover should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the popover content.  - elements outside the popover content will not be visible for screen readers.",
    "property": "modal",
    "type": "boolean"
  },
  {
    "description": "Whether the scroll should be locked even if the popover is not modal.",
    "property": "preventScroll",
    "type": "boolean"
  },
  {
    "description": "Used to force mounting the popover (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "description": "Localization strings.",
    "property": "translations",
    "type": "PopoverIntlTranslations"
  },
  {
    "description": "Function that returns the anchor element's DOMRect.",
    "property": "getAnchorRect",
    "type": "(anchor?: HTMLElement) => AnchorRect  | undefined"
  },
  {
    "description": "A ref for the anchor element. Useful if you want to use an element outside Popover as the popover anchor.",
    "property": "anchorRef",
    "type": "Accessor<HTMLElement | undefined>"
  },
  {
    "description": "The placement of the popover.",
    "property": "placement",
    "type": "Placement"
  },
  {
    "description": "The distance between the popover and the trigger/anchor element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "property": "gutter",
    "type": "number"
  },
  {
    "description": "The skidding of the popover along the anchor element.",
    "property": "shift",
    "type": "number"
  },
  {
    "description": "Controls the behavior of the popover when it overflows the viewport: - If a boolean, specifies whether the popover should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "property": "flip",
    "type": "boolean | string"
  },
  {
    "description": "Whether the popover should slide when it overflows.",
    "property": "slide",
    "type": "boolean"
  },
  {
    "description": "Whether the popover can overlap the anchor element when it overflows.",
    "property": "overlap",
    "type": "boolean"
  },
  {
    "description": "Whether the popover should have the same width as the anchor element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "property": "sameWidth",
    "type": "boolean"
  },
  {
    "description": "Whether the popover should fit the viewport. If this is set to true, the popover content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport",
    "type": "boolean"
  },
  {
    "description": "Whether to hide the popover when the anchor element becomes occluded.",
    "property": "hideWhenDetached",
    "type": "boolean"
  },
  {
    "description": "The minimum padding in order to consider the anchor element occluded.",
    "property": "detachedPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the arrow and the popover corner.",
    "property": "arrowPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the popover and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding",
    "type": "number"
  }
];

export const PopoverContent = [
  {
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "property": "onOpenAutoFocus",
    "type": "(event: Event) => void"
  },
  {
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "property": "onCloseAutoFocus",
    "type": "(event: Event) => void"
  },
  {
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown",
    "type": "(event: KeyboardEvent) => void"
  },
  {
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onPointerDownOutside",
    "type": "(event: PointerDownOutsideEvent) => void"
  },
  {
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onFocusOutside",
    "type": "(event: FocusOutsideEvent) => void"
  },
  {
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onInteractOutside",
    "type": "(event: InteractOutsideEvent) => void"
  }
];

export const PopoverArrow = [
  {
    "description": "The size of the arrow.",
    "property": "size",
    "type": "number"
  }
];