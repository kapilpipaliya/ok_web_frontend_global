export const Select = [
  {
    "componentName": "Array<T | U>",
    "description": "An array of options to display as the available options.",
    "key": "options",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string | number)",
    "description": "Property name or getter function to use as the value of an option. This is the value that will be submitted when the select is part of a <form>.",
    "key": "optionValue",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the text value of an option for typeahead purpose.",
    "key": "optionTextValue",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => boolean)",
    "description": "Property name or getter function to use as the disabled flag of an option.",
    "key": "optionDisabled",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "keyof U",
    "description": "Property name that refers to the children options of an option group.",
    "key": "optionGroupChildren",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "Component<SelectItemComponentProps<T>>",
    "description": "When NOT virtualized, the component to render as an item in the Select.Listbox.",
    "key": "itemComponent",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "Component<SelectSectionComponentProps<U>>",
    "description": "When NOT virtualized, the component to render as a section in the Select.Listbox.",
    "key": "sectionComponent",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select allows multi-selection.",
    "key": "multiple",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element",
    "description": "The content that will be rendered when no value or defaultValue is set.",
    "key": "placeholder",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The controlled value of the select.",
    "key": "value",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The value of the select when initially rendered. Useful when you do not need to control the value.",
    "key": "defaultValue",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "(value: T | Array<T>) => void",
    "description": "Event handler called when the value changes.",
    "key": "onChange",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The controlled open state of the select.",
    "key": "open",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "key": "defaultOpen",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the select changes.",
    "key": "onOpenChange",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether onChange should fire even if the new value is the same as the last.",
    "key": "allowDuplicateSelectionEvents",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select allows empty selection or not.",
    "key": "disallowEmptySelection",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select closes after selection.",
    "key": "closeOnSelection",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "'toggle' | 'replace'",
    "description": "How selection should behave in the select.",
    "key": "selectionBehavior",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select uses virtual scrolling.",
    "key": "virtualized",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the select content.  - elements outside the select content will not be visible for screen readers.",
    "key": "modal",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the select is not modal.",
    "key": "preventScroll",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the select (portal, positioner and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the select. Submitted with its owning form as part of a name/value pair.",
    "key": "name",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the select should display its \"valid\" or \"invalid\" visual styling.",
    "key": "validationState",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must select an item before the owning form can be submitted.",
    "key": "required",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select is disabled.",
    "key": "disabled",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select items can be selected but not changed by the user.",
    "key": "readOnly",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Describes the type of autocomplete functionality the input should provide if any. See MDN",
    "key": "autoComplete",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the select content.",
    "key": "placement",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the select content and the trigger element.",
    "key": "gutter",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the select content along the trigger element.",
    "key": "shift",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the select content when it overflows the viewport:  - If a boolean, specifies whether the select content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "key": "flip",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should slide when it overflows.",
    "key": "slide",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content can overlap the trigger element when it overflows.",
    "key": "overlap",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "key": "sameWidth",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should fit the viewport. If this is set to true, the select content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "key": "fitViewport",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the select content when the trigger element becomes occluded.",
    "key": "hideWhenDetached",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "key": "detachedPadding",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the select content corner.",
    "key": "arrowPadding",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the select content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "key": "overflowPadding",
    "hashName": "select-1",
    "kobalte": true
  }
];

export const SelectValue = [
  {
    "componentName": "Accessor<T>",
    "description": "The first (or only, in case of single select) selected option.",
    "key": "selectedOption",
    "hashName": "selectvalue",
    "kobalte": true
  },
  {
    "componentName": "Accessor<T[]>",
    "description": "An array of selected options. It will contain only one value in case of single select.",
    "key": "selectedOptions",
    "hashName": "selectvalue",
    "kobalte": true
  },
  {
    "componentName": "(option: T) => void",
    "description": "A function to remove an option from the selection.",
    "key": "remove",
    "hashName": "selectvalue",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "A function to clear the selection.",
    "key": "clear",
    "hashName": "selectvalue",
    "kobalte": true
  }
];

export const SelectErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "selecterrormessage",
    "kobalte": true
  }
];

export const SelectArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "key": "size",
    "hashName": "selectarrow",
    "kobalte": true
  }
];

export const SelectListbox = [
  {
    "componentName": "Accessor<HTMLElement | undefined>",
    "description": "The ref attached to the scrollable element, used to provide automatic scrolling on item focus. If not provided, defaults to the listbox.",
    "key": "scrollRef",
    "hashName": "selectlistbox",
    "kobalte": true
  },
  {
    "componentName": "(key: string) => void",
    "description": "When virtualized, the Virtualizer function used to scroll to the item of the given key.",
    "key": "scrollToItem",
    "hashName": "selectlistbox",
    "kobalte": true
  },
  {
    "componentName": "(items: Accessor<Collection<CollectionNode<T | U>>>) => JSX.Element",
    "description": "When virtualized, a map function that receives an items signal representing all items and sections.",
    "key": "children",
    "hashName": "selectlistbox",
    "kobalte": true
  }
];

export const SelectItem = [
  {
    "componentName": "CollectionNode",
    "description": "The collection node to render.",
    "key": "item",
    "hashName": "selectitem",
    "kobalte": true
  }
];

export const SelectItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "key": "forceMount",
    "hashName": "selectitemindicator",
    "kobalte": true
  }
];