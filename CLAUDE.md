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

#### Page Builder Graph Schema
The Page Builder uses a graph-based structure with vertices and edges to represent UI components:

**Graph Structure:**
```javascript
{
  vertexes: [
    {
      id: string, // Unique identifier for the vertex
      L: string,  // Label associated with the vertex (e.g., 'Attr', 'Component')
      P: object   // Properties associated with the vertex
    }
  ],
  edges: [
    {
      id: string,  // Unique identifier for the edge
      T: string,   // Type/label of the edge
      E: string,   // End vertex ID of the edge
      S: string    // Start vertex ID of the edge
    }
  ]
}
```

**Attr Vertex (Page Builder Items):**
- `displayOrder`: number - Determines item order among siblings
- `componentName`: string - Component type ('Html', 'Data', 'Slot', or custom component)
- `fns`: Function body string - JavaScript functions for dynamic properties
- `props`: Function body string - Dynamic properties returning key-value pairs
- `css`: Function body string - CSS styling with `._id` selector for current element (returns string or array of strings)

**Component Types:**

1. **Html Component** (default if no componentName):
   - `as`: HTML tag ('div', 'span', 'icon', 'portal') or omit for fragment
   - `text`: Text content to render
   - For icons: requires `icon`, `height`, `width` properties

2. **Data Component** (for repeating patterns):
   - `name`: string - Data context name
   - `loop`: boolean - Enable iteration over children
   - `expression`: string - Data evaluation expression
   - Access iteration data via `args.contextData.name` in child components

3. **Slot Component**:
   - `name`: string - Slot name (default: 'children')

**Function Arguments Available:**
The `fns`, `props`, and `css` functions have access to `args` object containing:
- `theme`: ThemeContext for styling
- `data`: Current vertex data
- `contextData`: Context data from parent components
- `graph`: Graph interface for data access
- `navigate`: Navigation utilities
- `onChange`: Value change handler
- `evalExpression`: Expression evaluation
- `showSuccessToast`, `showErrorToast`: Toast notifications
- Many other utilities for form handling, transactions, etc.

**Component Variants:**
Custom components can have variants defined through:
- `Component` vertex with `key` property
- `ComponentVariant` vertices with `key`, `type`, `defValue` properties
- `ComponentVariantOption` vertices for string type options
- Access variant values via `args.contextData.props["variantKey"]`

#### Styling System
The project uses a custom CSS-in-JS system that:
- Uses `._id` class selector for all component styles
- Returns CSS as strings or arrays of strings (for compatibility with non-nested CSS environments)
- Provides theme awareness and color utilities
- Includes helpers for common patterns (buttons, containers, typography)
- Supports pseudo-classes and pseudo-elements

**CSS Pattern:**
```typescript
// Simple styles - return string with ._id
const complexStyle = () => `._id {
  background: \${args.theme.var.color.background};
  transition: all 0.2s ease;
  
  &:hover {
    background: \${args.theme.var.color.background_l200};
  }
  
  &::after {
    content: '';
    position: absolute;
  }
}`;

// Media queries - return array
const responsiveStyle = () => [
  `._id { padding: 2rem; }`,
  `@media (max-width: 768px) {
    ._id { padding: 1rem; }
  }`
];
```

**Important:** The `css` function from `~/lib/styles` is optional. Styles can be written as plain strings/arrays following the `._id` pattern.

#### Theme System
The application uses a sophisticated theme system built around SolidJS with Neo4j graph database storage:

**Core Features:**
- Dark/light mode support with automatic color resolution and shade swapping
- Customizable color schemes with semantic colors (primary, success, error, etc.)
- Advanced color utilities including light/dark shades, contrast ratios, and accessibility helpers
- Typography, spacing, and animation configuration
- Proxy-based dynamic theme access

**Color System:**
```typescript
// Unified color (same for light/dark)
primary: "oklch(0.57 0.19 250)"

// Mode-specific color
primary: {
  light: "oklch(0.57 0.19 250)",
  dark: "oklch(0.7 0.15 250)"
}

// Dynamic shade access
args.theme.var.color.primary_l100       // Light shade (close to base)
args.theme.var.color.primary_l900       // Light shade (close to white)
args.theme.var.color.primary_d100       // Dark shade (close to base)
args.theme.var.color.primary_d900       // Dark shade (close to black)

// Automatic shade swapping in dark mode
// When dark mode is active, _l shades behave like _d shades and vice versa
args.theme.var.color.primary_l100       // In light mode: light shade, In dark mode: dark shade

// Other dynamic access
args.theme.var.color.primaryScheme      // Color scheme variations
args.theme.var.color.textColor         // Semantic color
```

**Shade System:**
- Light shades: `_l1` to `_l1000` (l1 = closest to base color, l1000 = white)
- Dark shades: `_d1` to `_d1000` (d1 = closest to base color, d1000 = black)
- Common shades: `_l100`, `_l200`, `_l300`, `_l400`, `_l500`, `_l600`, `_l700`, `_l800`, `_l900`
- Shades automatically swap in dark mode for better contrast

