# CSS-in-JS Styling System

This styling system replaces Master CSS with a CSS-in-JS approach that uses the `<As>` component for HTML elements and CSS strings for styling.

## Key Components

### 1. The `<As>` Component

The `<As>` component replaces HTML elements and applies CSS styles with a unique ID selector.

```tsx
import { As } from "~/components/As";

<As as="div" css={myCssFunction}>
  Content goes here
</As>
```

### 2. CSS Functions

Define CSS using functions that return CSS strings with the `._id` selector:

```tsx
const buttonCss = () => `
  ._id {
    background-color: var(--primary);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
  }
  
  ._id:hover {
    background-color: var(--primary-dark);
  }
`;
```

### 3. Helper Functions

Use the provided helper functions in `~/lib/styles`:

```tsx
import { css, mergeCss, responsive, withStates } from "~/lib/styles";

// Define CSS using template literals
const myCss = () => css`
  ._id {
    color: red;
  }
`;

// Merge multiple CSS functions
const combinedCss = mergeCss(baseCss, additionalCss);

// Create responsive styles
const responsiveCss = responsive(baseCss);

// Add interactive states
const interactiveCss = withStates(baseCss);
```

## Migrating from Master CSS

To migrate from Master CSS:

1. Replace HTML elements with the `<As>` component
2. Replace `class` properties with `css` functions
3. Convert Master CSS classes to CSS strings with `._id` selectors

### Example

Before:
```tsx
<div class="p:10 grid gap:20">
  <span class="color:base-50 font-weight:500 font:15">Label</span>
</div>
```

After:
```tsx
import { As } from "~/components/As";

const containerCss = () => `
  ._id {
    padding: 10px;
    display: grid;
    gap: 20px;
  }
`;

const labelCss = () => `
  ._id {
    color: var(--base-50);
    font-weight: 500;
    font-size: 15px;
  }
`;

<As as="div" css={containerCss}>
  <As as="span" css={labelCss}>Label</As>
</As>
```

## Theme System

Each color creates shades from 0-100 that can be used in CSS:

```tsx
const buttonCss = () => `
  ._id {
    background-color: var(--primary-50);
    color: var(--base-0);
  }
  
  ._id:hover {
    background-color: var(--primary-60);
  }
`;
```

## Usage 

You can import the style utilities using either the path alias or the full path:

```typescript

// Using the full path
import { css, mergeCss, responsive, withStates } from "~/lib/styles/styles";
``` 