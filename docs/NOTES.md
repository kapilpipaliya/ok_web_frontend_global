# Development Notes and Reminders

## Component Development

- When the page is loaded server-side, the client side will not run again, so state inside it will not set when page is reloaded.

- `createdResource` is called two times, making API calls two times, so use `onMount`

- Rename `PreviewContext` to `ExecutionContext` and remove `isDesignMode` variable

- Nested functions can be used like:
  ```js
  return {
      fns: {
          p2: () => args.fns("p1")("kk")
      },
      onClick: () => console.log(args.fns("p2")("ll"))
  }
  ```

- We don't need to create separate meta for repeated components, we can handle logic with other props functions.

- RPC function call should be handled carefully in `createAsync()`. If one RPC call is not handled properly, it will affect other component async function calls and it will be critical to debug.

## Browser Issues

- When LastPass auto-fills the fields, it gives errors in development on cleanup of component.

## Table Component Requirements

Make it highly customizable with features like:
- Header grouping
- Pagination
- Filtering
- Sorting
- Expanding
- Row actions
- Row selection
- Row grouping
- Row details
- Row details expanding
- Column visibility
- Column resizing
- Column ordering
- Column filtering
- Column grouping
- Column pinning
- Column expanding
- Column sorting

Consider using [@tanstack/react-table](https://www.npmjs.com/package/@tanstack/react-table) as a reference.

## Logo Design Guidelines

- ✅ Modern Typography → Uses Inter font for better UI/UX branding.
- ✅ Tech-Oriented Design → A square element representing draggable blocks.
- ✅ Drag Handles → Added three small dots to signify movement & modularity.
- ✅ Sharp & Clean Lines → Matches modern UI/UX aesthetics.


## UI/UX Terminology

- Copy: Saves for pasting elsewhere
- Duplicate: Creates an immediate copy in the same location

## Roadmap

- Make Charts Support: https://dragee.github.io/#Chart
- Implement CASL for authorization 