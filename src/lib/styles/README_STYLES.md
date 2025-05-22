# @styles Decorator System

This styling system provides a clean, type-safe way to define styles for components using the `@styles` decorator
pattern. Unlike the CSS variables approach, this system uses direct color values and transforms.

## Key Features

- Object-based styling (similar to styled-components or emotion)
- Full TypeScript support
- No CSS variables used
- Support for pseudo-classes (hover, active, focus, etc.)
- Child selectors and nested styles
- Media queries for responsive design
- Utility functions for color manipulation

## Basic Usage

```tsx
import { As } from "~/components/As";
import { styles, breakpoints, mergeStyles } from "~/lib/styles";
import { colors } from "~/lib/styles/styles";

// Define styles using the @styles decorator
const buttonStyles = styles({
  base: {
    backgroundColor: colors.primary,
    color: "#ffffff",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem"
  },
  hover: {
    backgroundColor: colors.darken(colors.primary, 10)
  }
});

// Use with components
function MyButton(props) {
  return (
    <As as="button" css={buttonStyles} {...props}>
      {props.children}
    </As>
  );
}
```

## Style Object Structure

The style object can include the following properties:

### Base Styles

```tsx
const myStyles = styles({
  base: {
    color: "red",
    fontSize: "16px"
  }
});
```

### Interactive States

```tsx
const myStyles = styles({
  base: { /* base styles */ },
  hover: { /* styles when hovered */ },
  active: { /* styles when active */ },
  focus: { /* styles when focused */ },
  focusVisible: { /* styles for focus-visible */ },
  disabled: { /* styles when disabled */ },
  checked: { /* styles when checked (for checkboxes/radios) */ },
  visited: { /* styles for visited links */ }
});
```

### Media Queries

```tsx
const myStyles = styles({
  base: { /* base styles */ },
  media: {
    [breakpoints.sm]: { /* styles for small screens */ },
    [breakpoints.md]: { /* styles for medium screens */ },
    [breakpoints.lg]: { /* styles for large screens */ },
    "(prefers-color-scheme: dark)": { /* dark mode styles */ }
  }
});
```

### Child Selectors

```tsx
const myStyles = styles({
  base: { /* base styles */ },
  children: {
    "h1": { fontSize: "2rem" },
    ".some-class": { color: "blue" },
    "> div": { margin: "1rem" }
  }
});
```

### Pseudo Elements

```tsx
const myStyles = styles({
  base: { /* base styles */ },
  before: {
    content: '"★"',
    marginRight: "0.5rem"
  },
  after: {
    content: '"→"',
    marginLeft: "0.5rem"
  }
});
```

## Color Utilities

The `colors` object provides common colors and utility functions:

```tsx
// Static colors
colors.primary    // '#3b82f6'
colors.secondary  // '#64748b'
colors.info       // '#0ea5e9'
colors.success    // '#10b981'
colors.warning    // '#f97316'
colors.error      // '#ef4444'

// Color utilities
colors.lighten('#3b82f6', 20)     // Lighten by 20%
colors.darken('#3b82f6', 20)      // Darken by 20%
colors.saturate('#3b82f6', 20)    // Increase saturation by 20%
colors.desaturate('#3b82f6', 20)  // Decrease saturation by 20%
colors.setAlpha('#3b82f6', 0.5)   // Set alpha to 0.5
colors.shade('#3b82f6', 20)       // Get 20% shade of color
```

## Combining Styles

Use the `mergeStyles` function to combine multiple style functions:

```tsx
const baseButtonStyles = styles({
  base: { /* common button styles */ }
});

const primaryButtonStyles = mergeStyles(
  baseButtonStyles,
  styles({
    base: { backgroundColor: colors.primary }
  })
);

const secondaryButtonStyles = mergeStyles(
  baseButtonStyles,
  styles({
    base: { backgroundColor: colors.secondary }
  })
);
```

## Conditional Styles

Apply styles conditionally using the `conditionalStyles` function:

```tsx
const isDarkMode = () => document.documentElement.classList.contains('dark-mode');

const themeAwareStyles = conditionalStyles(
  isDarkMode,
  styles({ base: { color: '#ffffff', backgroundColor: '#1a1a1a' } }),
  styles({ base: { color: '#1a1a1a', backgroundColor: '#ffffff' } })
);
```

## Comparison with CSS Variables

### Before (with CSS variables)

```tsx
const buttonCss = (args) => `
  ._id {
    background-color: var(--primary);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-md);
  }
  
  ._id:hover {
    background-color: var(--primary-60);
  }
`;
```

### After (with @styles)

```tsx
const buttonStyles = styles({
  base: {
    backgroundColor: colors.primary,
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem"
  },
  hover: {
    backgroundColor: colors.darken(colors.primary, 10)
  }
});
``` 