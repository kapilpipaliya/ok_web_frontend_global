# CSS Helpers

Helpers for writing component CSS in page schemas and dynamic components. They map directly to standard CSS — no custom syntax.

**Source:** `src/lib/styles/cssHelpers.ts`

## Philosophy

Helpers exist when they **encapsulate logic**, not when they save typing or rename CSS.

| Keep | Write as plain CSS |
|------|-------------------|
| Breakpoint math (`up`, `down`, `between`, `only`) | `@media print`, `@supports`, arbitrary media |
| Named container queries (`container`) | `containerWidth`, `containerHeight` |
| At-rule generators (`property`, `animation`) | Mechanical wrappers |

Return a **string** for a single block, or an **array of strings** to combine multiple blocks.

## Availability

```ts
import { up, container, animation } from "~/lib/styles/cssHelpers";
```

All helpers are on the dynamic component `_` object.

## API

### Nested selectors

Write selectors directly inside `._id` using standard CSS nesting:

```js
`._id {
  &:hover { opacity: 0.9; }
  &::before { content: ""; }
  & > img { border-radius: 0.5rem; }
  &:has(.active) { font-weight: 600; }
  .dark & { color: white; }
}`
```

### Breakpoint media

| Helper | Output |
|--------|--------|
| `up("md")` | `@media (min-width: 768px)` |
| `down("lg")` | `@media (max-width: 1023.98px)` |
| `between("sm", "lg")` | min + max range |
| `only("md")` | single breakpoint band |

Breakpoint names (`sm`–`2xl`) resolve via `DEFAULT_BREAKPOINTS`; raw values like `"900px"` also work.

| Name | Value |
|------|-------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

For other media queries (`print`, `prefers-color-scheme`, etc.), use plain CSS:

```js
`@media print {
  ._id { display: none; }
}`
```

### Container queries

| Helper | Purpose |
|--------|---------|
| `container("md")` | `@container (min-width: …)` |
| `container("sidebar", "400px")` | named container |
| `container({ name, minWidth })` | named + min-width |
| `container({ name, condition })` | named + custom condition |

For width/height-only conditions, use plain CSS: `` `@container (width > 600px) { … }` ``.

### At-rules

| Helper | Purpose |
|--------|---------|
| `property(name, opts)` | `@property` with quoted syntax |
| `animation(name, opts?)` | `animation` shorthand + timeline/range |

For `@font-face`, `@counter-style`, `@page`, `@keyframes`, `@supports`, `@layer`, use plain CSS strings.

### Animation

```js
animation("fade", { duration: "300ms", easing: "ease" })  // structured
animation("fade 300ms ease forwards")                      // raw shorthand
animation("fade", { timeline: "scroll()", rangeStart: "entry 0%" })
```

## Examples

### Basic component styles

```js
css: '''
return [
  `._id {
    display: flex;
    background: ${_.theme.var.color.background};

    &:hover {
      background: ${_.theme.var.color.background_light_200};
    }

    & > img {
      border-radius: 0.5rem;
    }

    &:has(.active) {
      font-weight: 600;
    }
  }`,
  up("md")`
    padding: 2rem;
  `,
];
'''
```

### Full example

```js
return [
  property("--angle", {
    syntax: "<angle>",
    inherits: false,
    initialValue: "0deg",
  }),
  `@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }`,
  `@supports (display: grid) {
    ._id { display: grid; }
  }`,
  `._id {
    ${animation("fade-in", { duration: "300ms", easing: "ease" })}

    &:hover { opacity: 1; }
    &:is(.primary, .accent) { color: white; }
  }`,
  up("md")` padding: 2rem; `,
];
```

## Returning arrays

The CSS processor accepts a string or array of strings:

```js
return [
  `@keyframes spin {
    to { transform: rotate(360deg); }
  }`,
  `._id { ${animation("spin 1s linear infinite")} }`,
];
```

## Tips

1. Root selector is `._id` — nest with `&:hover`, `& > img`, etc.
2. Return an array when combining multiple CSS blocks.
3. Use breakpoint helpers for min/max width; write everything else as plain CSS.
