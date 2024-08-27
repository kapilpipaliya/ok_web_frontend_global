export const Pagination = [
  {
    "componentName": "number",
    "description": "The controlled page number of the pagination. (1-indexed)",
    "property": "page"
  },
  {
    "componentName": "string",
    "description": "The default page number when initially rendered. (1-indexed)",
    "property": "defaultPage"
  },
  {
    "componentName": "(page: number) => void",
    "description": "Event handler called when the page number changes.",
    "property": "onPageChange"
  },
  {
    "componentName": "number",
    "description": "The number of pages for the pagination.",
    "property": "count"
  },
  {
    "componentName": "number",
    "description": "The number of siblings to show around the current page item.",
    "property": "siblingCount"
  },
  {
    "componentName": "boolean",
    "description": "Whether to always show the first page item.",
    "property": "showFirst"
  },
  {
    "componentName": "boolean",
    "description": "Whether to always show the last page item.",
    "property": "showLast"
  },
  {
    "componentName": "boolean | \"no-ellipsis\"",
    "description": "Whether to always show the same number of items (to avoid content shift). Special value: \"no-ellipsis\" does not count the ellipsis as an item (used when ellipsis are disabled).",
    "property": "fixedItems"
  },
  {
    "componentName": "Component<{page: number}>",
    "description": "The component to render as an item in the Pagination.Items.",
    "property": "itemComponent"
  },
  {
    "componentName": "Component",
    "description": "The component to render as an ellipsis item in the Pagination.Items.",
    "property": "ellipsisComponent"
  },
  {
    "componentName": "boolean",
    "description": "Whether the pagination is disabled.",
    "property": "disabled"
  }
];

export const PaginationItem = [
  {
    "componentName": "number",
    "description": "The page number to render.",
    "property": "page"
  }
];