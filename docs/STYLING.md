# CSS-in-JS Styling System

This project uses a custom CSS-in-JS styling system that leverages the power of direct CSS with the flexibility of JavaScript.

## Getting Started

### Basic Usage

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";

function MyComponent() {
  return (
    <As as="div" css={css`
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 0.5rem;
    `}>
      Hello World
    </As>
  );
}
```

### Creating Reusable Styles

```tsx
import { css } from "~/lib/styles";
import { themeColors, colors } from "~/lib/styles/createCss";

// Define your styles as functions
const buttonCss = () => css`
  background-color: ${themeColors.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${colors.darken(themeColors.primary, 10)};
  }
`;

// Use in components
function Button(props) {
  return (
    <As as="button" css={buttonCss()} {...props} />
  );
}
```

### Styled Components

```tsx
import { styled } from "~/lib/styles";
import { themeColors } from "~/lib/styles/createCss";

// Create styled components
const Container = styled('div', css`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
`);

const Heading = styled('h1', css`
  color: ${themeColors.primary};
  font-size: 2rem;
  margin-bottom: 1rem;
`);

// Use them in your component
function MyPage() {
  return (
    <Container>
      <Heading>Welcome to My App</Heading>
      <p>Content goes here</p>
    </Container>
  );
}
```

## Color Utilities

The `colors` object provides various color manipulation functions:

```tsx
import { colors, themeColors } from "~/lib/styles/createCss";

// Lighten a color
const lightBlue = colors.lighten(themeColors.primary, 20);

// Darken a color
const darkBlue = colors.darken(themeColors.primary, 20);

// Set alpha/transparency
const transparentBlue = colors.setAlpha(themeColors.primary, 0.5);

// Get most readable text color for a background
const textColor = colors.mostReadable(themeColors.primary, ['#fff', '#000']);

// Mix two colors
const purplish = colors.mix(themeColors.primary, themeColors.accent, 50);
```

## Migrating from Master CSS

A migration script is available to help convert from Master CSS:

```bash
node scripts/migrate-from-master-css.js <target-directory>
```

Or you can use the `convertClassToCss` utility directly:

```tsx
import { convertClassToCss } from "~/lib/styles/migration";

// Convert a component schema with class properties to use css
const updatedSchema = convertClassToCss(originalSchema);
```

## Advanced Features

### Combining Styles

```tsx
import { mergeCss } from "~/lib/styles/createCss";

const baseStyles = () => css`/* base styles */`;
const additionalStyles = () => css`/* additional styles */`;

// Combine multiple styles
const combinedStyles = mergeCss(baseStyles, additionalStyles);
```

### Interactive States

```tsx
import { withStates } from "~/lib/styles";

const buttonStyles = withStates(
  // Base styles
  `
    background-color: ${themeColors.primary};
    color: white;
  `,
  // Hover styles
  `background-color: ${colors.darken(themeColors.primary, 10)};`,
  // Focus styles
  `outline: 2px solid ${colors.setAlpha(themeColors.primary, 0.5)};`,
  // Active styles
  `background-color: ${colors.darken(themeColors.primary, 15)};`
);
```

## Using Direct CSS Strings

Our CSS-in-JS system now supports writing direct CSS strings with template literals, which is the preferred approach rather than converting from Master CSS classes.

### Basic Usage

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";

function MyComponent() {
  return (
    <As as="div" css={css`
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 0.5rem;
      
      &:hover {
        background-color: #e5e5e5;
      }
    `}>
      Content goes here
    </As>
  );
}
```

### Using Theme Colors Directly

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { themeColors, colors } from "~/lib/styles/createCss";

function Button(props) {
  return (
    <As as="button" 
      css={css`
        background-color: ${themeColors.primary};
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        
        &:hover {
          background-color: ${colors.darken(themeColors.primary, 10)};
        }
      `}
      {...props}
    />
  );
}
```

## Pre-built CSS Helpers

We provide several utility functions to generate common CSS patterns:

### Button CSS

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { buttonCss } from "~/lib/styles/directCss";

function PrimaryButton(props) {
  return (
    <As as="button" 
      css={css`
        ${buttonCss({
          backgroundColor: '#3b82f6',
          padding: '0.75rem 1.5rem'
        })}
      `}
      {...props}
    />
  );
}
```

### Container CSS

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { containerCss } from "~/lib/styles/directCss";

function Card(props) {
  return (
    <As as="div" 
      css={css`
        ${containerCss({
          padding: '1.5rem',
          borderRadius: 8,
          shadow: true
        })}
      `}
      {...props}
    />
  );
}
```

### Layout Helpers

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { flexCss, gridCss } from "~/lib/styles/directCss";

function FlexContainer(props) {
  return (
    <As as="div" 
      css={css`
        ${flexCss({
          direction: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16
        })}
      `}
      {...props}
    />
  );
}

function GridContainer(props) {
  return (
    <As as="div" 
      css={css`
        ${gridCss({
          columns: 3,
          gap: 24,
          alignItems: 'stretch'
        })}
      `}
      {...props}
    />
  );
}
```

### Typography

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { typographyCss } from "~/lib/styles/directCss";

function Heading(props) {
  return (
    <As as="h2" 
      css={css`
        ${typographyCss({
          fontSize: 24,
          fontWeight: 'bold',
          textColor: '#1e293b',
          lineHeight: 1.2
        })}
      `}
      {...props}
    />
  );
}
```

## Converting Master CSS Classes

If you need to convert existing Master CSS classes to direct CSS strings, you can use the `masterClassToCss` function:

```tsx
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { masterClassToCss } from "~/lib/styles/directCss";

function ConvertedComponent() {
  // Convert a Master CSS class to direct CSS
  const oldClass = "p:16 grid gap:24 bg:primary-50 color:base-5";
  const directCss = masterClassToCss(oldClass);
  
  return (
    <As as="div" css={css`${directCss}`}>
      This was converted from Master CSS
    </As>
  );
}
```

## CSS Notes

- In master CSS, write `position:absolute full` for full-size positioning
- For scrollbar color, it accepts two colors (needs to be fixed in the code)
- Grid example: `<div class="display:grid grid-template-cols:repeat(2,1fr) gap:16">`
- Don't change between `opacity:.5` and `opacity:1:hover`, use color changes instead 