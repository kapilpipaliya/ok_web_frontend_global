export const Combobox = [
  {
    "componentName": "\"startsWith\" | \"endsWith\" | \"contains\" | ((option: Option, inputValue: string) => boolean)",
    "description": "The filter function used to determine if an option should be included in the combo box list.",
    "name": "defaultFilter",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "Array<T | U>",
    "description": "An array of options to display as the available options.",
    "name": "options",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string | number)",
    "description": "Property name or getter function to use as the value of an option. This is the value that will be submitted when the combobox is part of a <form>.",
    "name": "optionValue",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the text value of an option for typeahead purpose.",
    "name": "optionTextValue",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the label of an option. This is the string representation of the option to display in the Combobox.Input.",
    "name": "optionLabel",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => boolean)",
    "description": "Property name or getter function to use as the disabled flag of an option.",
    "name": "optionDisabled",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "keyof U",
    "description": "Property name that refers to the children options of an option group.",
    "name": "optionGroupChildren",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "Component<ComboboxItemComponentProps<T>>",
    "description": "When NOT virtualized, the component to render as an item in the Combobox.Listbox.",
    "name": "itemComponent",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "Component<ComboboxSectionComponentProps<U>>",
    "description": "When NOT virtualized, the component to render as a section in the Combobox.Listbox.",
    "name": "sectionComponent",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox allows multi-selection.",
    "name": "multiple",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element",
    "description": "The content that will be rendered when no value or defaultValue is set.",
    "name": "placeholder",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The controlled value of the combobox.",
    "name": "value",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The value of the combobox when initially rendered. Useful when you do not need to control the value.",
    "name": "defaultValue",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "(value: T | Array<T>) => void",
    "description": "Event handler called when the value changes.",
    "name": "onChange",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The controlled open state of the combobox.",
    "name": "open",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "name": "defaultOpen",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean, triggerMode?: ComboboxTriggerMode) => void",
    "description": "Event handler called when the open state of the combobox changes. Returns the new open state and the action that caused the opening of the menu.",
    "name": "onOpenChange",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "(value: string) => void",
    "description": "Handler that is called when the combobox input value changes.",
    "name": "onInputChange",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "ComboboxTriggerMode",
    "description": "The interaction required to display the combobox menu, it can be one of the following:  - input: open the combobox menu when the user is typing.  - focus: open the combobox menu when the input is focused.  - manual: open the combobox menu when pressing arrow down/up while focus is on the input or clicking on the trigger.",
    "name": "triggerMode",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "When multiple is true, whether the last selected option should be removed when the user press the Backspace key and the input is empty.",
    "name": "removeOnBackspace",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether onChange should fire even if the new value is the same as the last.",
    "name": "allowDuplicateSelectionEvents",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox allows empty selection or not.",
    "name": "disallowEmptySelection",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox closes after selection.",
    "name": "closeOnSelection",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "'toggle' | 'replace'",
    "description": "How selection should behave in the combobox.",
    "name": "selectionBehavior",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox uses virtual scrolling.",
    "name": "virtualized",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the combobox content.  - elements outside the combobox content will not be visible for screen readers.",
    "name": "modal",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the combobox is not modal.",
    "name": "preventScroll",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the combobox (portal, positioner and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the combobox. Submitted with its owning form as part of a name/value pair.",
    "name": "name",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the combobox should display its \"valid\" or \"invalid\" visual styling.",
    "name": "validationState",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must select an item before the owning form can be submitted.",
    "name": "required",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox is disabled.",
    "name": "disabled",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox items can be selected but not changed by the user.",
    "name": "readOnly",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Describes the type of autocomplete functionality the input should provide if any. See MDN",
    "name": "autoComplete",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "ComboboxIntlTranslations",
    "description": "Localization strings.",
    "name": "translations",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the combobox content.",
    "name": "placement",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the combobox content and the trigger element.",
    "name": "gutter",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the combobox content along the trigger element.",
    "name": "shift",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the combobox content when it overflows the viewport:  - If a boolean, specifies whether the combobox content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "name": "flip",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should slide when it overflows.",
    "name": "slide",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content can overlap the trigger element when it overflows.",
    "name": "overlap",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "name": "sameWidth",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should fit the viewport. If this is set to true, the combobox content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "name": "fitViewport",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the combobox content when the trigger element becomes occluded.",
    "name": "hideWhenDetached",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "name": "detachedPadding",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the combobox content corner.",
    "name": "arrowPadding",
    "hashName": "combobox-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the combobox content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "name": "overflowPadding",
    "hashName": "combobox-1",
    "kobalte": true
  }
];

export const ComboboxControl = [
  {
    "componentName": "Accessor<T[]>",
    "description": "An array of selected options.",
    "name": "selectedOptions",
    "hashName": "comboboxcontrol",
    "kobalte": true
  },
  {
    "componentName": "(option: T) => void",
    "description": "A function to remove an option from the selection.",
    "name": "remove",
    "hashName": "comboboxcontrol",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "A function to clear the selection.",
    "name": "clear",
    "hashName": "comboboxcontrol",
    "kobalte": true
  }
];

export const ComboboxErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "comboboxerrormessage",
    "kobalte": true
  }
];

export const ComboboxArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "name": "size",
    "hashName": "comboboxarrow",
    "kobalte": true
  }
];

export const ComboboxListbox = [
  {
    "componentName": "Accessor<HTMLElement | undefined>",
    "description": "The ref attached to the scrollable element, used to provide automatic scrolling on item focus. If not provided, defaults to the listbox.",
    "name": "scrollRef",
    "hashName": "comboboxlistbox",
    "kobalte": true
  },
  {
    "componentName": "(key: string) => void",
    "description": "When virtualized, the Virtualizer function used to scroll to the item of the given key.",
    "name": "scrollToItem",
    "hashName": "comboboxlistbox",
    "kobalte": true
  },
  {
    "componentName": "(items: Accessor<Collection<CollectionNode<T | U>>>) => JSX.Element",
    "description": "When virtualized, a map function that receives an items signal representing all items and sections.",
    "name": "children",
    "hashName": "comboboxlistbox",
    "kobalte": true
  }
];

export const ComboboxItem = [
  {
    "componentName": "CollectionNode",
    "description": "The collection node to render.",
    "name": "item",
    "hashName": "comboboxitem",
    "kobalte": true
  }
];

export const ComboboxItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "comboboxitemindicator",
    "kobalte": true
  }
];