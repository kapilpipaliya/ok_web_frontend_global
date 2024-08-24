export const Combobox = [
  {
    "description": "The filter function used to determine if an option should be included in the combo box list.",
    "property": "defaultFilter",
    "type": "\"startsWith\" | \"endsWith\" | \"contains\" | ((option: Option, inputValue: string) => boolean)"
  },
  {
    "description": "An array of options to display as the available options.",
    "property": "options",
    "type": "Array<T | U>"
  },
  {
    "description": "Property name or getter function to use as the value of an option. This is the value that will be submitted when the combobox is part of a <form>.",
    "property": "optionValue",
    "type": "keyof T | ((option: T) => string | number)"
  },
  {
    "description": "Property name or getter function to use as the text value of an option for typeahead purpose.",
    "property": "optionTextValue",
    "type": "keyof T | ((option: T) => string)"
  },
  {
    "description": "Property name or getter function to use as the label of an option. This is the string representation of the option to display in the Combobox.Input.",
    "property": "optionLabel",
    "type": "keyof T | ((option: T) => string)"
  },
  {
    "description": "Property name or getter function to use as the disabled flag of an option.",
    "property": "optionDisabled",
    "type": "keyof T | ((option: T) => boolean)"
  },
  {
    "description": "Property name that refers to the children options of an option group.",
    "property": "optionGroupChildren",
    "type": "keyof U"
  },
  {
    "description": "When NOT virtualized, the component to render as an item in the Combobox.Listbox.",
    "property": "itemComponent",
    "type": "Component<ComboboxItemComponentProps<T>>"
  },
  {
    "description": "When NOT virtualized, the component to render as a section in the Combobox.Listbox.",
    "property": "sectionComponent",
    "type": "Component<ComboboxSectionComponentProps<U>>"
  },
  {
    "description": "Whether the combobox allows multi-selection.",
    "property": "multiple",
    "type": "boolean"
  },
  {
    "description": "The content that will be rendered when no value or defaultValue is set.",
    "property": "placeholder",
    "type": "JSX.Element"
  },
  {
    "description": "The controlled value of the combobox.",
    "property": "value",
    "type": "T | Array<T>"
  },
  {
    "description": "The value of the combobox when initially rendered. Useful when you do not need to control the value.",
    "property": "defaultValue",
    "type": "T | Array<T>"
  },
  {
    "description": "Event handler called when the value changes.",
    "property": "onChange",
    "type": "(value: T | Array<T>) => void"
  },
  {
    "description": "The controlled open state of the combobox.",
    "property": "open",
    "type": "boolean"
  },
  {
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen",
    "type": "boolean"
  },
  {
    "description": "Event handler called when the open state of the combobox changes. Returns the new open state and the action that caused the opening of the menu.",
    "property": "onOpenChange",
    "type": "(open: boolean, triggerMode?: ComboboxTriggerMode) => void"
  },
  {
    "description": "Handler that is called when the combobox input value changes.",
    "property": "onInputChange",
    "type": "(value: string) => void"
  },
  {
    "description": "The interaction required to display the combobox menu, it can be one of the following:  - input: open the combobox menu when the user is typing.  - focus: open the combobox menu when the input is focused.  - manual: open the combobox menu when pressing arrow down/up while focus is on the input or clicking on the trigger.",
    "property": "triggerMode",
    "type": "ComboboxTriggerMode"
  },
  {
    "description": "When multiple is true, whether the last selected option should be removed when the user press the Backspace key and the input is empty.",
    "property": "removeOnBackspace",
    "type": "boolean"
  },
  {
    "description": "Whether onChange should fire even if the new value is the same as the last.",
    "property": "allowDuplicateSelectionEvents",
    "type": "boolean"
  },
  {
    "description": "Whether the combobox allows empty selection or not.",
    "property": "disallowEmptySelection",
    "type": "boolean"
  },
  {
    "description": "Whether the combobox closes after selection.",
    "property": "closeOnSelection",
    "type": "boolean"
  },
  {
    "description": "How selection should behave in the combobox.",
    "property": "selectionBehavior",
    "type": "'toggle' | 'replace'"
  },
  {
    "description": "Whether the combobox uses virtual scrolling.",
    "property": "virtualized",
    "type": "boolean"
  },
  {
    "description": "Whether the combobox should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the combobox content.  - elements outside the combobox content will not be visible for screen readers.",
    "property": "modal",
    "type": "boolean"
  },
  {
    "description": "Whether the scroll should be locked even if the combobox is not modal.",
    "property": "preventScroll",
    "type": "boolean"
  },
  {
    "description": "Used to force mounting the combobox (portal, positioner and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  },
  {
    "description": "The name of the combobox. Submitted with its owning form as part of a name/value pair.",
    "property": "name",
    "type": "string"
  },
  {
    "description": "Whether the combobox should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState",
    "type": "'valid' | 'invalid'"
  },
  {
    "description": "Whether the user must select an item before the owning form can be submitted.",
    "property": "required",
    "type": "boolean"
  },
  {
    "description": "Whether the combobox is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Whether the combobox items can be selected but not changed by the user.",
    "property": "readOnly",
    "type": "boolean"
  },
  {
    "description": "Describes the type of autocomplete functionality the input should provide if any. See MDN",
    "property": "autoComplete",
    "type": "string"
  },
  {
    "description": "Localization strings.",
    "property": "translations",
    "type": "ComboboxIntlTranslations"
  },
  {
    "description": "The placement of the combobox content.",
    "property": "placement",
    "type": "Placement"
  },
  {
    "description": "The distance between the combobox content and the trigger element.",
    "property": "gutter",
    "type": "number"
  },
  {
    "description": "The skidding of the combobox content along the trigger element.",
    "property": "shift",
    "type": "number"
  },
  {
    "description": "Controls the behavior of the combobox content when it overflows the viewport:  - If a boolean, specifies whether the combobox content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "property": "flip",
    "type": "boolean | string"
  },
  {
    "description": "Whether the combobox content should slide when it overflows.",
    "property": "slide",
    "type": "boolean"
  },
  {
    "description": "Whether the combobox content can overlap the trigger element when it overflows.",
    "property": "overlap",
    "type": "boolean"
  },
  {
    "description": "Whether the combobox content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "property": "sameWidth",
    "type": "boolean"
  },
  {
    "description": "Whether the combobox content should fit the viewport. If this is set to true, the combobox content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport",
    "type": "boolean"
  },
  {
    "description": "Whether to hide the combobox content when the trigger element becomes occluded.",
    "property": "hideWhenDetached",
    "type": "boolean"
  },
  {
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "property": "detachedPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the arrow and the combobox content corner.",
    "property": "arrowPadding",
    "type": "number"
  },
  {
    "description": "The minimum padding between the combobox content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding",
    "type": "number"
  }
];

export const ComboboxControl = [
  {
    "description": "An array of selected options.",
    "property": "selectedOptions",
    "type": "Accessor<T[]>"
  },
  {
    "description": "A function to remove an option from the selection.",
    "property": "remove",
    "type": "(option: T) => void"
  },
  {
    "description": "A function to clear the selection.",
    "property": "clear",
    "type": "() => void"
  }
];

export const ComboboxErrorMessage = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];

export const ComboboxArrow = [
  {
    "description": "The size of the arrow.",
    "property": "size",
    "type": "number"
  }
];

export const ComboboxListbox = [
  {
    "description": "The ref attached to the scrollable element, used to provide automatic scrolling on item focus. If not provided, defaults to the listbox.",
    "property": "scrollRef",
    "type": "Accessor<HTMLElement | undefined>"
  },
  {
    "description": "When virtualized, the Virtualizer function used to scroll to the item of the given key.",
    "property": "scrollToItem",
    "type": "(key: string) => void"
  },
  {
    "description": "When virtualized, a map function that receives an items signal representing all items and sections.",
    "property": "children",
    "type": "(items: Accessor<Collection<CollectionNode<T | U>>>) => JSX.Element"
  }
];

export const ComboboxItem = [
  {
    "description": "The collection node to render.",
    "property": "item",
    "type": "CollectionNode"
  }
];

export const ComboboxItemIndicator = [
  {
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];