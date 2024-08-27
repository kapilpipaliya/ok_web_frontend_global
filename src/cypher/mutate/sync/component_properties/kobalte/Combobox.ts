export const Combobox = [
  {
    "componentName": "\"startsWith\" | \"endsWith\" | \"contains\" | ((option: Option, inputValue: string) => boolean)",
    "description": "The filter function used to determine if an option should be included in the combo box list.",
    "property": "defaultFilter"
  },
  {
    "componentName": "Array<T | U>",
    "description": "An array of options to display as the available options.",
    "property": "options"
  },
  {
    "componentName": "keyof T | ((option: T) => string | number)",
    "description": "Property name or getter function to use as the value of an option. This is the value that will be submitted when the combobox is part of a <form>.",
    "property": "optionValue"
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the text value of an option for typeahead purpose.",
    "property": "optionTextValue"
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the label of an option. This is the string representation of the option to display in the Combobox.Input.",
    "property": "optionLabel"
  },
  {
    "componentName": "keyof T | ((option: T) => boolean)",
    "description": "Property name or getter function to use as the disabled flag of an option.",
    "property": "optionDisabled"
  },
  {
    "componentName": "keyof U",
    "description": "Property name that refers to the children options of an option group.",
    "property": "optionGroupChildren"
  },
  {
    "componentName": "Component<ComboboxItemComponentProps<T>>",
    "description": "When NOT virtualized, the component to render as an item in the Combobox.Listbox.",
    "property": "itemComponent"
  },
  {
    "componentName": "Component<ComboboxSectionComponentProps<U>>",
    "description": "When NOT virtualized, the component to render as a section in the Combobox.Listbox.",
    "property": "sectionComponent"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox allows multi-selection.",
    "property": "multiple"
  },
  {
    "componentName": "JSX.Element",
    "description": "The content that will be rendered when no value or defaultValue is set.",
    "property": "placeholder"
  },
  {
    "componentName": "T | Array<T>",
    "description": "The controlled value of the combobox.",
    "property": "value"
  },
  {
    "componentName": "T | Array<T>",
    "description": "The value of the combobox when initially rendered. Useful when you do not need to control the value.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: T | Array<T>) => void",
    "description": "Event handler called when the value changes.",
    "property": "onChange"
  },
  {
    "componentName": "boolean",
    "description": "The controlled open state of the combobox.",
    "property": "open"
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen"
  },
  {
    "componentName": "(open: boolean, triggerMode?: ComboboxTriggerMode) => void",
    "description": "Event handler called when the open state of the combobox changes. Returns the new open state and the action that caused the opening of the menu.",
    "property": "onOpenChange"
  },
  {
    "componentName": "(value: string) => void",
    "description": "Handler that is called when the combobox input value changes.",
    "property": "onInputChange"
  },
  {
    "componentName": "ComboboxTriggerMode",
    "description": "The interaction required to display the combobox menu, it can be one of the following:  - input: open the combobox menu when the user is typing.  - focus: open the combobox menu when the input is focused.  - manual: open the combobox menu when pressing arrow down/up while focus is on the input or clicking on the trigger.",
    "property": "triggerMode"
  },
  {
    "componentName": "boolean",
    "description": "When multiple is true, whether the last selected option should be removed when the user press the Backspace key and the input is empty.",
    "property": "removeOnBackspace"
  },
  {
    "componentName": "boolean",
    "description": "Whether onChange should fire even if the new value is the same as the last.",
    "property": "allowDuplicateSelectionEvents"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox allows empty selection or not.",
    "property": "disallowEmptySelection"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox closes after selection.",
    "property": "closeOnSelection"
  },
  {
    "componentName": "'toggle' | 'replace'",
    "description": "How selection should behave in the combobox.",
    "property": "selectionBehavior"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox uses virtual scrolling.",
    "property": "virtualized"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the combobox content.  - elements outside the combobox content will not be visible for screen readers.",
    "property": "modal"
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the combobox is not modal.",
    "property": "preventScroll"
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the combobox (portal, positioner and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  },
  {
    "componentName": "string",
    "description": "The name of the combobox. Submitted with its owning form as part of a name/value pair.",
    "property": "name"
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the combobox should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState"
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must select an item before the owning form can be submitted.",
    "property": "required"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox items can be selected but not changed by the user.",
    "property": "readOnly"
  },
  {
    "componentName": "string",
    "description": "Describes the type of autocomplete functionality the input should provide if any. See MDN",
    "property": "autoComplete"
  },
  {
    "componentName": "ComboboxIntlTranslations",
    "description": "Localization strings.",
    "property": "translations"
  },
  {
    "componentName": "Placement",
    "description": "The placement of the combobox content.",
    "property": "placement"
  },
  {
    "componentName": "number",
    "description": "The distance between the combobox content and the trigger element.",
    "property": "gutter"
  },
  {
    "componentName": "number",
    "description": "The skidding of the combobox content along the trigger element.",
    "property": "shift"
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the combobox content when it overflows the viewport:  - If a boolean, specifies whether the combobox content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "property": "flip"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should slide when it overflows.",
    "property": "slide"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content can overlap the trigger element when it overflows.",
    "property": "overlap"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "property": "sameWidth"
  },
  {
    "componentName": "boolean",
    "description": "Whether the combobox content should fit the viewport. If this is set to true, the combobox content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport"
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the combobox content when the trigger element becomes occluded.",
    "property": "hideWhenDetached"
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "property": "detachedPadding"
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the combobox content corner.",
    "property": "arrowPadding"
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the combobox content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding"
  }
];

export const ComboboxControl = [
  {
    "componentName": "Accessor<T[]>",
    "description": "An array of selected options.",
    "property": "selectedOptions"
  },
  {
    "componentName": "(option: T) => void",
    "description": "A function to remove an option from the selection.",
    "property": "remove"
  },
  {
    "componentName": "() => void",
    "description": "A function to clear the selection.",
    "property": "clear"
  }
];

export const ComboboxErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];

export const ComboboxArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "property": "size"
  }
];

export const ComboboxListbox = [
  {
    "componentName": "Accessor<HTMLElement | undefined>",
    "description": "The ref attached to the scrollable element, used to provide automatic scrolling on item focus. If not provided, defaults to the listbox.",
    "property": "scrollRef"
  },
  {
    "componentName": "(key: string) => void",
    "description": "When virtualized, the Virtualizer function used to scroll to the item of the given key.",
    "property": "scrollToItem"
  },
  {
    "componentName": "(items: Accessor<Collection<CollectionNode<T | U>>>) => JSX.Element",
    "description": "When virtualized, a map function that receives an items signal representing all items and sections.",
    "property": "children"
  }
];

export const ComboboxItem = [
  {
    "componentName": "CollectionNode",
    "description": "The collection node to render.",
    "property": "item"
  }
];

export const ComboboxItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];