export const Menubar = [
  {
    "componentName": "string",
    "description": "The value of the menu that should be open when initially rendered. Use when you do not need to control the value state.",
    "hashName": "menubar-1",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The controlled value of the menu to open. Should be used in conjunction with onValueChange.",
    "hashName": "menubar-1",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "(value: string | undefined | null) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "menubar-1",
    "key": "onValueChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "hashName": "menubar-1",
    "key": "loop",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, click on alt by itsef will focus this Menubar (some browsers interfere).",
    "hashName": "menubar-1",
    "key": "focusOnAlt",
    "kobalte": true
  }
];

export const MenubarMenu = [
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the menu changes.",
    "hashName": "menubarmenu",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "hashName": "menubarmenu",
    "key": "id",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "hashName": "menubarmenu",
    "key": "modal",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "hashName": "menubarmenu",
    "key": "preventScroll",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "menubarmenu",
    "key": "forceMount",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique value that associates the item with an active value when the navigation menu is controlled. This prop is managed automatically when uncontrolled.",
    "hashName": "menubarmenu",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the menu content.",
    "hashName": "menubarmenu",
    "key": "placement",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "menubarmenu",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the menu content along the trigger element.",
    "hashName": "menubarmenu",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "hashName": "menubarmenu",
    "key": "flip",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should slide when it overflows.",
    "hashName": "menubarmenu",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "hashName": "menubarmenu",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "hashName": "menubarmenu",
    "key": "sameWidth",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "menubarmenu",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "hashName": "menubarmenu",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "menubarmenu",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the menu content corner.",
    "hashName": "menubarmenu",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "menubarmenu",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const MenubarTrigger = [
  {
    "componentName": "boolean",
    "description": "Whether the context menu trigger is disabled or not.",
    "hashName": "menubartrigger",
    "key": "disabled",
    "kobalte": true
  }
];

export const MenubarContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarcontent",
    "key": "onOpenAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarcontent",
    "key": "onCloseAutoFocus",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarcontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarcontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarcontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarcontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];

export const MenubarArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "hashName": "menubararrow",
    "key": "size",
    "kobalte": true
  }
];

export const MenubarItem = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "menubaritem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "menubaritem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is activated.",
    "hashName": "menubaritem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "menubaritem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const MenubarItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "menubaritemindicator",
    "key": "forceMount",
    "kobalte": true
  }
];

export const MenubarRadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the menu radio item to check.",
    "hashName": "menubarradiogroup",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "hashName": "menubarradiogroup",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "menubarradiogroup",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled or not.",
    "hashName": "menubarradiogroup",
    "key": "disabled",
    "kobalte": true
  }
];

export const MenubarRadioItem = [
  {
    "componentName": "string",
    "description": "The value of the menu item radio.",
    "hashName": "menubarradioitem",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "menubarradioitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "menubarradioitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked.",
    "hashName": "menubarradioitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "menubarradioitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const MenubarCheckboxItem = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the item.",
    "hashName": "menubarcheckboxitem",
    "key": "checked",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "hashName": "menubarcheckboxitem",
    "key": "defaultChecked",
    "kobalte": true
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the item changes.",
    "hashName": "menubarcheckboxitem",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "menubarcheckboxitem",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is in an indeterminate state.",
    "hashName": "menubarcheckboxitem",
    "key": "indeterminate",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "hashName": "menubarcheckboxitem",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "hashName": "menubarcheckboxitem",
    "key": "closeOnSelect",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "hashName": "menubarcheckboxitem",
    "key": "onSelect",
    "kobalte": true
  }
];

export const MenubarSub = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the sub menu.",
    "hashName": "menubarsub",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "menubarsub",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the sub menu changes.",
    "hashName": "menubarsub",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "hashName": "menubarsub",
    "key": "getAnchorRect",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "hashName": "menubarsub",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the sub menu content along the trigger element.",
    "hashName": "menubarsub",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should slide when it overflows.",
    "hashName": "menubarsub",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "hashName": "menubarsub",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "menubarsub",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "hashName": "menubarsub",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "menubarsub",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "hashName": "menubarsub",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "menubarsub",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const MenubarSubTrigger = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "hashName": "menubarsubtrigger",
    "key": "textValue",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu trigger is disabled or not.",
    "hashName": "menubarsubtrigger",
    "key": "disabled",
    "kobalte": true
  }
];

export const MenubarSubContent = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarsubcontent",
    "key": "onEscapeKeyDown",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarsubcontent",
    "key": "onPointerDownOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarsubcontent",
    "key": "onFocusOutside",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "hashName": "menubarsubcontent",
    "key": "onInteractOutside",
    "kobalte": true
  }
];