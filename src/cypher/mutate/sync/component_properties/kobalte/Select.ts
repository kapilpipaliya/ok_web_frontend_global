export const Select = [
  {
    "componentName": "Array<T | U>",
    "description": "An array of options to display as the available options.",
    "name": "options",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string | number)",
    "description": "Property name or getter function to use as the value of an option. This is the value that will be submitted when the select is part of a <form>.",
    "name": "optionValue",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the text value of an option for typeahead purpose.",
    "name": "optionTextValue",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "keyof T | ((option: T) => boolean)",
    "description": "Property name or getter function to use as the disabled flag of an option.",
    "name": "optionDisabled",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "keyof U",
    "description": "Property name that refers to the children options of an option group.",
    "name": "optionGroupChildren",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "Component<SelectItemComponentProps<T>>",
    "description": "When NOT virtualized, the component to render as an item in the Select.Listbox.",
    "name": "itemComponent",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "Component<SelectSectionComponentProps<U>>",
    "description": "When NOT virtualized, the component to render as a section in the Select.Listbox.",
    "name": "sectionComponent",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select allows multi-selection.",
    "name": "multiple",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "JSX.Element",
    "description": "The content that will be rendered when no value or defaultValue is set.",
    "name": "placeholder",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The controlled value of the select.",
    "name": "value",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "T | Array<T>",
    "description": "The value of the select when initially rendered. Useful when you do not need to control the value.",
    "name": "defaultValue",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "(value: T | Array<T>) => void",
    "description": "Event handler called when the value changes.",
    "name": "onChange",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The controlled open state of the select.",
    "name": "open",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "name": "defaultOpen",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the select changes.",
    "name": "onOpenChange",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether onChange should fire even if the new value is the same as the last.",
    "name": "allowDuplicateSelectionEvents",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select allows empty selection or not.",
    "name": "disallowEmptySelection",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select closes after selection.",
    "name": "closeOnSelection",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "'toggle' | 'replace'",
    "description": "How selection should behave in the select.",
    "name": "selectionBehavior",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select uses virtual scrolling.",
    "name": "virtualized",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the select content.  - elements outside the select content will not be visible for screen readers.",
    "name": "modal",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the select is not modal.",
    "name": "preventScroll",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the select (portal, positioner and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The name of the select. Submitted with its owning form as part of a name/value pair.",
    "name": "name",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the select should display its \"valid\" or \"invalid\" visual styling.",
    "name": "validationState",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must select an item before the owning form can be submitted.",
    "name": "required",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select is disabled.",
    "name": "disabled",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select items can be selected but not changed by the user.",
    "name": "readOnly",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "Describes the type of autocomplete functionality the input should provide if any. See MDN",
    "name": "autoComplete",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "Placement",
    "description": "The placement of the select content.",
    "name": "placement",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The distance between the select content and the trigger element.",
    "name": "gutter",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The skidding of the select content along the trigger element.",
    "name": "shift",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the select content when it overflows the viewport:  - If a boolean, specifies whether the select content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "name": "flip",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should slide when it overflows.",
    "name": "slide",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content can overlap the trigger element when it overflows.",
    "name": "overlap",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "name": "sameWidth",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should fit the viewport. If this is set to true, the select content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "name": "fitViewport",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the select content when the trigger element becomes occluded.",
    "name": "hideWhenDetached",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "name": "detachedPadding",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the select content corner.",
    "name": "arrowPadding",
    "hashName": "select-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the select content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "name": "overflowPadding",
    "hashName": "select-1",
    "kobalte": true
  }
];

export const SelectValue = [
  {
    "componentName": "Accessor<T>",
    "description": "The first (or only, in case of single select) selected option.",
    "name": "selectedOption",
    "hashName": "selectvalue",
    "kobalte": true
  },
  {
    "componentName": "Accessor<T[]>",
    "description": "An array of selected options. It will contain only one value in case of single select.",
    "name": "selectedOptions",
    "hashName": "selectvalue",
    "kobalte": true
  },
  {
    "componentName": "(option: T) => void",
    "description": "A function to remove an option from the selection.",
    "name": "remove",
    "hashName": "selectvalue",
    "kobalte": true
  },
  {
    "componentName": "() => void",
    "description": "A function to clear the selection.",
    "name": "clear",
    "hashName": "selectvalue",
    "kobalte": true
  }
];

export const SelectErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "selecterrormessage",
    "kobalte": true
  }
];

export const SelectArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "name": "size",
    "hashName": "selectarrow",
    "kobalte": true
  }
];

export const SelectListbox = [
  {
    "componentName": "Accessor<HTMLElement | undefined>",
    "description": "The ref attached to the scrollable element, used to provide automatic scrolling on item focus. If not provided, defaults to the listbox.",
    "name": "scrollRef",
    "hashName": "selectlistbox",
    "kobalte": true
  },
  {
    "componentName": "(key: string) => void",
    "description": "When virtualized, the Virtualizer function used to scroll to the item of the given key.",
    "name": "scrollToItem",
    "hashName": "selectlistbox",
    "kobalte": true
  },
  {
    "componentName": "(items: Accessor<Collection<CollectionNode<T | U>>>) => JSX.Element",
    "description": "When virtualized, a map function that receives an items signal representing all items and sections.",
    "name": "children",
    "hashName": "selectlistbox",
    "kobalte": true
  }
];

export const SelectItem = [
  {
    "componentName": "CollectionNode",
    "description": "The collection node to render.",
    "name": "item",
    "hashName": "selectitem",
    "kobalte": true
  }
];

export const SelectItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "name": "forceMount",
    "hashName": "selectitemindicator",
    "kobalte": true
  }
];