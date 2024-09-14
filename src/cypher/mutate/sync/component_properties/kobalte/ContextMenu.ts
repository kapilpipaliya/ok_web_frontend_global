export const ContextMenu = [
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the menu changes.",
    "hashName": "contextmenu",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "hashName": "contextmenu",
    "key": "id",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "hashName": "contextmenu",
    "key": "modal",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "hashName": "contextmenu",
    "key": "preventScroll",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "contextmenu",
    "key": "forceMount",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the menu content.",
    "hashName": "contextmenu",
    "key": "placement",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "contextmenu",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the menu content along the trigger element.",
    "hashName": "contextmenu",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "hashName": "contextmenu",
    "key": "flip",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should slide when it overflows.",
    "hashName": "contextmenu",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "hashName": "contextmenu",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "hashName": "contextmenu",
    "key": "sameWidth",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "contextmenu",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "hashName": "contextmenu",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "contextmenu",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the menu content corner.",
    "hashName": "contextmenu",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "contextmenu",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const ContextMenuTrigger = [
  {
    "componentName": "boolean",
    "description": "Whether the context menu trigger is disabled or not.",
    "hashName": "contextmenutrigger",
    "key": "disabled",
    "kobalte": true
  }
];

export const ContextMenuContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenucontent",
    "key": "onOpenAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenucontent",
    "key": "onCloseAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenucontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenucontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenucontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenucontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];

export const ContextMenuArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "hashName": "contextmenuarrow",
    "key": "size",
    "kobalte": true
  }
];

export const ContextMenuItem = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the ContextMenu.ItemLabel part if provided, or fallback to the .textContent of the ContextMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "contextmenuitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "contextmenuitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is activated.",
    "hashName": "contextmenuitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "contextmenuitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const ContextMenuItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "contextmenuitemindicator",
    "key": "forceMount",
    "kobalte": true
  }
];

export const ContextMenuRadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the menu radio item to check.",
    "hashName": "contextmenuradiogroup",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "hashName": "contextmenuradiogroup",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "contextmenuradiogroup",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled or not.",
    "hashName": "contextmenuradiogroup",
    "key": "disabled",
    "kobalte": true
  }
];

export const ContextMenuRadioItem = [
  {
    "componentName": "string",
    "description": "The value of the menu item radio.",
    "hashName": "contextmenuradioitem",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the ContextMenu.ItemLabel part if provided, or fallback to the .textContent of the ContextMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "contextmenuradioitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "contextmenuradioitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked.",
    "hashName": "contextmenuradioitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "contextmenuradioitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const ContextMenuCheckboxItem = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the item.",
    "hashName": "contextmenucheckboxitem",
    "key": "checked",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "hashName": "contextmenucheckboxitem",
    "key": "defaultChecked",
    "kobalte": true
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the item changes.",
    "hashName": "contextmenucheckboxitem",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the ContextMenu.ItemLabel part if provided, or fallback to the .textContent of the ContextMenu.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "contextmenucheckboxitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is in an indeterminate state.",
    "hashName": "contextmenucheckboxitem",
    "key": "indeterminate",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "contextmenucheckboxitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "hashName": "contextmenucheckboxitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "contextmenucheckboxitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const ContextMenuSub = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the sub menu.",
    "hashName": "contextmenusub",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "contextmenusub",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the sub menu changes.",
    "hashName": "contextmenusub",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "hashName": "contextmenusub",
    "key": "getAnchorRect",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "contextmenusub",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the sub menu content along the trigger element.",
    "hashName": "contextmenusub",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should slide when it overflows.",
    "hashName": "contextmenusub",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "hashName": "contextmenusub",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "contextmenusub",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "hashName": "contextmenusub",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "contextmenusub",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "hashName": "contextmenusub",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "contextmenusub",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const ContextMenuSubTrigger = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the ContextMenu.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "contextmenusubtrigger",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu trigger is disabled or not.",
    "hashName": "contextmenusubtrigger",
    "key": "disabled",
    "kobalte": true
  }
];

export const ContextMenuSubContent = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenusubcontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenusubcontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenusubcontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "contextmenusubcontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];