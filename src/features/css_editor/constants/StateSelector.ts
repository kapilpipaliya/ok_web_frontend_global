/* eslint-disable perfectionist/sort-objects */

type CssSelector =
  | {
      children: CssSelector[];
      title: string;
    }
  | {
      children?: CssSelector[];
      description: string;
      selector: string;
      title: string;
    };

export const cssSelectorTree: CssSelector[] = [
  /*    {
      title: "Basic Usage",
      selector: "basic-usage",
      children: [
        {
          title: "Universal Selector",
          selector: "*",
          description: "Selects all elements"
        },
        {
          title: "Class Selector",
          selector: ".class",
          description: "Selects all elements that have the given class attribute"
        },
        {
          title: "ID Selector",
          selector: "#id",
          description: "Selects an element based on the value of its id attribute"
        },
        {
          title: "Attribute Selector",
          children: [
            {
              title: "Elements with a value attribute",
              selector: "[value]",
              description: "Elements with a value attribute"
            },
            {
              title: "Elements with an attr matching value",
              selector: "[attr=value]",
              description: "Elements with an attr matching value"
            },
            {
              title: "Elements whose class attribute contains value",
              selector: "[attr~=value]",
              description: "Elements whose class attribute contains value"
            },
            {
              title: "Elements with an attr matching value or value-",
              selector: "[attr|=value]",
              description: "Elements with an attr matching value or value-"
            },
            {
              title: "Elements with an attr prefixed value",
              selector: "[attr^=value]",
              description: "Elements with an attr prefixed value"
            },
            {
              title: "Elements with an attr ending value",
              selector: "[attr$=value]",
              description: "Elements with an attr ending value"
            },
            {
              title: "Elements with an attr containing value",
              selector: "[attr*=value]",
              description: "Elements with an attr containing value"
            }
          ]
        }
      ]
    },
    {
      title: "Combinators",
      selector: "combinators",
      children: [
        {
          title: "Descendant Combinator",
          selector: "ancestor descendant",
          description: "Selects nodes that are descendants of the first element"
        },
        {
          title: "Child Combinator",
          selector: "parent > child",
          description: "Selects nodes that are direct children of the first element"
        },
        {
          title: "General Sibling Combinator",
          selector: "element ~ sibling",
          description: "Selects siblings that share the same parent"
        },
        {
          title: "Adjacent Sibling Combinator",
          selector: "element + adjacent",
          description: "Matches the second element only if it immediately follows the first element"
        }
      ]
    },*/
  {
    title: "Pseudo-classes",
    selector: "pseudo-classes",
    children: [
      {
        title: ":lang()",
        selector: ":lang(language)",
        description: "Select an element based on its content language",
      },
      {
        title: ":any-link",
        selector: ":any-link",
        description: "Matches all elements that match either :link or :visited",
      },
      {
        title: ":link",
        selector: ":link",
        description: "Matches links that have not yet been visited",
      },
      {
        title: ":visited",
        selector: ":visited",
        description: "Matches links that have been visited",
      },
      {
        title: ":target",
        selector: ":target",
        description:
          "Matches the element which is the target of the document URL",
      },
      {
        title: ":scope",
        selector: ":scope",
        description:
          "Represents elements that are a reference point for selectors to match against",
      },
      {
        title: ":hover",
        selector: ":hover",
        description:
          "Matches when a user designates an item with a pointing device",
      },
      {
        title: ":active",
        selector: ":active",
        description: "Matches when an item is being activated by the user",
      },
      {
        title: ":focus",
        selector: ":focus",
        description: "Matches when an element has focus",
      },
      {
        title: ":focus-visible",
        selector: ":focus-visible",
        description:
          "Matches when an element has focus and the user agent identifies that the element should be visibly focused",
      },
      {
        title: ":focus-within",
        selector: ":focus-within",
        description:
          "Matches an element to which :focus applies, plus any element that has a descendant to which :focus applies",
      },
      {
        title: ":autofill",
        selector: ":autofill",
        description:
          "Matches when an <input> has been autofilled by the browser",
      },
      {
        title: ":enabled",
        selector: ":enabled",
        description:
          "Represents a user interface element that is in an enabled state",
      },
      {
        title: ":disabled",
        selector: ":disabled",
        description:
          "Represents a user interface element that is in a disabled state",
      },
      {
        title: ":read-only",
        selector: ":read-only",
        description:
          "Represents any element that cannot be changed by the user",
      },
      {
        title: ":read-write",
        selector: ":read-write",
        description: "Represents any element that is user-editable",
      },
      {
        title: ":placeholder-shown",
        selector: ":placeholder-shown",
        description:
          "Matches an input element that is displaying placeholder text",
      },
      {
        title: ":default",
        selector: ":default",
        description:
          "Matches one or more UI elements that are the default among a set of elements",
      },
      {
        title: ":checked",
        selector: ":checked",
        description:
          "Matches when elements such as checkboxes and radio buttons are toggled on",
      },
      {
        title: ":indeterminate",
        selector: ":indeterminate",
        description: "Matches when UI elements are in an indeterminate state",
      },
      {
        title: ":valid",
        selector: ":valid",
        description: "Matches an element with valid contents",
      },
      {
        title: ":invalid",
        selector: ":invalid",
        description: "Matches an element with invalid contents",
      },
      {
        title: ":in-range",
        selector: ":in-range",
        description:
          "Applies to elements with range limitations when the selected value is in the allowed range",
      },
      {
        title: ":out-of-range",
        selector: ":out-of-range",
        description:
          "Applies to elements with range limitations when the selected value is outside the allowed range",
      },
      {
        title: ":required",
        selector: ":required",
        description: "Matches when a form element is required",
      },
      {
        title: ":optional",
        selector: ":optional",
        description: "Matches when a form element is optional",
      },
      {
        title: ":root",
        selector: ":root",
        description: "Represents an element that is the root of the document",
      },
      {
        title: ":empty",
        selector: ":empty",
        description:
          "Represents an element with no children other than white-space characters",
      },
      {
        title: ":nth-child()",
        selector: ":nth-child(An+B)",
        description:
          "Uses An+B notation to select elements from a list of sibling elements",
      },
      {
        title: ":nth-last-child()",
        selector: ":nth-last-child(An+B)",
        description:
          "Uses An+B notation to select elements from a list of sibling elements, counting backwards from the end of the list",
      },
      {
        title: ":first-child",
        selector: ":first-child",
        description: "Matches an element that is the first of its siblings",
      },
      {
        title: ":last-child",
        selector: ":last-child",
        description: "Matches an element that is the last of its siblings",
      },
      {
        title: ":only-child",
        selector: ":only-child",
        description: "Matches an element that has no siblings",
      },
      {
        title: ":nth-of-type()",
        selector: ":nth-of-type(An+B)",
        description:
          "Uses An+B notation to select elements from a list of sibling elements that match a certain type",
      },
      {
        title: ":nth-last-of-type()",
        selector: ":nth-last-of-type(An+B)",
        description:
          "Uses An+B notation to select elements from a list of sibling elements that match a certain type, counting backwards from the end of the list",
      },
      {
        title: ":first-of-type",
        selector: ":first-of-type",
        description:
          "Matches an element that is the first of its siblings of the chosen type",
      },
      {
        title: ":last-of-type",
        selector: ":last-of-type",
        description:
          "Matches an element that is the last of its siblings of the chosen type",
      },
      {
        title: ":only-of-type",
        selector: ":only-of-type",
        description:
          "Matches an element that has no siblings of the chosen type",
      },
      {
        title: ":defined",
        selector: ":defined",
        description: "Represents any element that has been defined",
      },
      {
        title: ":first",
        selector: ":first",
        description: "Represents the first page of a printed document",
      },
      {
        title: ":fullscreen",
        selector: ":fullscreen",
        description:
          "Matches every element which is currently in full-screen mode",
      },
      {
        title: ":host()",
        selector: ":host()",
        description:
          "Allows you to select a custom element from inside its shadow DOM",
      },
      {
        title: ":host-context()",
        selector: ":host-context()",
        description:
          "Selects the shadow host of the shadow DOM containing the CSS it is used inside",
      },
      {
        title: ":is()",
        selector: ":is()",
        description:
          "Selects any element that can be selected by one of the selectors in that list",
      },
      {
        title: ":left",
        selector: ":left",
        description: "Represents all left-hand pages of a printed document",
      },
      {
        title: ":not()",
        selector: ":not()",
        description:
          "Represents elements that do not match a list of selectors",
      },
      {
        title: ":right",
        selector: ":right",
        description: "Represents all right-hand pages of a printed document",
      },
      {
        title: ":where()",
        selector: ":where()",
        description:
          "Selects any element that can be selected by one of the selectors in that list",
      },
    ],
  },
  {
    title: "Pseudo-elements",
    selector: "pseudo-elements",
    children: [
      {
        title: "::after",
        selector: ":after",
        description:
          "Creates a pseudo-element that is the last child of the selected element",
      },
      {
        title: "::before",
        selector: ":before",
        description:
          "Creates a pseudo-element that is the first child of the selected element",
      },
      {
        title: "::backdrop",
        selector: ":backdrop",
        description:
          "A box the size of the viewport which is rendered immediately beneath any element being presented in full-screen mode",
      },
      {
        title: "::cue",
        selector: ":cue",
        description: "Matches WebVTT cues within a selected element",
      },
      {
        title: "::first-letter",
        selector: ":first-letter",
        description:
          "Applies styles to the first letter of the first line of a block-level element",
      },
      {
        title: "::first-line",
        selector: ":first-line",
        description:
          "Applies styles to the first line of a block-level element",
      },
      {
        title: "::file-selector-button",
        selector: ":file-selector-button",
        description: "Represents the button of an <input> of type='file'",
      },
      {
        title: "::marker",
        selector: ":marker",
        description: "Selects the marker box of a list item",
      },
      {
        title: "::part()",
        selector: ":part()",
        description:
          "Represents any element within a shadow tree that has a matching part attribute",
      },
      {
        title: "::placeholder",
        selector: ":placeholder",
        description:
          "Represents the placeholder text in an <input> or <textarea> element",
      },
      {
        title: "::selection",
        selector: ":selection",
        description:
          "Applies styles to the part of a document that has been highlighted by the user",
      },
      {
        title: "::slotted()",
        selector: ":slotted()",
        description:
          "Represents any element that has been placed into a slot inside an HTML template",
      },
      {
        title: "::scrollbar",
        selector: ":scrollbar",
        description: "The style of an element's scrollbar",
      },
      {
        title: "::scrollbar-button",
        selector: ":scrollbar-button",
        description: "The buttons on the scrollbar",
      },
      {
        title: "::scrollbar-thumb",
        selector: ":scrollbar-thumb",
        description: "The draggable scrolling handle",
      },
      {
        title: "::scrollbar-track",
        selector: ":scrollbar-track",
        description: "The track of the scrollbar",
      },
      {
        title: "::scrollbar-track-piece",
        selector: ":scrollbar-track-piece",
        description: "The part of the track not covered by the handle",
      },
      {
        title: "::scrollbar-corner",
        selector: ":scrollbar-corner",
        description: "The bottom corner of the scrollbar",
      },
      {
        title: "::resizer",
        selector: ":resizer",
        description:
          "The bottom corner of the scrollbar, often the bottom-right corner of the browser window",
      },
      {
        title: "::search-cancel-button",
        selector: ":search-cancel-button",
        description:
          "A button at the edge of an <input> of type='search' which clears away the current value",
      },
      {
        title: "::search-results-button",
        selector: ":search-results-button",
        description:
          "A button at the left edge of an <input> of type='search' which displays a menu for previous search queries",
      },
    ],
  },
];
