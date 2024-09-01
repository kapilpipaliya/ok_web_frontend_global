export const Pagination = [
  {
    "componentName": "number",
    "description": "The controlled page number of the pagination. (1-indexed)",
    "key": "page",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "string",
    "description": "The default page number when initially rendered. (1-indexed)",
    "key": "defaultPage",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "(page: number) => void",
    "description": "Event handler called when the page number changes.",
    "key": "onPageChange",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The number of pages for the pagination.",
    "key": "count",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "number",
    "description": "The number of siblings to show around the current page item.",
    "key": "siblingCount",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to always show the first page item.",
    "key": "showFirst",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether to always show the last page item.",
    "key": "showLast",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "boolean | \"no-ellipsis\"",
    "description": "Whether to always show the same number of items (to avoid content shift). Special value: \"no-ellipsis\" does not count the ellipsis as an item (used when ellipsis are disabled).",
    "key": "fixedItems",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "Component<{page: number}>",
    "description": "The component to render as an item in the Pagination.Items.",
    "key": "itemComponent",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "Component",
    "description": "The component to render as an ellipsis item in the Pagination.Items.",
    "key": "ellipsisComponent",
    "hashName": "pagination-1",
    "kobalte": true
  },
  {
    "componentName": "boolean",
    "description": "Whether the pagination is disabled.",
    "key": "disabled",
    "hashName": "pagination-1",
    "kobalte": true
  }
];

export const PaginationItem = [
  {
    "componentName": "number",
    "description": "The page number to render.",
    "key": "page",
    "hashName": "paginationitem",
    "kobalte": true
  }
];