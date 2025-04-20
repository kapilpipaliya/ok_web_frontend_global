import { createCssFunction } from "./createCss";

/**
 * A decorator function to create reusable style functions
 *
 * Usage:
 * ```
 * const buttonStyle = styles({
 *   base: {
 *     backgroundColor: '#3b82f6',
 *     color: '#ffffff',
 *     padding: '0.5rem 1rem',
 *     borderRadius: '0.25rem',
 *   },
 *   hover: {
 *     backgroundColor: '#2563eb',
 *   },
 *   active: {
 *     backgroundColor: '#1d4ed8',
 *   }
 * });
 * ```
 */
export function styles(styleDefinition: StyleDefinition) {
  return createCssFunction(() => {
    let css = "";

    // Process base styles
    if (styleDefinition.base) {
      css += `._id {\n${objectToCssProperties(styleDefinition.base)}\n}\n`;
    }

    // Process interactive states
    const states = {
      hover: ":hover",
      active: ":active",
      focus: ":focus",
      focusVisible: ":focus-visible",
      disabled: ":disabled",
      checked: ":checked",
      visited: ":visited",
    };

    Object.entries(states).forEach(([state, pseudoClass]) => {
      if (styleDefinition[state]) {
        css += `\n._id${pseudoClass} {\n${objectToCssProperties(styleDefinition[state])}\n}\n`;
      }
    });

    // Process media queries
    if (styleDefinition.media) {
      Object.entries(styleDefinition.media).forEach(([query, mediaStyles]) => {
        css += `\n@media ${query} {\n  ._id {\n${objectToCssProperties(mediaStyles, 4)}\n  }\n}\n`;
      });
    }

    // Process child selectors
    if (styleDefinition.children) {
      Object.entries(styleDefinition.children).forEach(
        ([selector, childStyles]) => {
          css += `\n._id ${selector} {\n${objectToCssProperties(childStyles)}\n}\n`;
        },
      );
    }

    // Process pseudo elements
    const pseudoElements = {
      before: "::before",
      after: "::after",
    };

    Object.entries(pseudoElements).forEach(([element, pseudoSelector]) => {
      if (styleDefinition[element]) {
        const content = styleDefinition[element].content || '""';
        const pseudoStyles = { ...styleDefinition[element], content };
        css += `\n._id${pseudoSelector} {\n${objectToCssProperties(pseudoStyles)}\n}\n`;
      }
    });

    return css;
  });
}

// Helper function to convert a style object to CSS properties string
function objectToCssProperties(obj: Record<string, any>, indent = 2): string {
  const indentStr = " ".repeat(indent);
  return Object.entries(obj)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${indentStr}${cssKey}: ${value};`;
    })
    .join("\n");
}

// Define types
export type StyleDefinition = {
  base?: Record<string, any>;
  hover?: Record<string, any>;
  active?: Record<string, any>;
  focus?: Record<string, any>;
  focusVisible?: Record<string, any>;
  disabled?: Record<string, any>;
  checked?: Record<string, any>;
  visited?: Record<string, any>;
  before?: Record<string, any> & { content?: string };
  after?: Record<string, any> & { content?: string };
  media?: Record<string, Record<string, any>>;
  children?: Record<string, Record<string, any>>;
  [key: string]: any;
};

/**
 * Combine multiple style functions into one
 */
export function mergeStyles(...styleFuncs: ReturnType<typeof styles>[]) {
  return createCssFunction(() => {
    return styleFuncs.map((func) => func()).join("\n");
  });
}

/**
 * Apply styles conditionally
 */
export function conditionalStyles(
  condition: boolean | (() => boolean),
  trueStyles: ReturnType<typeof styles>,
  falseStyles?: ReturnType<typeof styles>,
) {
  return createCssFunction(() => {
    const shouldApply =
      typeof condition === "function" ? condition() : condition;
    return shouldApply ? trueStyles() : falseStyles ? falseStyles() : "";
  });
}
