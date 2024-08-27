export const NavigationMenu = [
  {
    "componentName": "string",
    "description": "The value of the menu that should be open when initially rendered. Use when you do not need to control the value state.",
    "property": "defaultValue"
  },
  {
    "componentName": "string",
    "description": "The controlled value of the menu to open. Should be used in conjunction with onValueChange.",
    "property": "value"
  },
  {
    "componentName": "(value: string | undefined | null) => void",
    "description": "Event handler called when the value changes.",
    "property": "onValueChange"
  },
  {
    "componentName": "boolean",
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "property": "loop"
  },
  {
    "componentName": "number",
    "description": "Delay before the menu opens on hover (default 200).",
    "property": "delayDuration"
  },
  {
    "componentName": "boolean",
    "description": "Open immediately if hovered again within delay (default 300).",
    "property": "skipDelayDuration"
  },
  {
    "componentName": "boolean",
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "property": "loop"
  },
  {
    "componentName": "boolean",
    "description": "When true, click on alt by itsef will focus this NavigationMenu (some browsers interfere).",
    "property": "focusOnAlt"
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];

export const NavigationMenuViewport = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown"
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onPointerDownOutside"
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onFocusOutside"
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onInteractOutside"
  }
];

export const NavigationMenuArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "property": "size"
  }
];

export const NavigationMenuMenu = [
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the menu changes.",
    "property": "onOpenChange"
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "property": "id"
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "property": "modal"
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "property": "preventScroll"
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  },
  {
    "componentName": "string",
    "description": "A unique value that associates the item with an active value when the navigation menu is controlled. This prop is managed automatically when uncontrolled.",
    "property": "value"
  },
  {
    "componentName": "Placement",
    "description": "The placement of the menu content.",
    "property": "placement"
  },
  {
    "componentName": "number",
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "property": "gutter"
  },
  {
    "componentName": "number",
    "description": "The skidding of the menu content along the trigger element.",
    "property": "shift"
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "property": "flip"
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should slide when it overflows.",
    "property": "slide"
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "property": "overlap"
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "property": "sameWidth"
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport"
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "property": "hideWhenDetached"
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "property": "detachedPadding"
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the menu content corner.",
    "property": "arrowPadding"
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding"
  }
];

export const NavigationMenuTrigger = [
  {
    "componentName": "boolean",
    "description": "Whether the context menu trigger is disabled or not.",
    "property": "disabled"
  }
];

export const NavigationMenuContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "property": "onOpenAutoFocus"
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "property": "onCloseAutoFocus"
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown"
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onPointerDownOutside"
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onFocusOutside"
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onInteractOutside"
  }
];

export const NavigationMenuItem = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "property": "textValue"
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is activated.",
    "property": "closeOnSelect"
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "property": "onSelect"
  }
];

export const NavigationMenuItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];

export const NavigationMenuRadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the menu radio item to check.",
    "property": "value"
  },
  {
    "componentName": "string",
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "property": "onChange"
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled or not.",
    "property": "disabled"
  }
];

export const NavigationMenuRadioItem = [
  {
    "componentName": "string",
    "description": "The value of the menu item radio.",
    "property": "value"
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "property": "textValue"
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked.",
    "property": "closeOnSelect"
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "property": "onSelect"
  }
];

export const NavigationMenuCheckboxItem = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the item.",
    "property": "checked"
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "property": "defaultChecked"
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the item changes.",
    "property": "onChange"
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "property": "textValue"
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is in an indeterminate state.",
    "property": "indeterminate"
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "property": "closeOnSelect"
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "property": "onSelect"
  }
];

export const NavigationMenuSub = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the sub menu.",
    "property": "open"
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen"
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the sub menu changes.",
    "property": "onOpenChange"
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "property": "getAnchorRect"
  },
  {
    "componentName": "number",
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "property": "gutter"
  },
  {
    "componentName": "number",
    "description": "The skidding of the sub menu content along the trigger element.",
    "property": "shift"
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should slide when it overflows.",
    "property": "slide"
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "property": "overlap"
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport"
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "property": "hideWhenDetached"
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "property": "detachedPadding"
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "property": "arrowPadding"
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding"
  }
];

export const NavigationMenuSubTrigger = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "property": "textValue"
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu trigger is disabled or not.",
    "property": "disabled"
  }
];

export const NavigationMenuSubContent = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "property": "onEscapeKeyDown"
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onPointerDownOutside"
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onFocusOutside"
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "property": "onInteractOutside"
  }
];