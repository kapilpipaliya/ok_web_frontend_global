export const Accordion = [
  {
    "description": "The controlled value of the accordion item(s) to expand.",
    "property": "value",
    "type": "string[]"
  },
  {
    "description": "The value of the accordion item(s) to expand when initially rendered. Useful when you do not need to control the state.",
    "property": "defaultValue",
    "type": "string[]"
  },
  {
    "description": "Event handler called when the value changes.",
    "property": "onChange",
    "type": "(value: string[]) => void"
  },
  {
    "description": "Whether multiple items can be opened at the same time.",
    "property": "multiple",
    "type": "boolean"
  },
  {
    "description": "When multiple is false, allows closing content when clicking trigger for an open item.",
    "property": "collapsible",
    "type": "boolean"
  },
  {
    "description": "Whether focus should wrap around when the end/start is reached.",
    "property": "shouldFocusWrap",
    "type": "boolean"
  }
];

export const AccordionItem = [
  {
    "description": "A unique value for the item.",
    "property": "value",
    "type": "string"
  },
  {
    "description": "Whether the item is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "description": "Used to force mounting the item content when more control is needed. Useful when controlling animation with SolidJS animation libraries.",
    "property": "forceMount",
    "type": "boolean"
  }
];