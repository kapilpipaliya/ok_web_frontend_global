# Schema Export Module Structure

This module handles the export of Components and Pages from the Neo4j database to hjson files.

## Directory Structure

```
export/
├── component/          # Component-specific export functions
│   ├── collectComponentData.ts    # Collects all data for a component
│   ├── fetchComponentById.ts      # Fetches a component by its key
│   ├── fetchComponentVariants.ts  # Fetches component variants and options
│   ├── fetchComponents.ts         # Main function to export all components
│   └── index.ts                   # Module exports
├── page/              # Page-specific export functions
│   ├── collectPageData.ts         # Collects all data for a page
│   ├── fetchPageById.ts           # Fetches a page by its key
│   ├── fetchPageUnique.ts         # Fetches PageUnique constraints
│   ├── fetchPages.ts              # Main function to export all pages
│   ├── fetchRolePermissions.ts    # Fetches role permissions for pages
│   └── index.ts                   # Module exports
├── shared/            # Shared functions used by both components and pages
│   ├── fetchAttrHierarchy.ts      # Fetches Attr node hierarchy
│   ├── fetchAttrSrcFiles.ts       # Fetches AttrSrc relationships and Files
│   └── index.ts                   # Module exports
├── types/             # TypeScript type definitions
│   └── index.ts                   # Export types (ExportStats, CollectedData)
├── utils/             # Utility functions
│   ├── normalizeSchema.ts         # Normalizes schema IDs to sequential numbers
│   ├── writeSchemaToFile.ts       # Writes schema to hjson file
│   └── index.ts                   # Module exports
└── validation/        # Validation and permission checks
    ├── validateUserAndPermissions.ts  # Validates user has admin permissions
    └── index.ts                       # Module exports
```

## Key Features

1. **Modular Structure**: Each function has a single responsibility
2. **Type Safety**: All functions use TypeScript types
3. **Neo4j Integration**: Proper handling of Neo4j nodes and relationships
4. **File Management**: Exports to organized hjson files
5. **Permission Checking**: Ensures only admins can export schemas

## Data Flow

1. User makes GET request to `/api/schema/export`
2. System validates user has admin permissions
3. Components and Pages are fetched from database
4. For each Component/Page:
   - Fetch entity by key
   - Fetch Attr hierarchy
   - Fetch AttrSrc relationships and Files
   - Fetch related data (variants for components, permissions for pages)
5. Schema is normalized (sequential IDs)
6. Data is written to hjson files in `src/page_schema/[subdomain]/`