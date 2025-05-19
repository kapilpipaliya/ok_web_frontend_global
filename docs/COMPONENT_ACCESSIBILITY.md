# Component Accessibility Guide

This guide provides standards and best practices for ensuring that all components in our application are accessible to users with disabilities, following WCAG 2.1 AA standards.

## Table of Contents

1. [Introduction](#introduction)
2. [Accessibility Standards](#accessibility-standards)
3. [Core Components](#core-components)
4. [Form Components](#form-components)
5. [Interactive Components](#interactive-components)
6. [Navigation Components](#navigation-components)
7. [Content Components](#content-components)
8. [Testing Accessibility](#testing-accessibility)
9. [Resources](#resources)

## Introduction

Accessibility is a fundamental aspect of our application design. By making our components accessible, we ensure that all users, including those with disabilities, can use our application effectively. This guide provides specific guidance for implementing accessibility features in our components.

## Accessibility Standards

Our application follows the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. Key principles include:

1. **Perceivable**: Information and user interface components must be presentable to users in ways they can perceive.
2. **Operable**: User interface components and navigation must be operable.
3. **Understandable**: Information and the operation of the user interface must be understandable.
4. **Robust**: Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies.

## Core Components

### As Component

The `As` component is our primary building block and should always include proper accessibility attributes:

```tsx
import { As } from "~/components/As";

// Good example with proper accessibility
<As 
  as="button"
  aria-label="Close dialog"
  role="button"
  aria-pressed={isPressed}
  css={buttonCss}
  onClick={handleClick}
>
  <Icon name="close" />
</As>
```

### Key Accessibility Properties

- **aria-label**: Provide text alternatives for non-text content
- **role**: Define the purpose of the element for assistive technologies
- **tabIndex**: Ensure keyboard navigability (usually 0 for interactive elements)
- **aria-expanded**: For expandable components
- **aria-pressed**: For toggle buttons
- **aria-selected**: For selectable items
- **aria-hidden**: For decorative elements that should be ignored by screen readers

## Form Components

### FormField Component

The FormField component should include the following accessibility features:

```tsx
// Good example of accessible form field
<FormField
  label="Email Address"
  required={true}
  errorMessage={errors.email}
  helpText="We'll never share your email with anyone else."
  id="email-field"
>
  <TextInputField
    id="email-field-input"
    type="email"
    aria-describedby="email-field-help email-field-error"
    aria-required="true"
    name="email"
    value={email}
    onChange={handleChange}
  />
  <div id="email-field-help" className="help-text">
    We'll never share your email with anyone else.
  </div>
  {errors.email && (
    <div id="email-field-error" className="error-message" role="alert">
      {errors.email}
    </div>
  )}
</FormField>
```

### Accessibility Requirements for Form Components

1. **Labels**: All form controls must have associated labels
2. **Error Messages**: Error messages should be programmatically associated with form fields
3. **Required Fields**: Clearly indicate required fields both visually and programmatically
4. **Focus Management**: Proper focus handling, especially after form submission or validation
5. **Keyboard Navigation**: Ensure all form controls are keyboard operable

### SelectField Component

Select fields should be properly labeled and support keyboard interaction:

```tsx
<SelectField
  id="country-select"
  label="Country"
  options={countryOptions}
  value={selectedCountry}
  onChange={handleCountryChange}
  aria-required="true"
  errorMessage={errors.country}
/>
```

## Interactive Components

### Modal Components

Modals require special accessibility considerations:

```tsx
<CustomModal
  isOpen={isModalOpen}
  onClose={closeModal}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  initialFocusRef={initialFocusRef}
>
  <DialogHeader id="modal-title">Account Settings</DialogHeader>
  <div id="modal-description">
    Update your account preferences below.
  </div>
  <DialogContent>
    {/* Modal content */}
  </DialogContent>
  <DialogFooter>
    <button onClick={closeModal}>Cancel</button>
    <button onClick={saveChanges}>Save</button>
  </DialogFooter>
</CustomModal>
```

### Accessibility Requirements for Modals

1. **Focus Management**: 
   - When opened, focus should move to the modal (usually the first focusable element or a designated element)
   - When closed, focus should return to the element that opened the modal
   - Focus should be trapped within the modal when open

2. **Keyboard Interaction**:
   - ESC key should close the modal
   - TAB key should cycle through focusable elements within the modal

3. **ARIA Attributes**:
   - `aria-modal="true"` to indicate modal behavior
   - `role="dialog"` or `role="alertdialog"` as appropriate
   - Proper labeling with `aria-labelledby` and `aria-describedby`

4. **Screen Reader Announcement**:
   - Modal opening and closing should be announced to screen readers

## Navigation Components

### Main Navigation

```tsx
<nav aria-label="Main Navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/dashboard" aria-current={isCurrentPage('/dashboard') ? 'page' : undefined}>
        Dashboard
      </a>
    </li>
    {/* More navigation items */}
  </ul>
</nav>
```

### Dropdown Menus

```tsx
<div
  role="menu"
  aria-labelledby="dropdown-button"
>
  <button
    id="dropdown-button"
    aria-haspopup="true"
    aria-expanded={isOpen}
    onClick={toggleMenu}
  >
    Options
  </button>
  {isOpen && (
    <ul>
      <li role="menuitem">
        <button onClick={handleOption1}>Option 1</button>
      </li>
      <li role="menuitem">
        <button onClick={handleOption2}>Option 2</button>
      </li>
    </ul>
  )}
</div>
```

## Content Components

### Images and Icons

```tsx
// Decorative icon (should be ignored by screen readers)
<Icon name="decoration" aria-hidden="true" />

// Meaningful icon (needs accessible name)
<Icon name="warning" aria-label="Warning" role="img" />

// Image with alt text
<img src="/path/to/image.jpg" alt="Description of image" />

// Complex image with longer description
<figure>
  <img src="/path/to/chart.png" alt="Bar chart showing revenue growth" aria-describedby="chart-description" />
  <figcaption id="chart-description">
    This chart shows revenue growth of 15% year-over-year from 2022 to 2023.
  </figcaption>
</figure>
```

### Tables

```tsx
<Table
  aria-label="User Information"
  aria-describedby="table-description"
>
  <caption id="table-description">List of users with their roles and last login date</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Role</th>
      <th scope="col">Last Login</th>
    </tr>
  </thead>
  <tbody>
    {users.map(user => (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>{formatDate(user.lastLogin)}</td>
      </tr>
    ))}
  </tbody>
</Table>
```

## Testing Accessibility

### Automated Testing

1. **axe-core Integration**:
   
   ```tsx
   // In your Playwright test
   import { injectAxe, checkA11y } from 'axe-playwright';

   test('page should be accessible', async ({ page }) => {
     await page.goto('/some-page');
     await injectAxe(page);
     await checkA11y(page);
   });
   ```

2. **Keyboard Navigation Testing**:
   
   ```tsx
   test('form can be navigated with keyboard', async ({ page }) => {
     await page.goto('/form-page');
     
     // Press Tab to move focus to the first input
     await page.keyboard.press('Tab');
     
     // Check if the first input has focus
     const focusedElement = await page.evaluate(() => document.activeElement?.id);
     expect(focusedElement).toBe('first-input-id');
     
     // Fill the input
     await page.keyboard.type('test input');
     
     // Tab to the next field
     await page.keyboard.press('Tab');
     
     // Check focus moved to the next element
     const nextFocusedElement = await page.evaluate(() => document.activeElement?.id);
     expect(nextFocusedElement).toBe('second-input-id');
   });
   ```

### Manual Testing

1. **Keyboard Navigation**:
   - TAB: Moves focus to the next focusable element
   - SHIFT+TAB: Moves focus to the previous focusable element
   - ENTER/SPACE: Activates buttons, links, and other interactive elements
   - ARROW KEYS: Navigates within components like select boxes and tab panels

2. **Screen Reader Testing**:
   - Test with at least one screen reader (e.g., VoiceOver on Mac, NVDA on Windows)
   - Verify that all content is properly announced
   - Check that interactive elements have proper accessible names
   - Ensure that dynamic content changes are announced

3. **Focus Visibility**:
   - Ensure that the focus indicator is clearly visible for all interactive elements
   - Verify that focus order is logical and follows the visual flow of the page

## Accessibility Checklist

### For All Components

- [ ] Component has accessible name (either visible text or aria-label/aria-labelledby)
- [ ] Keyboard navigable and operable
- [ ] Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] Does not rely solely on color to convey information
- [ ] Works correctly with screen readers
- [ ] Handles different zoom levels and text sizes

### For Form Components

- [ ] All inputs have associated labels
- [ ] Required fields are indicated both visually and programmatically
- [ ] Error messages are associated with corresponding fields
- [ ] Form can be submitted using keyboard only

### For Interactive Components

- [ ] Proper focus management
- [ ] Appropriate ARIA roles, states, and properties
- [ ] Interactive elements have accessible names
- [ ] State changes are communicated to assistive technologies

## Resources

1. [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
2. [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.2/)
3. [Accessible Rich Internet Applications (WAI-ARIA) 1.2](https://www.w3.org/TR/wai-aria-1.2/)
4. [MDN Web Docs: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
5. [Axe DevTools](https://www.deque.com/axe/)