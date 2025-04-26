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

Super User Setup:
```bash
npx playwright test tests/auth/superuser/super_user_setup.spec.ts --project=chromium
```

Sign up an account for adminpaneluicomponents subdomain. 