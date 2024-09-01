export const NavigationMenu = [
  {
    "componentName": "string",
    "description": "The value of the menu that should be open when initially rendered. Use when you do not need to control the value state.",
    "key": "defaultValue",
    "hashName": "navigationmenu",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The controlled value of the menu to open. Should be used in conjunction with onValueChange.",
    "key": "value",
    "hashName": "navigationmenu",
    "kobalte": true
  },
  {
    "componentName": "(value: string | undefined | null) => void",
    "description": "Event handler called when the value changes.",
    "key": "onValueChange",
    "hashName": "navigationmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "key": "loop",
    "hashName": "navigationmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "Delay before the menu opens on hover (default 200).",
    "key": "delayDuration",
    "hashName": "navigationmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Open immediately if hovered again within delay (default 300).",
    "key": "skipDelayDuration",
    "hashName": "navigationmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "key": "loop",
    "hashName": "navigationmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, click on alt by itsef will focus this NavigationMenu (some browsers interfere).",
    "key": "focusOnAlt",
    "hashName": "navigationmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "navigationmenu",
    "kobalte": true
  }
];

export const NavigationMenuViewport = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "key": "onEscapeKeyDown",
    "hashName": "navigationmenuviewport",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onPointerDownOutside",
    "hashName": "navigationmenuviewport",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onFocusOutside",
    "hashName": "navigationmenuviewport",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onInteractOutside",
    "hashName": "navigationmenuviewport",
    "kobalte": true
  }
];

export const NavigationMenuArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "key": "size",
    "hashName": "navigationmenuarrow",
    "kobalte": true
  }
];

export const NavigationMenuMenu = [
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the menu changes.",
    "key": "onOpenChange",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "key": "id",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "key": "modal",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "key": "preventScroll",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique value that associates the item with an active value when the navigation menu is controlled. This prop is managed automatically when uncontrolled.",
    "key": "value",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the menu content.",
    "key": "placement",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "key": "gutter",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the menu content along the trigger element.",
    "key": "shift",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "key": "flip",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should slide when it overflows.",
    "key": "slide",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "key": "overlap",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "key": "sameWidth",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "key": "fitViewport",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "key": "hideWhenDetached",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "key": "detachedPadding",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the menu content corner.",
    "key": "arrowPadding",
    "hashName": "navigationmenumenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "key": "overflowPadding",
    "hashName": "navigationmenumenu",
    "kobalte": true
  }
];

export const NavigationMenuTrigger = [
  {
    "componentName": "boolean",
    "description": "Whether the context menu trigger is disabled or not.",
    "key": "disabled",
    "hashName": "navigationmenutrigger",
    "kobalte": true
  }
];

export const NavigationMenuContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "key": "onOpenAutoFocus",
    "hashName": "navigationmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "key": "onCloseAutoFocus",
    "hashName": "navigationmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "key": "onEscapeKeyDown",
    "hashName": "navigationmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onPointerDownOutside",
    "hashName": "navigationmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onFocusOutside",
    "hashName": "navigationmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onInteractOutside",
    "hashName": "navigationmenucontent",
    "kobalte": true
  }
];

export const NavigationMenuItem = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "key": "textValue",
    "hashName": "navigationmenuitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "key": "disabled",
    "hashName": "navigationmenuitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is activated.",
    "key": "closeOnSelect",
    "hashName": "navigationmenuitem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "key": "onSelect",
    "hashName": "navigationmenuitem",
    "kobalte": true
  }
];

export const NavigationMenuItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "navigationmenuitemindicator",
    "kobalte": true
  }
];

export const NavigationMenuRadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the menu radio item to check.",
    "key": "value",
    "hashName": "navigationmenuradiogroup",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "key": "defaultValue",
    "hashName": "navigationmenuradiogroup",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "key": "onChange",
    "hashName": "navigationmenuradiogroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled or not.",
    "key": "disabled",
    "hashName": "navigationmenuradiogroup",
    "kobalte": true
  }
];

export const NavigationMenuRadioItem = [
  {
    "componentName": "string",
    "description": "The value of the menu item radio.",
    "key": "value",
    "hashName": "navigationmenuradioitem",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "key": "textValue",
    "hashName": "navigationmenuradioitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "key": "disabled",
    "hashName": "navigationmenuradioitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked.",
    "key": "closeOnSelect",
    "hashName": "navigationmenuradioitem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "key": "onSelect",
    "hashName": "navigationmenuradioitem",
    "kobalte": true
  }
];

export const NavigationMenuCheckboxItem = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the item.",
    "key": "checked",
    "hashName": "navigationmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "key": "defaultChecked",
    "hashName": "navigationmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the item changes.",
    "key": "onChange",
    "hashName": "navigationmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "key": "textValue",
    "hashName": "navigationmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is in an indeterminate state.",
    "key": "indeterminate",
    "hashName": "navigationmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "key": "disabled",
    "hashName": "navigationmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "key": "closeOnSelect",
    "hashName": "navigationmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "key": "onSelect",
    "hashName": "navigationmenucheckboxitem",
    "kobalte": true
  }
];

export const NavigationMenuSub = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the sub menu.",
    "key": "open",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "key": "defaultOpen",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the sub menu changes.",
    "key": "onOpenChange",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "key": "getAnchorRect",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "key": "gutter",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the sub menu content along the trigger element.",
    "key": "shift",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should slide when it overflows.",
    "key": "slide",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "key": "overlap",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "key": "fitViewport",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "key": "hideWhenDetached",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "key": "detachedPadding",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "key": "arrowPadding",
    "hashName": "navigationmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "key": "overflowPadding",
    "hashName": "navigationmenusub",
    "kobalte": true
  }
];

export const NavigationMenuSubTrigger = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "key": "textValue",
    "hashName": "navigationmenusubtrigger",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu trigger is disabled or not.",
    "key": "disabled",
    "hashName": "navigationmenusubtrigger",
    "kobalte": true
  }
];

export const NavigationMenuSubContent = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "key": "onEscapeKeyDown",
    "hashName": "navigationmenusubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onPointerDownOutside",
    "hashName": "navigationmenusubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onFocusOutside",
    "hashName": "navigationmenusubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "key": "onInteractOutside",
    "hashName": "navigationmenusubcontent",
    "kobalte": true
  }
];