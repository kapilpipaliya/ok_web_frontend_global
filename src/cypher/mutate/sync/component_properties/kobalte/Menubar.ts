export const Menubar = [
  {
    "componentName": "string",
    "description": "The value of the menu that should be open when initially rendered. Use when you do not need to control the value state.",
    "name": "defaultValue",
    "hashName": "menubar-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The controlled value of the menu to open. Should be used in conjunction with onValueChange.",
    "name": "value",
    "hashName": "menubar-1",
    "kobalte": true
  },
  {
    "componentName": "(value: string | undefined | null) => void",
    "description": "Event handler called when the value changes.",
    "name": "onValueChange",
    "hashName": "menubar-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "name": "loop",
    "hashName": "menubar-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When true, click on alt by itsef will focus this Menubar (some browsers interfere).",
    "name": "focusOnAlt",
    "hashName": "menubar-1",
    "kobalte": true
  }
];

export const MenubarMenu = [
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the menu changes.",
    "name": "onOpenChange",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "name": "id",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "name": "modal",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "name": "preventScroll",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "A unique value that associates the item with an active value when the navigation menu is controlled. This prop is managed automatically when uncontrolled.",
    "name": "value",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the menu content.",
    "name": "placement",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "name": "gutter",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the menu content along the trigger element.",
    "name": "shift",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "name": "flip",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should slide when it overflows.",
    "name": "slide",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "name": "overlap",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "name": "sameWidth",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "name": "fitViewport",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "name": "hideWhenDetached",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "name": "detachedPadding",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the menu content corner.",
    "name": "arrowPadding",
    "hashName": "menubarmenu",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "name": "overflowPadding",
    "hashName": "menubarmenu",
    "kobalte": true
  }
];

export const MenubarTrigger = [
  {
    "componentName": "boolean",
    "description": "Whether the context menu trigger is disabled or not.",
    "name": "disabled",
    "hashName": "menubartrigger",
    "kobalte": true
  }
];

export const MenubarContent = [
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves into the component after opening. It can be prevented by calling event.preventDefault.",
    "name": "onOpenAutoFocus",
    "hashName": "menubarcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: Event) => void",
    "description": "Event handler called when focus moves to the trigger after closing. It can be prevented by calling event.preventDefault.",
    "name": "onCloseAutoFocus",
    "hashName": "menubarcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "name": "onEscapeKeyDown",
    "hashName": "menubarcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onPointerDownOutside",
    "hashName": "menubarcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onFocusOutside",
    "hashName": "menubarcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onInteractOutside",
    "hashName": "menubarcontent",
    "kobalte": true
  }
];

export const MenubarArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "name": "size",
    "hashName": "menubararrow",
    "kobalte": true
  }
];

export const MenubarItem = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "name": "textValue",
    "hashName": "menubaritem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "name": "disabled",
    "hashName": "menubaritem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is activated.",
    "name": "closeOnSelect",
    "hashName": "menubaritem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "name": "onSelect",
    "hashName": "menubaritem",
    "kobalte": true
  }
];

export const MenubarItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "menubaritemindicator",
    "kobalte": true
  }
];

export const MenubarRadioGroup = [
  {
    "componentName": "string",
    "description": "The controlled value of the menu radio item to check.",
    "name": "value",
    "hashName": "menubarradiogroup",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "name": "defaultValue",
    "hashName": "menubarradiogroup",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Event handler called when the value changes.",
    "name": "onChange",
    "hashName": "menubarradiogroup",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the radio group is disabled or not.",
    "name": "disabled",
    "hashName": "menubarradiogroup",
    "kobalte": true
  }
];

export const MenubarRadioItem = [
  {
    "componentName": "string",
    "description": "The value of the menu item radio.",
    "name": "value",
    "hashName": "menubarradioitem",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "name": "textValue",
    "hashName": "menubarradioitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "name": "disabled",
    "hashName": "menubarradioitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked.",
    "name": "closeOnSelect",
    "hashName": "menubarradioitem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "name": "onSelect",
    "hashName": "menubarradioitem",
    "kobalte": true
  }
];

export const MenubarCheckboxItem = [
  {
    "componentName": "boolean",
    "description": "The controlled checked state of the item.",
    "name": "checked",
    "hashName": "menubarcheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "name": "defaultChecked",
    "hashName": "menubarcheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "(checked: boolean) => void",
    "description": "Event handler called when the checked state of the item changes.",
    "name": "onChange",
    "hashName": "menubarcheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "name": "textValue",
    "hashName": "menubarcheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is in an indeterminate state.",
    "name": "indeterminate",
    "hashName": "menubarcheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the item is disabled or not.",
    "name": "disabled",
    "hashName": "menubarcheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "name": "closeOnSelect",
    "hashName": "menubarcheckboxitem",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "name": "onSelect",
    "hashName": "menubarcheckboxitem",
    "kobalte": true
  }
];

export const MenubarSub = [
  {
    "componentName": "boolean",
    "description": "The controlled open state of the sub menu.",
    "name": "open",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "name": "defaultOpen",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the sub menu changes.",
    "name": "onOpenChange",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "(anchor?: HTMLElement) => AnchorRect  | undefined",
    "description": "Function that returns the trigger element's DOMRect.",
    "name": "getAnchorRect",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "name": "gutter",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the sub menu content along the trigger element.",
    "name": "shift",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should slide when it overflows.",
    "name": "slide",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "name": "overlap",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "name": "fitViewport",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "name": "hideWhenDetached",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "name": "detachedPadding",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "name": "arrowPadding",
    "hashName": "menubarsub",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "name": "overflowPadding",
    "hashName": "menubarsub",
    "kobalte": true
  }
];

export const MenubarSubTrigger = [
  {
    "componentName": "string",
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "name": "textValue",
    "hashName": "menubarsubtrigger",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the sub menu trigger is disabled or not.",
    "name": "disabled",
    "hashName": "menubarsubtrigger",
    "kobalte": true
  }
];

export const MenubarSubContent = [
  {
    "componentName": "(event: KeyboardEvent) => void",
    "description": "Event handler called when the escape key is down. It can be prevented by calling event.preventDefault.",
    "name": "onEscapeKeyDown",
    "hashName": "menubarsubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: PointerDownOutsideEvent) => void",
    "description": "Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onPointerDownOutside",
    "hashName": "menubarsubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: FocusOutsideEvent) => void",
    "description": "Event handler called when the focus moves outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onFocusOutside",
    "hashName": "menubarsubcontent",
    "kobalte": true
  },
  {
    "componentName": "(event: InteractOutsideEvent) => void",
    "description": "Event handler called when an interaction (pointer or focus event) happens outside the bounds of the component. It can be prevented by calling event.preventDefault.",
    "name": "onInteractOutside",
    "hashName": "menubarsubcontent",
    "kobalte": true
  }
];