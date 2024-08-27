export const DropdownMenu = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the menu.",
    "name": "open",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "name": "defaultOpen",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the menu changes.",
    "name": "onOpenChange",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "name": "id",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "name": "modal",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "name": "preventScroll",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "name": "getAnchorRect",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the menu content.",
    "name": "placement",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "name": "gutter",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the menu content along the trigger element.",
    "name": "shift",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "name": "flip",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should slide when it overflows.",
    "name": "slide",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "name": "overlap",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "name": "sameWidth",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-content-available-width and --kb-popper-content-available-height.",
    "name": "fitViewport",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "name": "hideWhenDetached",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "name": "detachedPadding",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the menu content corner.",
    "name": "arrowPadding",
    "hashName": "dropdownmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "name": "overflowPadding",
    "hashName": "dropdownmenu",
    "kobalte": true
  }
];

export const DropdownMenuContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "name": "onOpenAutoFocus",
    "hashName": "dropdownmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "name": "onCloseAutoFocus",
    "hashName": "dropdownmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "name": "onEscapeKeyDown",
    "hashName": "dropdownmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onPointerDownOutside",
    "hashName": "dropdownmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onFocusOutside",
    "hashName": "dropdownmenucontent",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onInteractOutside",
    "hashName": "dropdownmenucontent",
    "kobalte": true
  }
];

export const DropdownMenuArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "name": "size",
    "hashName": "dropdownmenuarrow",
    "kobalte": true
  }
];

export const DropdownMenuItem = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the DropdownMenu.ItemLabel part if provided, or fallback to the .textContent of the DropdownMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "name": "textValue",
    "hashName": "dropdownmenuitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "name": "disabled",
    "hashName": "dropdownmenuitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is activated.",
    "name": "closeOnSelect",
    "hashName": "dropdownmenuitem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "name": "onSelect",
    "hashName": "dropdownmenuitem",
    "kobalte": true
  }
];

export const DropdownMenuItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "dropdownmenuitemindicator",
    "kobalte": true
  }
];

export const DropdownMenuRadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the menu radio item to check.",
    "name": "value",
    "hashName": "dropdownmenuradiogroup",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "name": "defaultValue",
    "hashName": "dropdownmenuradiogroup",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "name": "onChange",
    "hashName": "dropdownmenuradiogroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled or not.",
    "name": "disabled",
    "hashName": "dropdownmenuradiogroup",
    "kobalte": true
  }
];

export const DropdownMenuRadioItem = [
  {
    "componentName": "string",
    "description": "The value of the menu item radio.",
    "name": "value",
    "hashName": "dropdownmenuradioitem",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the DropdownMenu.ItemLabel part if provided, or fallback to the .textContent of the DropdownMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "name": "textValue",
    "hashName": "dropdownmenuradioitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "name": "disabled",
    "hashName": "dropdownmenuradioitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked.",
    "name": "closeOnSelect",
    "hashName": "dropdownmenuradioitem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "name": "onSelect",
    "hashName": "dropdownmenuradioitem",
    "kobalte": true
  }
];

export const DropdownMenuCheckboxItem = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the item.",
    "name": "checked",
    "hashName": "dropdownmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "name": "defaultChecked",
    "hashName": "dropdownmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the item changes.",
    "name": "onChange",
    "hashName": "dropdownmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the DropdownMenu.ItemLabel part if provided, or fallback to the .textContent of the DropdownMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "name": "textValue",
    "hashName": "dropdownmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is in an indeterminate state.",
    "name": "indeterminate",
    "hashName": "dropdownmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "name": "disabled",
    "hashName": "dropdownmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "name": "closeOnSelect",
    "hashName": "dropdownmenucheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "name": "onSelect",
    "hashName": "dropdownmenucheckboxitem",
    "kobalte": true
  }
];

export const DropdownMenuSub = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the sub menu.",
    "name": "open",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "name": "defaultOpen",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the sub menu changes.",
    "name": "onOpenChange",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "name": "getAnchorRect",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "name": "gutter",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the sub menu content along the trigger element.",
    "name": "shift",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should slide when it overflows.",
    "name": "slide",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "name": "overlap",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-content-available-width and --kb-popper-content-available-height.",
    "name": "fitViewport",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "name": "hideWhenDetached",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "name": "detachedPadding",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "name": "arrowPadding",
    "hashName": "dropdownmenusub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "name": "overflowPadding",
    "hashName": "dropdownmenusub",
    "kobalte": true
  }
];

export const DropdownMenuSubTrigger = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the DropdownMenu.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "name": "textValue",
    "hashName": "dropdownmenusubtrigger",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu trigger is disabled or not.",
    "name": "disabled",
    "hashName": "dropdownmenusubtrigger",
    "kobalte": true
  }
];

export const DropdownMenuSubContent = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "name": "onEscapeKeyDown",
    "hashName": "dropdownmenusubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onPointerDownOutside",
    "hashName": "dropdownmenusubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onFocusOutside",
    "hashName": "dropdownmenusubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onInteractOutside",
    "hashName": "dropdownmenusubcontent",
    "kobalte": true
  }
];