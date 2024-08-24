export const Pagination = [
  {
    "description": "The controlled page number of the pagination. (1-indexed)",
    "property": "page",
    "type": "number"
  },
  {
    "description": "The default page number when initially rendered. (1-indexed)",
    "property": "defaultPage",
    "type": "string"
  },
  {
    "description": "Event handler called when the page number changes.",
    "property": "onPageChange",
    "type": "(page: number) => void"
  },
  {
    "description": "The number of pages for the pagination.",
    "property": "count",
    "type": "number"
  },
  {
    "description": "The number of siblings to show around the current page item.",
    "property": "siblingCount",
    "type": "number"
  },
  {
    "description": "Whether to always show the first page item.",
    "property": "showFirst",
    "type": "boolean"
  },
  {
    "description": "Whether to always show the last page item.",
    "property": "showLast",
    "type": "boolean"
  },
  {
    "description": "Whether to always show the same number of items (to avoid content shift). Special value: \"no-ellipsis\" does not count the ellipsis as an item (used when ellipsis are disabled).",
    "property": "fixedItems",
    "type": "boolean | \"no-ellipsis\""
  },
  {
    "description": "The component to render as an item in the Pagination.Items.",
    "property": "itemComponent",
    "type": "Component<{page: number}>"
  },
  {
    "description": "The component to render as an ellipsis item in the Pagination.Items.",
    "property": "ellipsisComponent",
    "type": "Component"
  },
  {
    "description": "Whether the pagination is disabled.",
    "property": "disabled",
    "type": "boolean"
  }
];

export const PaginationItem = [
  {
    "description": "The page number to render.",
    "property": "page",
    "type": "number"
  }
];