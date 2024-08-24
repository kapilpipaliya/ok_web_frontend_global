export const Menubar = [
  {
    "description": "The value of the menu that should be open when initially rendered. Use when you do not need to control the value state.",
    "property": "defaultValue",
    "type": "string"
  },
  {
    "description": "The controlled value of the menu to open. Should be used in conjunction with onValueChange.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Event handler called when the value changes.",
    "property": "onValueChange",
    "type": "(value: string | undefined | null) => void"
  },
  {
    "description": "When true, keyboard navigation will loop from last item to first, and vice versa.",
    "property": "loop",
    "type": "boolean"
  },
  {
    "description": "When true, click on alt by itsef will focus this Menubar (some browsers interfere).",
    "property": "focusOnAlt",
    "type": "boolean"
  }
];

export const MenubarMenu = [
  {
    "description": "Event handler called when the open state of the menu changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "description": "A unique identifier for the component. The id is used to generate id attributes for nested components. If no id prop is provided, a generated id will be used.",
    "property": "id",
    "type": "string"
  },
  {
    "description": "Whether the menu should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the menu content.  - elements outside the menu content will not be visible for screen readers.",
    "property": "modal",
    "type": "boolean"
  },
  {
    "description": "Whether the scroll should be locked even if the menu is not modal.",
    "property": "preventScroll",
    "type": "boolean"
  },
  {
    "description": "Used to force mounting the menu (portal and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "description": "A unique value that associates the item with an active value when the navigation menu is controlled. This prop is managed automatically when uncontrolled.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "The placement of the menu content.",
    "property": "placement",
    "type": "Placement"
  },
  {
    "description": "The distance between the menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "property": "gutter",
    "type": "number"
  },
  {
    "description": "The skidding of the menu content along the trigger element.",
    "property": "shift",
    "type": "number"
  },
  {
    "description": "Controls the behavior of the menu content when it overflows the viewport: - If a boolean, specifies whether the menu content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "property": "flip",
    "type": "boolean | string"
  },
  {
    "description": "Whether the menu content should slide when it overflows.",
    "property": "slide",
    "type": "boolean"
  },
  {
    "description": "Whether the menu content can overlap the trigger element when it overflows.",
    "property": "overlap",
    "type": "boolean"
  },
  {
    "description": "Whether the menu content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "property": "sameWidth",
    "type": "boolean"
  },
  {
    "description": "Whether the menu content should fit the viewport. If this is set to true, the menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport",
    "type": "boolean"
  },
  {
    "description": "Whether to hide the menu content when the trigger element becomes occluded.",
    "property": "hideWhenDetached",
    "type": "boolean"
  },
  {
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "property": "detachedPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the arrow and the menu content corner.",
    "property": "arrowPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding",
    "type": "number"
  }
];

export const MenubarTrigger = [
  {
    "description": "Whether the context menu trigger is disabled or not.",
    "property": "disabled",
    "type": "boolean"
  }
];

export const MenubarContent = [
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

export const MenubarArrow = [
  {
    "description": "The size of the arrow.",
    "property": "size",
    "type": "number"
  }
];

export const MenubarItem = [
  {
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "property": "textValue",
    "type": "string"
  },
  {
    "description": "Whether the item is disabled or not.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the menu should close when the item is activated.",
    "property": "closeOnSelect",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "property": "onSelect",
    "type": "() => void"
  }
];

export const MenubarItemIndicator = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];

export const MenubarRadioGroup = [
  {
    "description": "The controlled value of the menu radio item to check.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "The value of the menu radio item that should be checked when initially rendered. Useful when you do not need to control the state of the radio group.",
    "property": "defaultValue",
    "type": "string"
  },
  {
    "description": "Event handler called when the value changes.",
    "property": "onChange",
    "type": "(value: string) => void"
  },
  {
    "description": "Whether the radio group is disabled or not.",
    "property": "disabled",
    "type": "boolean"
  }
];

export const MenubarRadioItem = [
  {
    "description": "The value of the menu item radio.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "property": "textValue",
    "type": "string"
  },
  {
    "description": "Whether the item is disabled or not.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the menu should close when the item is checked.",
    "property": "closeOnSelect",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "property": "onSelect",
    "type": "() => void"
  }
];

export const MenubarCheckboxItem = [
  {
    "description": "The controlled checked state of the item.",
    "property": "checked",
    "type": "boolean"
  },
  {
    "description": "The default checked state when initially rendered. Useful when you do not need to control the checked state.",
    "property": "defaultChecked",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the checked state of the item changes.",
    "property": "onChange",
    "type": "(checked: boolean) => void"
  },
  {
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.ItemLabel part if provided, or fallback to the .textContent of the Menubar.Item. Use this when the content is complex, or you have non-textual content inside.",
    "property": "textValue",
    "type": "string"
  },
  {
    "description": "Whether the item is in an indeterminate state.",
    "property": "indeterminate",
    "type": "boolean"
  },
  {
    "description": "Whether the item is disabled or not.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the menu should close when the item is checked/unchecked.",
    "property": "closeOnSelect",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the user selects an item (via mouse or keyboard).",
    "property": "onSelect",
    "type": "() => void"
  }
];

export const MenubarSub = [
  {
    "description": "The controlled open state of the sub menu.",
    "property": "open",
    "type": "boolean"
  },
  {
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the open state of the sub menu changes.",
    "property": "onOpenChange",
    "type": "(open: boolean) => void"
  },
  {
    "description": "Function that returns the trigger element's DOMRect.",
    "property": "getAnchorRect",
    "type": "(anchor?: HTMLElement) => AnchorRect  | undefined"
  },
  {
    "description": "The distance between the sub menu content and the trigger element. By default, it's 0 plus half of the arrow offset, if it exists.",
    "property": "gutter",
    "type": "number"
  },
  {
    "description": "The skidding of the sub menu content along the trigger element.",
    "property": "shift",
    "type": "number"
  },
  {
    "description": "Whether the sub menu content should slide when it overflows.",
    "property": "slide",
    "type": "boolean"
  },
  {
    "description": "Whether the sub menu content can overlap the trigger element when it overflows.",
    "property": "overlap",
    "type": "boolean"
  },
  {
    "description": "Whether the sub menu content should fit the viewport. If this is set to true, the sub menu content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport",
    "type": "boolean"
  },
  {
    "description": "Whether to hide the sub menu content when the trigger element becomes occluded.",
    "property": "hideWhenDetached",
    "type": "boolean"
  },
  {
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "property": "detachedPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the arrow and the sub menu content corner.",
    "property": "arrowPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the sub menu content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding",
    "type": "number"
  }
];

export const MenubarSubTrigger = [
  {
    "description": "Optional text used for typeahead purposes. By default, the typeahead behavior will use the .textContent of the Menubar.SubTrigger. Use this when the content is complex, or you have non-textual content inside.",
    "property": "textValue",
    "type": "string"
  },
  {
    "description": "Whether the sub menu trigger is disabled or not.",
    "property": "disabled",
    "type": "boolean"
  }
];

export const MenubarSubContent = [
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