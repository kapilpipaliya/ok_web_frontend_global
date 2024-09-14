export const Pagination = [
  {
    "componentName": "number",
    "description": "The controlled page number of the pagination. (1-indexed)",
    "hashName": "pagination-1",
    "key": "page",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The default page number when initially rendered. (1-indexed)",
    "hashName": "pagination-1",
    "key": "defaultPage",
    "kobalte": true
  },
  {
    "componentName": "(page: number) => void",
    "description": "Event handler called when the page number changes.",
    "hashName": "pagination-1",
    "key": "onPageChange",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The number of pages for the pagination.",
    "hashName": "pagination-1",
    "key": "count",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The number of siblings to show around the current page item.",
    "hashName": "pagination-1",
    "key": "siblingCount",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to always show the first page item.",
    "hashName": "pagination-1",
    "key": "showFirst",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to always show the last page item.",
    "hashName": "pagination-1",
    "key": "showLast",
    "kobalte": true
  },
  {
    "componentName": "boolean | \"no-ellipsis\"",
    "description": "Whether to always show the same number of items (to avoid content shift). Special value: \"no-ellipsis\" does not count the ellipsis as an item (used when ellipsis are disabled).",
    "hashName": "pagination-1",
    "key": "fixedItems",
    "kobalte": true
  },
  {
    "componentName": "Component<{page: number}>",
    "description": "The component to render as an item in the Pagination.Items.",
    "hashName": "pagination-1",
    "key": "itemComponent",
    "kobalte": true
  },
  {
    "componentName": "Component",
    "description": "The component to render as an ellipsis item in the Pagination.Items.",
    "hashName": "pagination-1",
    "key": "ellipsisComponent",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the pagination is disabled.",
    "hashName": "pagination-1",
    "key": "disabled",
    "kobalte": true
  }
];

export const PaginationItem = [
  {
    "componentName": "number",
    "description": "The page number to render.",
    "hashName": "paginationitem",
    "key": "page",
    "kobalte": true
  }
];