**Theme Structure:**
- `var.color`: Core color system (primary, success, error, text, background, etc.)
- `var.fontFamily`: Typography settings (base, heading, mono fonts)
- `var.spacingScale`: Spacing system (compact, default, loose)
- `var.borderRadius`: Border radius presets
- `var.transitionDuration*`: Animation timings
- For background colors, prefer light shades (e.g., `background_l100`, `background_l50`)

**Key Files:**
- `src/lib/context/ThemeContext.tsx` - Theme context with proxy-based access
- `src/lib/context/ThemeProvider.tsx` - Global theme state management
- `src/lib/graph/get/sync/theme/themeConfig.ts` - Database integration
- `src/lib/styles/colorUtils.ts` - Color manipulation utilities
- `src/lib/styles/constants.ts` - Theme constants and presets

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
    - `/constants` - Reserved keywords for Cypher queries
    - `/conversion` - Utilities for converting between Neo4j and JSON formats
    - `/core` - Core Neo4j connection handling and driver setup
    - `/get` - Data retrieval functions
    - `/mutate` - Database mutation operations
    - `/permissions` - Permission checking and management
    - `/queries` - Query construction and evaluation
    - `/session` - Session management for subdomains
    - `/types` - Type definitions
  - `/features` - Feature-specific implementations
    - `/file_manager` - File management system
    - `/grid` - Data grid components
    - `/page_attr_render` - Page attribute rendering
    - `/page_designer` - Page design interface
  - `/lib` - Utility functions and core libraries
    - `/api` - API communication
    - `/auth` - Authentication utilities
    - `/context` - Context providers
    - `/data_structure` - Data structure helpers
    - `/graph` - Graph data handling
      - `/context` - Graph context providers
        - `GlobalProperties.ts` - Global property definitions
        - `GraphContext.ts` - Graph context implementation
        - `GraphInterface.ts` - Interface definitions
        - `UseGraph.ts` - Graph hook utilities
      - `/get` - Data retrieval
        - `/sync` - Synchronous data retrieval
          - `/auth` - Authentication-related queries
          - `/company` - Company data queries
          - `/edge` - Edge retrieval functions
          - `/entity` - Entity management functions
          - `/expression` - Expression evaluation
          - `/format` - Formatting utilities
          - `/store` - Global store access
          - `/theme` - Theme-related queries
          - `/user` - User data retrieval
      - `/import` - Data import
        - `importGraphStructure.ts` - Graph data import
      - `/mutate` - Graph mutation operations
        - `/core` - Core mutation functions
          - `/channel` - Broadcast channel handling
          - `/edge` - Edge mutation operations
          - `/vertex` - Vertex mutation operations
        - `/data` - Data mutation handling
        - `/form` - Form-related mutations
        - `/selection` - Selection value mutations
        - `/user` - User data mutations
        - `/vertex` - Vertex-specific operations
      - `/transaction` - Transaction management
        - `/core` - Core transaction functions
        - `/history` - Undo/redo functionality
        - `/revert` - Transaction reverting
        - `/steps` - Transaction step management
        - `/types` - Transaction type definitions
        - `/value` - Transaction value utilities
      - `/type` - Graph type definitions
        - `edge.ts` - Edge type definitions
        - `edgeMap.ts` - Edge mapping types
        - `vertex.ts` - Vertex type definitions
        - `vertexMap.ts` - Vertex mapping types
    - `/meta` - Metadata types and utilities
    - `/permissions` - Permission management
    - `/styles` - Styling system
    - `/validation` - Validation functions
  - `/pages` - Page components
    - `/admin_dashboard` - Admin dashboard components
    - `/auth` - Authentication pages
    - `/global` - Global settings pages
    - `/subdomain` - Subdomain management
    - `/theme_menu` - Theme selection components
    - `/user` - User settings
  - `/routes` - Route definitions (file-based routing)
    - `/admin` - Admin routes
    - `/api` - API endpoints
    - `/auth` - Authentication routes
    - `/internal` - Internal routes
    - `/support` - Support routes
    - `/system` - System routes
    - `/view` - View routes
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

## Color Shade System
- Explicit light/dark shades
  - Light shades: `primary_l100` to `primary_l900` (l100 = close to base, l900 = close to white)
  - Dark shades: `primary_d100` to `primary_d900` (d100 = close to base, d900 = close to black)
- **Dark mode behavior**: Shades automatically swap in dark mode (`_l` becomes `_d` and vice versa)

## CSS Styling Pattern Update
- **All styles must use `._id` class selector**
- **Return types**:
  - Simple styles: Return string with `._id { ... }`
  - Complex styles: Return array of strings for media queries
  ```

## Memories

- Run `./beep` after answered or confirmation