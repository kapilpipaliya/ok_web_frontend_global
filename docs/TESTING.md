# Testing Guide

## Playwright Tests

Make sure app is running at port 3000 before running tests.

### Basic Commands

```bash
# Run all tests
npx playwright test

# Show test report
npx playwright show-report

# Run with UI mode
npx playwright test --ui

# Run only for Chrome
npx playwright test --project=chromium

# Run specific test file
npx playwright test example

# Run in debug mode
npx playwright test --debug

# Auto generate tests
npx playwright codegen
```

### Specific Test Examples

Admin User Setup:
```bash
npx playwright test tests/auth/adminuser/admin_user_setup.spec.ts --project=chromium
```
