export const NavigationMenu = [
  {
    "componentName": "string",
    "description": "The value of the menu that should be open when initially rendered. Use when you do not need to control the value state.",
    "hashName": "navigationmenu",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The controlled value of the menu to open. Should be used in conjunction with onValueChange.",
    "hashName": "navigationmenu",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "(value: string | undefined | null) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "navigationmenu",
    "key": "onValueChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "hashName": "navigationmenu",
    "key": "loop",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "Delay before the menu opens on hover (default 200).",
    "hashName": "navigationmenu",
    "key": "delayDuration",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Open immediately if hovered again within delay (default 300).",
    "hashName": "navigationmenu",
    "key": "skipDelayDuration",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "hashName": "navigationmenu",
    "key": "loop",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, click on alt by itsef will focus this NavigationMenu (some browsers interfere).",
    "hashName": "navigationmenu",
    "key": "focusOnAlt",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "navigationmenu",
    "key": "forceMount",
    "kobalte": true
  }
];

export const NavigationMenuViewport = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenuviewport",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenuviewport",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenuviewport",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenuviewport",
    "key": "onInteractOutside",
    "kobalte": true
  }
];

export const NavigationMenuArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "hashName": "navigationmenuarrow",
    "key": "size",
    "kobalte": true
  }
];

export const NavigationMenuMenu = [
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the menu changes.",
    "hashName": "navigationmenumenu",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "hashName": "navigationmenumenu",
    "key": "id",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "hashName": "navigationmenumenu",
    "key": "modal",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "hashName": "navigationmenumenu",
    "key": "preventScroll",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "navigationmenumenu",
    "key": "forceMount",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique value that associates the item with an active value when the navigation menu is controlled. This prop is managed automatically when uncontrolled.",
    "hashName": "navigationmenumenu",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the menu content.",
    "hashName": "navigationmenumenu",
    "key": "placement",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "navigationmenumenu",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the menu content along the trigger element.",
    "hashName": "navigationmenumenu",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "hashName": "navigationmenumenu",
    "key": "flip",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should slide when it overflows.",
    "hashName": "navigationmenumenu",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "hashName": "navigationmenumenu",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "hashName": "navigationmenumenu",
    "key": "sameWidth",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "navigationmenumenu",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "hashName": "navigationmenumenu",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "navigationmenumenu",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the menu content corner.",
    "hashName": "navigationmenumenu",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "navigationmenumenu",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const NavigationMenuTrigger = [
  {
    "componentName": "boolean",
    "description": "Whether the context menu trigger is disabled or not.",
    "hashName": "navigationmenutrigger",
    "key": "disabled",
    "kobalte": true
  }
];

export const NavigationMenuContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenucontent",
    "key": "onOpenAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenucontent",
    "key": "onCloseAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenucontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenucontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenucontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenucontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];

export const NavigationMenuItem = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "navigationmenuitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "navigationmenuitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is activated.",
    "hashName": "navigationmenuitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "navigationmenuitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const NavigationMenuItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "navigationmenuitemindicator",
    "key": "forceMount",
    "kobalte": true
  }
];

export const NavigationMenuRadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the menu radio item to check.",
    "hashName": "navigationmenuradiogroup",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "hashName": "navigationmenuradiogroup",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "navigationmenuradiogroup",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled or not.",
    "hashName": "navigationmenuradiogroup",
    "key": "disabled",
    "kobalte": true
  }
];

export const NavigationMenuRadioItem = [
  {
    "componentName": "string",
    "description": "The value of the menu item radio.",
    "hashName": "navigationmenuradioitem",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "navigationmenuradioitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "navigationmenuradioitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked.",
    "hashName": "navigationmenuradioitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "navigationmenuradioitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const NavigationMenuCheckboxItem = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the item.",
    "hashName": "navigationmenucheckboxitem",
    "key": "checked",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "hashName": "navigationmenucheckboxitem",
    "key": "defaultChecked",
    "kobalte": true
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the item changes.",
    "hashName": "navigationmenucheckboxitem",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.ItemLabel part if provided, or fallback to the .textContent of the NavigationMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "navigationmenucheckboxitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is in an indeterminate state.",
    "hashName": "navigationmenucheckboxitem",
    "key": "indeterminate",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "navigationmenucheckboxitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "hashName": "navigationmenucheckboxitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "navigationmenucheckboxitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const NavigationMenuSub = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the sub menu.",
    "hashName": "navigationmenusub",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "navigationmenusub",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the sub menu changes.",
    "hashName": "navigationmenusub",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "hashName": "navigationmenusub",
    "key": "getAnchorRect",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "navigationmenusub",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the sub menu content along the trigger element.",
    "hashName": "navigationmenusub",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should slide when it overflows.",
    "hashName": "navigationmenusub",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "hashName": "navigationmenusub",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "navigationmenusub",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "hashName": "navigationmenusub",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "navigationmenusub",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "hashName": "navigationmenusub",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "navigationmenusub",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const NavigationMenuSubTrigger = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the NavigationMenu.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "navigationmenusubtrigger",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu trigger is disabled or not.",
    "hashName": "navigationmenusubtrigger",
    "key": "disabled",
    "kobalte": true
  }
];

export const NavigationMenuSubContent = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenusubcontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenusubcontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenusubcontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "navigationmenusubcontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];