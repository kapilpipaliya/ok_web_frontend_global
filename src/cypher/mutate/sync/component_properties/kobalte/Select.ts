export const Select = [
  {
    "componentName": "Array<T | U>",
    "description": "An array of options to display as the available options.",
    "property": "options"
  },
  {
    "componentName": "keyof T | ((option: T) => string | number)",
    "description": "Property name or getter function to use as the value of an option. This is the value that will be submitted when the select is part of a <form>.",
    "property": "optionValue"
  },
  {
    "componentName": "keyof T | ((option: T) => string)",
    "description": "Property name or getter function to use as the text value of an option for typeahead purpose.",
    "property": "optionTextValue"
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
    "componentName": "Component<SelectItemComponentProps<T>>",
    "description": "When NOT virtualized, the component to render as an item in the Select.Listbox.",
    "property": "itemComponent"
  },
  {
    "componentName": "Component<SelectSectionComponentProps<U>>",
    "description": "When NOT virtualized, the component to render as a section in the Select.Listbox.",
    "property": "sectionComponent"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select allows multi-selection.",
    "property": "multiple"
  },
  {
    "componentName": "JSX.Element",
    "description": "The content that will be rendered when no value or defaultValue is set.",
    "property": "placeholder"
  },
  {
    "componentName": "T | Array<T>",
    "description": "The controlled value of the select.",
    "property": "value"
  },
  {
    "componentName": "T | Array<T>",
    "description": "The value of the select when initially rendered. Useful when you do not need to control the value.",
    "property": "defaultValue"
  },
  {
    "componentName": "(value: T | Array<T>) => void",
    "description": "Event handler called when the value changes.",
    "property": "onChange"
  },
  {
    "componentName": "boolean",
    "description": "The controlled open state of the select.",
    "property": "open"
  },
  {
    "componentName": "boolean",
    "description": "The default open state when initially rendered. Useful when you do not need to control the open state.",
    "property": "defaultOpen"
  },
  {
    "componentName": "(open: boolean) => void",
    "description": "Event handler called when the open state of the select changes.",
    "property": "onOpenChange"
  },
  {
    "componentName": "boolean",
    "description": "Whether onChange should fire even if the new value is the same as the last.",
    "property": "allowDuplicateSelectionEvents"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select allows empty selection or not.",
    "property": "disallowEmptySelection"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select closes after selection.",
    "property": "closeOnSelection"
  },
  {
    "componentName": "'toggle' | 'replace'",
    "description": "How selection should behave in the select.",
    "property": "selectionBehavior"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select uses virtual scrolling.",
    "property": "virtualized"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select should be the only visible content for screen readers, when set to true:  - interaction with outside elements will be disabled.  - scroll will be locked.  - focus will be locked inside the select content.  - elements outside the select content will not be visible for screen readers.",
    "property": "modal"
  },
  {
    "componentName": "boolean",
    "description": "Whether the scroll should be locked even if the select is not modal.",
    "property": "preventScroll"
  },
  {
    "componentName": "boolean",
    "description": "Used to force mounting the select (portal, positioner and content) when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  },
  {
    "componentName": "string",
    "description": "The name of the select. Submitted with its owning form as part of a name/value pair.",
    "property": "name"
  },
  {
    "componentName": "'valid' | 'invalid'",
    "description": "Whether the select should display its \"valid\" or \"invalid\" visual styling.",
    "property": "validationState"
  },
  {
    "componentName": "boolean",
    "description": "Whether the user must select an item before the owning form can be submitted.",
    "property": "required"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select is disabled.",
    "property": "disabled"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select items can be selected but not changed by the user.",
    "property": "readOnly"
  },
  {
    "componentName": "string",
    "description": "Describes the type of autocomplete functionality the input should provide if any. See MDN",
    "property": "autoComplete"
  },
  {
    "componentName": "Placement",
    "description": "The placement of the select content.",
    "property": "placement"
  },
  {
    "componentName": "number",
    "description": "The distance between the select content and the trigger element.",
    "property": "gutter"
  },
  {
    "componentName": "number",
    "description": "The skidding of the select content along the trigger element.",
    "property": "shift"
  },
  {
    "componentName": "boolean | string",
    "description": "Controls the behavior of the select content when it overflows the viewport:  - If a boolean, specifies whether the select content should flip to the opposite side when it overflows. - If a string, indicates the preferred fallback placements when it overflows.The placements must be spaced-delimited, e.g. \"top left\".",
    "property": "flip"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should slide when it overflows.",
    "property": "slide"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content can overlap the trigger element when it overflows.",
    "property": "overlap"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should have the same width as the trigger element. This will be exposed to CSS as --kb-popper-anchor-width.",
    "property": "sameWidth"
  },
  {
    "componentName": "boolean",
    "description": "Whether the select content should fit the viewport. If this is set to true, the select content will have maxWidth and maxHeight set to the viewport size. This will be exposed to CSS as --kb-popper-available-width and --kb-popper-available-height.",
    "property": "fitViewport"
  },
  {
    "componentName": "boolean",
    "description": "Whether to hide the select content when the trigger element becomes occluded.",
    "property": "hideWhenDetached"
  },
  {
    "componentName": "number",
    "description": "The minimum padding in order to consider the trigger element occluded.",
    "property": "detachedPadding"
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the arrow and the select content corner.",
    "property": "arrowPadding"
  },
  {
    "componentName": "number",
    "description": "The minimum padding between the select content and the viewport edge. This will be exposed to CSS as --kb-popper-overflow-padding.",
    "property": "overflowPadding"
  }
];

export const SelectValue = [
  {
    "componentName": "Accessor<T>",
    "description": "The first (or only, in case of single select) selected option.",
    "property": "selectedOption"
  },
  {
    "componentName": "Accessor<T[]>",
    "description": "An array of selected options. It will contain only one value in case of single select.",
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

export const SelectErrorMessage = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];

export const SelectArrow = [
  {
    "componentName": "number",
    "description": "The size of the arrow.",
    "property": "size"
  }
];

export const SelectListbox = [
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

export const SelectItem = [
  {
    "componentName": "CollectionNode",
    "description": "The collection node to render.",
    "property": "item"
  }
];

export const SelectItemIndicator = [
  {
    "componentName": "boolean",
    "description": "Used to force mounting when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount"
  }
];