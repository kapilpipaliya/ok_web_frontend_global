# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
# Install dependencies
npm install --force

# Start development server
npm run dev

# Build application
npm run build

# Start production server
npm run start
# or with environment variables
npm run startDev
```

### Code Quality
```bash
# Run type checking, ESLint, and build to verify everything
npm run check-errors

# Run ESLint with auto-fixing
npx eslint --fix src

# Format code with Prettier
npm run pretty

# Check for circular dependencies
npx madge --circular --extensions ts,tsx src
npx depcruise src --validate
```

### Testing
```bash
# Run Playwright tests (make sure app is running on port 3000 first)
npx playwright test

# Run specific test file
npx playwright test example
npx playwright test tests/auth/adminuser/admin_user_setup.spec.ts --project=chromium

# Run tests with UI mode
npx playwright test --ui

# Run tests for specific browser
npx playwright test --project=chromium

# Debug tests
npx playwright test --debug

# Generate tests
npx playwright codegen

# View test reports
npx playwright show-report
```

### Email Testing
```bash
# Send test email
npm run send-test-email
```

## Architecture Overview

This is a SolidJS-based web application for a page builder/CMS system with the following key components:

1. **Frontend Framework**: SolidJS with Vinxi for SSR/SSG
2. **Database**: Neo4j graph database
3. **Styling**: Custom CSS-in-JS system
4. **Authentication**: Custom auth implementation with role-based permissions
5. **Page Builder**: Visual page design system with components, layouts, and properties
6. **File Management**: System for managing file uploads and organization

### Key Architectural Components

#### Graph Database (Neo4j)
The application uses Neo4j as its primary database. The data model is graph-based with nodes (vertices) and relationships (edges) representing:
- Components and component trees
- Pages and page attributes
- Users, roles, and permissions
- Files and folders
- Forms and form elements

Session management and transaction handling are crucial when working with Neo4j. The app implements proper connection pooling and session management.

#### Component System
The application has a component-based architecture where:
- Components can be dragged and dropped in the page designer
- Components have properties, slots, and variants
- Components can be nested to create complex layouts
- The system supports form components with validation

#### Styling System
The project uses a custom CSS-in-JS system that:
- Supports direct CSS strings with template literals
- Provides theme awareness and color utilities
- Includes helpers for common patterns (buttons, containers, typography)
- Supports nested selectors and pseudo-elements using morden css.

#### Permission System
The application implements a role-based access control system:
- Users have roles
- Roles have permissions
- Permission checks are performed at the route and component level
- System supports Admin, User, Guest and custom roles

## Directory Structure

- `/src` - Main application code
  - `/components` - Reusable UI components
  - `/cypher` - Neo4j database operations
  - `/features` - Feature-specific implementations
  - `/lib` - Utility functions and core libraries
  - `/pages` - Page components
  - `/routes` - Route definitions (file-based routing)
- `/docs` - Documentation files
- `/scripts` - Utility scripts
- `/public` - Static assets
- `/tests` - Test files

## Important Files

- `app.config.ts` - Application configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `biome.json` - Biome (formatter) configuration

## Development Workflow

1. Start the Neo4j database (required for development)
2. Start the development server with `npm run dev`
3. Make changes to the codebase
4. Run tests with Playwright to verify changes
5. Use `npm run check-errors` to ensure code quality
6. Build the application with `npm run build`

## Implementing Features

When implementing new features:

1. Understand the Neo4j data model for the relevant domain
2. Follow the existing patterns for components and styling
3. Implement proper permission checks where needed
4. Add appropriate error handling
5. Use the project's CSS-in-JS system for styling
6. Write Playwright tests for new functionality

## Memories

- Run `./beep` after answered or confirmation