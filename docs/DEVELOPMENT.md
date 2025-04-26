# Development Guide

## Neo4j Setup and Configuration

### Getting Started with Neo4j
https://neo4j.com/docs/getting-started/whats-neo4j/

### Neo4j Browser
To access the Neo4j Browser, navigate to: [http://localhost:7474/browser/](http://localhost:7474/browser/)

### Cypher Manual
https://neo4j.com/docs/getting-started/cypher-intro/resources/

### JavaScript Driver Manual
https://neo4j.com/docs/javascript-manual/current/

### Neo4j Multiple database in community edition
https://github.com/neo4j/neo4j/issues/12920
https://dozerdb.org

### Configuration
Uncomment this in neo4j.conf:
```
server.default_listen_address=0.0.0.0
auth.basic("neo4j", "12345678")
```

### System Setup and Cleanup
- Super User Setup: http://localhost:3001/api/setup/superUserSetup
- System Cleanup: http://localhost:3001/api/setup/systemCleanup

### Neo4j Session Management
Proper session management is crucial in database operations to prevent resource leaks. The session is closed in a finally block to ensure it is always closed, even if an error occurs.

### Neo4j Import
https://neo4j.com/docs/operations-manual/current/tools/neo4j-admin/neo4j-admin-import/

## Building

Solid apps are built with _presets_, which optimize your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

## Environment Variables

Load env variables on production:
https://dear-caravan-605.notion.site/Solid-FAQ-b5ae5a47f2ec47c8a78bc5671180845d#1a328989d46a8033a63cd6e94cdaea31

1. npm install -g dotenv-cli
2. npm run start

## Code Quality

### Circular Dependencies
Check for circular dependencies:
```
npx madge --circular --extensions ts,tsx src
```

### Find Large Files
To find all files in your codebase whose line count is greater than 400:
```
find . -type f -exec sh -c 'wc -l "$0" | awk "{if (\$1 > 400) print \$0}"' {} \;
```

### Fix ESLint Errors
```
npx eslint --fix src
```

## Web Server
To start the Web Server, open Mac terminal and run:
```
sudo apachectl start
```

## Super User Setup
When resetting a new super user:
1. Create a super user
2. Sync components
3. Add component properties manually
4. Add essential pages

## Permission Management
```javascript
// Check for specific permissions
const canCreateUser = await isPermission(request, PERMISSIONS.CREATE_USER, dbSession);

// Check for multiple permissions (any of them)
const canManageUsers = await isPermission(
  request, 
  [PERMISSIONS.CREATE_USER, PERMISSIONS.DELETE_USER], 
  dbSession
);

// Check for roles
const isAdmin = await checkRole(request, SYSTEM_ROLES.ADMIN, dbSession);
``` 