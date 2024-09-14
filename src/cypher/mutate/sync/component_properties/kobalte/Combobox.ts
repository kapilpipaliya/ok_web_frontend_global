export const Combobox = [
  {
    "componentName": "\"startsWith\" | \"endsWith\" | \"contains\" | ((option: Option, inputValue: string) => boolean)",
    "description": "The filter function used to determine if an option should be included in the combo box list.",
    "hashName": "combobox-1",
    "key": "defaultFilter",
    "kobalte": true
  },
  {
    "componentName": "Array<T | U>",
    "description": "An array of options to display as the available options.",
    "hashName": "combobox-1",
    "key": "options",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string | number)",
    "description": "Property name or getter function to use as the value of an option. This is the value that will be submitted when the combobox is part of a <form>.",
    "hashName": "combobox-1",
    "key": "optionValue",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the text value of an option for typeahead purpose.",
    "hashName": "combobox-1",
    "key": "optionTextValue",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the label of an option. This is the string representation of the option to display in the Combobox.Input.",
    "hashName": "combobox-1",
    "key": "optionLabel",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => boolean)",
    "description": "Property name or getter function to use as the disabled flag of an option.",
    "hashName": "combobox-1",
    "key": "optionDisabled",
    "kobalte": true
  },
  {
    "componentName": "keyof U",
    "description": "Property name that refers to the children options of an option group.",
    "hashName": "combobox-1",
    "key": "optionGroupChildren",
    "kobalte": true
  },
  {
    "componentName": "Component<ComboboxItemComponentProps<T>>",
    "description": "When NOT virtualized, the component to render as an item in the Combobox.Listbox.",
    "hashName": "combobox-1",
    "key": "itemComponent",
    "kobalte": true
  },
  {
    "componentName": "Component<ComboboxSectionComponentProps<U>>",
    "description": "When NOT virtualized, the component to render as a section in the Combobox.Listbox.",
    "hashName": "combobox-1",
    "key": "sectionComponent",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox allows multi-selection.",
    "hashName": "combobox-1",
    "key": "multiple",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element",
    "description": "The content that will be rendered when no value or defaultValue is set.",
    "hashName": "combobox-1",
    "key": "placeholder",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The controlled value of the combobox.",
    "hashName": "combobox-1",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The value of the combobox when initially rendered. Useful when you do not need to control the value.",
    "hashName": "combobox-1",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: T | Array<T>) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "combobox-1",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The controlled open state of the combobox.",
    "hashName": "combobox-1",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "combobox-1",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean, triggerMode?: ComboboxTriggerMode) => void",
    "description": "Event handler called when the open state of the combobox changes. Returns the new open state and the action that caused the opening of the menu.",
    "hashName": "combobox-1",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Handler that is called when the combobox input value changes.",
    "hashName": "combobox-1",
    "key": "onInputChange",
    "kobalte": true
  },
  {
    "componentName": "ComboboxTriggerMode",
    "description": "The interaction required to display the combobox menu, it can be one of the following:  - input: open the combobox menu when the user is typing.  - focus: open the combobox menu when the input is focused.  - manual: open the combobox menu when pressing arrow down/up while focus is on the input or clicking on the trigger.",
    "hashName": "combobox-1",
    "key": "triggerMode",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When multiple is true, whether the last selected option should be removed when the user press the Backspace key and the input is empty.",
    "hashName": "combobox-1",
    "key": "removeOnBackspace",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether onChange should fire even if the new value is the same as the last.",
    "hashName": "combobox-1",
    "key": "allowDuplicateSelectionEvents",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox allows empty selection or not.",
    "hashName": "combobox-1",
    "key": "disallowEmptySelection",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox closes after selection.",
    "hashName": "combobox-1",
    "key": "closeOnSelection",
    "kobalte": true
  },
  {
    "componentName": "'toggle' | 'replace'",
    "description": "How selection should behave in the combobox.",
    "hashName": "combobox-1",
    "key": "selectionBehavior",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox uses virtual scrolling.",
    "hashName": "combobox-1",
    "key": "virtualized",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the combobox content.  - elements outside the combobox content will not be visible for screen readers.",
    "hashName": "combobox-1",
    "key": "modal",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the combobox is not modal.",
    "hashName": "combobox-1",
    "key": "preventScroll",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the combobox (portal, positioner and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "combobox-1",
    "key": "forceMount",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the combobox. Submitted with its owning form as part of a name/value pair.",
    "hashName": "combobox-1",
    "key": "name",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the combobox should display its \"valid\" or \"invalid\" visual styling.",
    "hashName": "combobox-1",
    "key": "validationState",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must select an item before the owning form can be submitted.",
    "hashName": "combobox-1",
    "key": "required",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox is disabled.",
    "hashName": "combobox-1",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox items can be selected but not changed by the user.",
    "hashName": "combobox-1",
    "key": "readOnly",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Describes the type of autocomplete functionality the input should provide if any. See MDN",
    "hashName": "combobox-1",
    "key": "autoComplete",
    "kobalte": true
  },
  {
    "componentName": "ComboboxIntlTranslations",
    "description": "Localization strings.",
    "hashName": "combobox-1",
    "key": "translations",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the combobox content.",
    "hashName": "combobox-1",
    "key": "placement",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the combobox content and the trigger element.",
    "hashName": "combobox-1",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the combobox content along the trigger element.",
    "hashName": "combobox-1",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the combobox content when it overflows the viewport:  - If a boolean, specifies whether the combobox content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "hashName": "combobox-1",
    "key": "flip",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should slide when it overflows.",
    "hashName": "combobox-1",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content can overlap the trigger element when it overflows.",
    "hashName": "combobox-1",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "hashName": "combobox-1",
    "key": "sameWidth",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should fit the viewport. If this is set to true, the combobox content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "combobox-1",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the combobox content when the trigger element becomes occluded.",
    "hashName": "combobox-1",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "combobox-1",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the combobox content corner.",
    "hashName": "combobox-1",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the combobox content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "combobox-1",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const ComboboxControl = [
  {
    "componentName": "Accessor<T[]>",
    "description": "An array of selected options.",
    "hashName": "comboboxcontrol",
    "key": "selectedOptions",
    "kobalte": true
  },
  {
    "componentName": "(option: T) => void",
    "description": "A function to remove an option from the selection.",
    "hashName": "comboboxcontrol",
    "key": "remove",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "A function to clear the selection.",
    "hashName": "comboboxcontrol",
    "key": "clear",
    "kobalte": true
  }
];

export const ComboboxErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "comboboxerrormessage",
    "key": "forceMount",
    "kobalte": true
  }
];

