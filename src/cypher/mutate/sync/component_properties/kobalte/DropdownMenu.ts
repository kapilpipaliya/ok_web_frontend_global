export const DropdownMenu = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the menu.",
    "hashName": "dropdownmenu",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "dropdownmenu",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the menu changes.",
    "hashName": "dropdownmenu",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "hashName": "dropdownmenu",
    "key": "id",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "hashName": "dropdownmenu",
    "key": "modal",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "hashName": "dropdownmenu",
    "key": "preventScroll",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "dropdownmenu",
    "key": "forceMount",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "hashName": "dropdownmenu",
    "key": "getAnchorRect",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the menu content.",
    "hashName": "dropdownmenu",
    "key": "placement",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "dropdownmenu",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the menu content along the trigger element.",
    "hashName": "dropdownmenu",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "hashName": "dropdownmenu",
    "key": "flip",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should slide when it overflows.",
    "hashName": "dropdownmenu",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "hashName": "dropdownmenu",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "hashName": "dropdownmenu",
    "key": "sameWidth",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-content-available-width and --kb-popper-content-available-height.",
    "hashName": "dropdownmenu",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "hashName": "dropdownmenu",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "dropdownmenu",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the menu content corner.",
    "hashName": "dropdownmenu",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "dropdownmenu",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const DropdownMenuContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenucontent",
    "key": "onOpenAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenucontent",
    "key": "onCloseAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenucontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenucontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenucontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenucontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];

export const DropdownMenuArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "hashName": "dropdownmenuarrow",
    "key": "size",
    "kobalte": true
  }
];

export const DropdownMenuItem = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the DropdownMenu.ItemLabel part if provided, or fallback to the .textContent of the DropdownMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "dropdownmenuitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "dropdownmenuitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is activated.",
    "hashName": "dropdownmenuitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "dropdownmenuitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const DropdownMenuItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "dropdownmenuitemindicator",
    "key": "forceMount",
    "kobalte": true
  }
];

export const DropdownMenuRadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the menu radio item to check.",
    "hashName": "dropdownmenuradiogroup",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "hashName": "dropdownmenuradiogroup",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "dropdownmenuradiogroup",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled or not.",
    "hashName": "dropdownmenuradiogroup",
    "key": "disabled",
    "kobalte": true
  }
];

export const DropdownMenuRadioItem = [
  {
    "componentName": "string",
    "description": "The value of the menu item radio.",
    "hashName": "dropdownmenuradioitem",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the DropdownMenu.ItemLabel part if provided, or fallback to the .textContent of the DropdownMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "dropdownmenuradioitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "dropdownmenuradioitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked.",
    "hashName": "dropdownmenuradioitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "dropdownmenuradioitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const DropdownMenuCheckboxItem = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the item.",
    "hashName": "dropdownmenucheckboxitem",
    "key": "checked",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "hashName": "dropdownmenucheckboxitem",
    "key": "defaultChecked",
    "kobalte": true
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the item changes.",
    "hashName": "dropdownmenucheckboxitem",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the DropdownMenu.ItemLabel part if provided, or fallback to the .textContent of the DropdownMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "dropdownmenucheckboxitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is in an indeterminate state.",
    "hashName": "dropdownmenucheckboxitem",
    "key": "indeterminate",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "dropdownmenucheckboxitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "hashName": "dropdownmenucheckboxitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "dropdownmenucheckboxitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const DropdownMenuSub = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the sub menu.",
    "hashName": "dropdownmenusub",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "dropdownmenusub",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the sub menu changes.",
    "hashName": "dropdownmenusub",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "hashName": "dropdownmenusub",
    "key": "getAnchorRect",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "dropdownmenusub",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the sub menu content along the trigger element.",
    "hashName": "dropdownmenusub",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should slide when it overflows.",
    "hashName": "dropdownmenusub",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "hashName": "dropdownmenusub",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-content-available-width and --kb-popper-content-available-height.",
    "hashName": "dropdownmenusub",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "hashName": "dropdownmenusub",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "dropdownmenusub",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "hashName": "dropdownmenusub",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "dropdownmenusub",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const DropdownMenuSubTrigger = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the DropdownMenu.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "dropdownmenusubtrigger",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu trigger is disabled or not.",
    "hashName": "dropdownmenusubtrigger",
    "key": "disabled",
    "kobalte": true
  }
];

export const DropdownMenuSubContent = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenusubcontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenusubcontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenusubcontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "dropdownmenusubcontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];