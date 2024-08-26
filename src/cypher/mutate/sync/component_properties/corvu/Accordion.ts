export const Accordion = [
  {
    "default": "false",
    "description": "Whether multiple accordion items can be expanded at the same time.",
    "property": "multiple",
    "type": "boolean"
  },
  {
    "default": "-",
    "description": "The value of the accordion.",
    "property": "value",
    "type": "string | string[] | null"
  },
  {
    "default": "-",
    "description": "Callback fired when the value changes.",
    "property": "onValueChange",
    "type": "(value: string | string[] | null) => void"
  },
  {
    "default": "null",
    "description": "The value of the accordion initially.",
    "property": "initialValue",
    "type": "string | string[] | null"
  },
  {
    "default": "true",
    "description": "Whether the accordion can be fully collapsed.",
    "property": "collapsible",
    "type": "boolean"
  },
  {
    "default": "false",
    "description": "Whether the accordion is disabled.",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "default": "vertical",
    "description": "The orientation of the accordion.",
    "property": "orientation",
    "type": "'vertical' | 'horizontal'"
  },
  {
    "default": "true",
    "description": "Whether the accordion should loop when navigating with the keyboard.",
    "property": "loop",
    "type": "boolean"
  },
  {
    "default": "ltr",
    "description": "The text direction of the accordion.",
    "property": "textDirection",
    "type": "'ltr' | 'rtl'"
  },
  {
    "default": "remove",
    "description": "Whether the accordion content should be removed or hidden when collapsed. Useful if you want to always render the content for SEO reasons.",
    "property": "collapseBehavior",
    "type": "'remove' | 'hide'"
  },
  {
    "default": "-",
    "description": "The id of the accordion context. Useful if you have nested accordions and want to create components that belong to a accordion higher up in the tree.",
    "property": "contextId",
    "type": "string"
  }
];

export const AccordionItem = [
  {
    "default": "createUniqueId()",
    "description": "Value of the accordion item.",
    "property": "value",
    "type": "string"
  },
  {
    "default": "-",
    "description": "Whether the accordion item is disabled. Used to override the default provided by .",
    "property": "disabled",
    "type": "boolean"
  },
  {
    "default": "createUniqueId()",
    "description": "The id attribute of the accordion item trigger element.",
    "property": "triggerId",
    "type": "string"
  },
  {
    "default": "Fragment",
    "description": "Component to render the dynamic component as.",
    "property": "as",
    "type": "ValidComponent"
  }
];