export const ComboboxArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "hashName": "comboboxarrow",
    "key": "size",
    "kobalte": true
  }
];

export const ComboboxListbox = [
  {
    "componentName": "Accessor<HTMLElement | undefined>",
    "description": "The ref attached to the scrollable element, used to provide automatic scrolling on item focus. If not provided, defaults to the listbox.",
    "hashName": "comboboxlistbox",
    "key": "scrollRef",
    "kobalte": true
  },
  {
    "componentName": "(key: string) => void",
    "description": "When virtualized, the Virtualizer function used to scroll to the item of the given key.",
    "hashName": "comboboxlistbox",
    "key": "scrollToItem",
    "kobalte": true
  },
  {
    "componentName": "(items: Accessor<Collection<CollectionNode<T | U>>>) => JSX.Element",
    "description": "When virtualized, a map function that receives an items signal representing all items and sections.",
    "hashName": "comboboxlistbox",
    "key": "children",
    "kobalte": true
  }
];

export const ComboboxItem = [
  {
    "componentName": "CollectionNode",
    "description": "The collection node to render.",
    "hashName": "comboboxitem",
    "key": "item",
    "kobalte": true
  }
];

export const ComboboxItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "comboboxitemindicator",
    "key": "forceMount",
    "kobalte": true
  }
];