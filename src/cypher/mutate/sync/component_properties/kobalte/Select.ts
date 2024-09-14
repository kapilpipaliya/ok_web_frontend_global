export const Select = [
  {
    "componentName": "Array<T | U>",
    "description": "An array of options to display as the available options.",
    "hashName": "select-1",
    "key": "options",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string | number)",
    "description": "Property name or getter function to use as the value of an option. This is the value that will be submitted when the select is part of a <form>.",
    "hashName": "select-1",
    "key": "optionValue",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the text value of an option for typeahead purpose.",
    "hashName": "select-1",
    "key": "optionTextValue",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => boolean)",
    "description": "Property name or getter function to use as the disabled flag of an option.",
    "hashName": "select-1",
    "key": "optionDisabled",
    "kobalte": true
  },
  {
    "componentName": "keyof U",
    "description": "Property name that refers to the children options of an option group.",
    "hashName": "select-1",
    "key": "optionGroupChildren",
    "kobalte": true
  },
  {
    "componentName": "Component<SelectItemComponentProps<T>>",
    "description": "When NOT virtualized, the component to render as an item in the Select.Listbox.",
    "hashName": "select-1",
    "key": "itemComponent",
    "kobalte": true
  },
  {
    "componentName": "Component<SelectSectionComponentProps<U>>",
    "description": "When NOT virtualized, the component to render as a section in the Select.Listbox.",
    "hashName": "select-1",
    "key": "sectionComponent",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select allows multi-selection.",
    "hashName": "select-1",
    "key": "multiple",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element",
    "description": "The content that will be rendered when no value or defaultValue is set.",
    "hashName": "select-1",
    "key": "placeholder",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The controlled value of the select.",
    "hashName": "select-1",
    "key": "value",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The value of the select when initially rendered. Useful when you do not need to control the value.",
    "hashName": "select-1",
    "key": "defaultValue",
    "kobalte": true
  },
  {
    "componentName": "(value: T | Array<T>) => void",
    "description": "Event handler called when the value changes.",
    "hashName": "select-1",
    "key": "onChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The controlled open state of the select.",
    "hashName": "select-1",
    "key": "open",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "hashName": "select-1",
    "key": "defaultOpen",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the select changes.",
    "hashName": "select-1",
    "key": "onOpenChange",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether onChange should fire even if the new value is the same as the last.",
    "hashName": "select-1",
    "key": "allowDuplicateSelectionEvents",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select allows empty selection or not.",
    "hashName": "select-1",
    "key": "disallowEmptySelection",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select closes after selection.",
    "hashName": "select-1",
    "key": "closeOnSelection",
    "kobalte": true
  },
  {
    "componentName": "'toggle' | 'replace'",
    "description": "How selection should behave in the select.",
    "hashName": "select-1",
    "key": "selectionBehavior",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select uses virtual scrolling.",
    "hashName": "select-1",
    "key": "virtualized",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the select content.  - elements outside the select content will not be visible for screen readers.",
    "hashName": "select-1",
    "key": "modal",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the select is not modal.",
    "hashName": "select-1",
    "key": "preventScroll",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the select (portal, positioner and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "select-1",
    "key": "forceMount",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the select. Submitted with its owning form as part of a name/value pair.",
    "hashName": "select-1",
    "key": "name",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the select should display its \"valid\" or \"invalid\" visual styling.",
    "hashName": "select-1",
    "key": "validationState",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must select an item before the owning form can be submitted.",
    "hashName": "select-1",
    "key": "required",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select is disabled.",
    "hashName": "select-1",
    "key": "disabled",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select items can be selected but not changed by the user.",
    "hashName": "select-1",
    "key": "readOnly",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Describes the type of autocomplete functionality the input should provide if any. See MDN",
    "hashName": "select-1",
    "key": "autoComplete",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the select content.",
    "hashName": "select-1",
    "key": "placement",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the select content and the trigger element.",
    "hashName": "select-1",
    "key": "gutter",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the select content along the trigger element.",
    "hashName": "select-1",
    "key": "shift",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the select content when it overflows the viewport:  - If a boolean, specifies whether the select content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "hashName": "select-1",
    "key": "flip",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should slide when it overflows.",
    "hashName": "select-1",
    "key": "slide",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content can overlap the trigger element when it overflows.",
    "hashName": "select-1",
    "key": "overlap",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "hashName": "select-1",
    "key": "sameWidth",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should fit the viewport. If this is set to true, the select content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "hashName": "select-1",
    "key": "fitViewport",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the select content when the trigger element becomes occluded.",
    "hashName": "select-1",
    "key": "hideWhenDetached",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "hashName": "select-1",
    "key": "detachedPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the select content corner.",
    "hashName": "select-1",
    "key": "arrowPadding",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the select content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "hashName": "select-1",
    "key": "overflowPadding",
    "kobalte": true
  }
];

export const SelectValue = [
  {
    "componentName": "Accessor<T>",
    "description": "The first (or only, in case of single select) selected option.",
    "hashName": "selectvalue",
    "key": "selectedOption",
    "kobalte": true
  },
  {
    "componentName": "Accessor<T[]>",
    "description": "An array of selected options. It will contain only one value in case of single select.",
    "hashName": "selectvalue",
    "key": "selectedOptions",
    "kobalte": true
  },
  {
    "componentName": "(option: T) => void",
    "description": "A function to remove an option from the selection.",
    "hashName": "selectvalue",
    "key": "remove",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "A function to clear the selection.",
    "hashName": "selectvalue",
    "key": "clear",
    "kobalte": true
  }
];

export const SelectErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "selecterrormessage",
    "key": "forceMount",
    "kobalte": true
  }
];

export const SelectArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "hashName": "selectarrow",
    "key": "size",
    "kobalte": true
  }
];

export const SelectListbox = [
  {
    "componentName": "Accessor<HTMLElement | undefined>",
    "description": "The ref attached to the scrollable element, used to provide automatic scrolling on item focus. If not provided, defaults to the listbox.",
    "hashName": "selectlistbox",
    "key": "scrollRef",
    "kobalte": true
  },
  {
    "componentName": "(key: string) => void",
    "description": "When virtualized, the Virtualizer function used to scroll to the item of the given key.",
    "hashName": "selectlistbox",
    "key": "scrollToItem",
    "kobalte": true
  },
  {
    "componentName": "(items: Accessor<Collection<CollectionNode<T | U>>>) => JSX.Element",
    "description": "When virtualized, a map function that receives an items signal representing all items and sections.",
    "hashName": "selectlistbox",
    "key": "children",
    "kobalte": true
  }
];

export const SelectItem = [
  {
    "componentName": "CollectionNode",
    "description": "The collection node to render.",
    "hashName": "selectitem",
    "key": "item",
    "kobalte": true
  }
];

export const SelectItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "hashName": "selectitemindicator",
    "key": "forceMount",
    "kobalte": true
  }
];