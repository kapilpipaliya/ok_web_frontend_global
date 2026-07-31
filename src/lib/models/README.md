# Neogma OGM Models Guide

This directory contains Neogma Object-Graph Mapping (OGM) models for type-safe database operations.

## Table of Contents

- [When to Use OGM vs Raw Cypher](#when-to-use-ogm-vs-raw-cypher)
- [Quick Start](#quick-start)
- [Creating a New Model](#creating-a-new-model)
- [Using Models in Server Functions](#using-models-in-server-functions)
- [Creating Models in hjson Functions](#creating-models-in-hjson-functions)
- [Hybrid Approach](#hybrid-approach-ogm--raw-cypher)
- [Session Management](#session-management)
- [Converting Between OGM and Vertex Format](#converting-between-ogm-and-vertex-format)
- [Best Practices](#best-practices)
- [Examples](#examples)

## When to Use OGM vs Raw Cypher

### ✅ Use Neogma OGM For:

**Simple CRUD Operations:**
- Creating, reading, updating, deleting single entities
- Finding entities by ID or unique properties
- Direct relationship traversal (one level deep)
- Type-safe data access with IDE autocompletion

**Examples:**
```typescript
// Create a notification
const notification = await Models.Notification.createOne({
  userId: "user123",
  type: "info",
  title: "Welcome!",
  message: "Thanks for joining",
  read: false
}, { session });

// Find by ID
const notification = await Models.Notification.findOne(
  { where: { id: "notif123" } },
  session
);

// Update
await notification.update({ read: true }, session);

// Delete
await notification.delete(session);
```

### ❌ Use Raw Cypher For:

**Complex Operations:**
- Multi-step graph traversals
- Aggregations (COUNT, SUM, AVG)
- Dynamic query building with optional filters
- Graph algorithms and pattern matching
- Bulk operations (batch creates/updates)
- Performance-critical queries
- Business logic with multiple conditions

**Examples:**
```typescript
// Complex aggregation - use raw Cypher
const stats = await session.run(`
  MATCH (c:Channel)-[:ChannelPlaylist]->(p:Playlist)
  WHERE c.ownershipId = $ownershipId
  OPTIONAL MATCH (p)-[:PlaylistVideo]->(v:Video)
  RETURN
    count(DISTINCT p) as playlistCount,
    count(DISTINCT v) as videoCount,
    sum(v.viewCount) as totalViews
`, { ownershipId });

// Dynamic filtering - use raw Cypher
const channelIdFilter = channelIds.length > 0
  ? 'AND c.youtubeId IN $channelIds'
  : '';
const query = `
  MATCH (c:Channel)
  WHERE 1=1 ${channelIdFilter}
  RETURN c
`;
```

## Quick Start

### 1. Import Models Registry

```typescript
// In TypeScript files
import { Models } from "~/lib/models";

// In hjson server functions
const { Models } = await import("~/lib/models");
```

### 2. Use in Server Functions

Models are automatically available in all server functions via `_.Models`:

```javascript
// In hjson server function body
const notification = await _.Models.Notification.findByUserId(
  c.userId,
  { session: _.session, unreadOnly: true }
);
```

### 3. Always Pass Session

**CRITICAL:** Always pass session to model methods for multi-tenant architecture:

```typescript
// ✅ Correct - session provided
const result = await Models.Notification.createOne(data, { session });

// ❌ Wrong - will throw error
const result = await Models.Notification.createOne(data);
```

## Creating a New Model

### 1. Create Model File

Create a new file in `/src/lib/models/[category]/[ModelName]Model.ts`:

```typescript
import { ModelFactory } from "neogma";
import type { Session } from "neo4j-driver";
import { now, withTimestamps } from "../base/BaseModel";

// 1. Define Properties Interface
export interface UserProperties {
  id?: string;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// 2. Define Relationships Interface
export interface UserRelationships {
  // Add relationships to other models
}

// 3. Define Static Methods Interface
export interface UserStatics {
  findByEmail(email: string, session: Session): Promise<UserInstance | null>;
}

// 4. Define Instance Methods Interface
export interface UserMethods {
  updateProfile(data: { name?: string }, session: Session): Promise<void>;
}

// 5. Create Model Factory
let UserModel: ReturnType<typeof createUserModel>;

function createUserModel() {
  const neogma = global.__neo4jDriverState?.neogmaInstance;

  if (!neogma) {
    throw new Error("Neogma instance not initialized");
  }

  const model = ModelFactory<
    UserProperties,
    UserRelationships,
    UserStatics,
    UserMethods
  >(
    {
      label: "User",
      schema: {
        email: { type: "string", required: true },
        name: { type: "string", required: true },
        createdAt: { type: "string", required: false },
        updatedAt: { type: "string", required: false },
      },
      primaryKeyField: "email",
      relationships: {},
    },
    neogma
  );

  // 6. Implement Static Methods
  model.findByEmail = async (email, session) => {
    return await model.findOne({ where: { email } }, session);
  };

  // 7. Implement Instance Methods
  model.prototype.updateProfile = async function(data, session) {
    const updates = { ...data, updatedAt: now() };
    await this.update(updates, session);
  };

  return model;
}

// 8. Export Lazy Initialization
export function getUserModel() {
  if (!UserModel) {
    UserModel = createUserModel();
  }
  return UserModel;
}

// 9. Export Types
export type UserInstance = InstanceType<typeof UserModel>;
export type UserModelType = typeof UserModel;
```

### 2. Register in Models Registry

Add to `/src/lib/models/index.ts`:

```typescript
import { getUserModel } from "./user/UserModel";

export const Models = {
  // ... existing models

  get User() {
    return getUserModel();
  },
};

// Export types
export type { UserProperties, UserInstance } from "./user/UserModel";
```

## Using Models in Server Functions

### In hjson Server Functions

```hjson
{
  vertexes: [
    {
      id: "fn1",
      L: "Function",
      P: {
        key: "createUserNotification",
        description: "Create a notification for a user",
        body: '''
try {
  const { userId, title, message, type = "info" } = c;

  // Validate inputs
  if (!userId || !title || !message) {
    return {
      success: false,
      error: "Missing required fields"
    };
  }

  // Use OGM to create notification
  const notification = await _.Models.Notification.createOne({
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, { session: _.session });

  return {
    success: true,
    data: {
      id: notification.id,
      ...notification.dataValues
    }
  };

} catch (error) {
  console.error("Error creating notification:", error);
  return {
    success: false,
    error: error.message
  };
}
'''
      }
    }
  ],
  edges: []
}
```

### In TypeScript Files

```typescript
import { Models } from "~/lib/models";
import { getDriver } from "~/cypher/core/driver";

export async function sendNotificationToUser(
  userId: string,
  title: string,
  message: string,
  subdomain: string
) {
  const driver = await getDriver();
  const session = driver.session({ database: subdomain });

  try {
    // Create notification using OGM
    const notification = await Models.Notification.createOne({
      userId,
      type: "info",
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { session });

    return {
      success: true,
      notificationId: notification.id
    };
  } finally {
    await session.close();
  }
}
```

## Creating Models in hjson Functions

If you need a model that doesn't exist yet, you can create models dynamically within hjson server functions. This is useful for rapid prototyping or one-off models.

### Dynamic Model Creation Pattern (Local Use)

Create a model for use within a single function:

```javascript
// In hjson function body
try {
  // Import ModelFactory from neogma
  const { ModelFactory } = await import("neogma");

  // Get neogma instance (now via _!)
  const neogma = await _.getNeogmaInstance();

  // Create temporary model
  const TempDataModel = ModelFactory(
    {
      label: "TempData",
      schema: {
        key: { type: "string", required: true },
        value: { type: "string", required: true },
        expiresAt: { type: "string", required: false }
      },
      primaryKeyField: "key"
    },
    neogma
  );

  // Use the model
  const tempData = await TempDataModel.createOne({
    key: c.key,
    value: c.value,
    expiresAt: _.utils.daysFromNow(7)
  }, { session: _.session });

  return {
    success: true,
    data: tempData.dataValues
  };

} catch (error) {
  return _.utils.createErrorResponse(error);
}
```

### Register Models Globally (Recommended for Reuse)

Register a model in the global registry so it's available in ALL server functions via `_.Models`:

```javascript
// In hjson function body
try {
  // Import ModelFactory
  const { ModelFactory } = await import("neogma");

  // Get neogma instance
  const neogma = await _.getNeogmaInstance();

  // Check if already registered (avoid recreating)
  if (!_.hasModel("Cache")) {
    // Create model
    const CacheModel = ModelFactory({
      label: "Cache",
      schema: {
        key: { type: "string", required: true },
        value: { type: "string", required: true },
        expiresAt: { type: "string", required: true }
      },
      primaryKeyField: "key"
    }, neogma);

    // Register globally
    _.registerModel("Cache", () => CacheModel);

    console.log("Cache model registered globally");
  }

  // Now use via _.Models (available in ALL functions!)
  const cacheEntry = await _.Models.Cache.createOne({
    key: c.cacheKey,
    value: _.utils.safeJsonStringify(c.data),
    expiresAt: _.utils.daysFromNow(1)
  }, { session: _.session });

  return _.utils.createSuccessResponse({
    cached: true,
    key: cacheEntry.dataValues.key,
    expiresAt: cacheEntry.dataValues.expiresAt
  });

} catch (error) {
  return _.utils.createErrorResponse(error);
}
```

### Using Registered Models in Other Functions

Once registered, the model is available everywhere:

```javascript
// In a different hjson function
try {
  // Check if model exists
  if (!_.hasModel("Cache")) {
    return _.utils.createErrorResponse(
      "Cache model not registered",
      "ModelNotFoundError"
    );
  }

  // Use the registered model
  const cached = await _.Models.Cache.findOne(
    { where: { key: c.key } },
    _.session
  );

  if (cached) {
    return _.utils.createSuccessResponse({
      value: _.utils.safeJsonParse(cached.dataValues.value, null)
    }, "Cache hit");
  }

  return _.utils.createSuccessResponse(null, "Cache miss");

} catch (error) {
  return _.utils.createErrorResponse(error);
}
```

### Check All Registered Models

```javascript
// Get list of all models
const allModels = _.getRegisteredModels();
console.log("Registered models:", allModels);
// ["Notification", "Cache", "CustomModel", ...]

// Check specific model
if (_.hasModel("Cache")) {
  console.log("Cache model is available");
}
```

### When to Use Dynamic Models

**✅ Use dynamic models for:**
- Temporary/experimental features
- One-off data operations
- Rapid prototyping
- Models that won't be reused

**❌ Don't use dynamic models for:**
- Frequently used models (create proper TypeScript models instead)
- Models needing complex relationships
- Models requiring extensive static/instance methods
- Production features (use registered models in `/src/lib/models/`)

### Example: Global Cache Model Registration

```hjson
{
  vertexes: [
    {
      id: "fn1",
      L: "Function",
      P: {
        key: "registerCacheModel",
        description: "Register Cache model globally for reuse across all functions",
        body: '''
const { ModelFactory } = await import("neogma");

// Get neogma instance via _
const neogma = await _.getNeogmaInstance();

// Check if already registered
if (!_.hasModel("Cache")) {
  // Create cache model
  const CacheModel = ModelFactory({
    label: "Cache",
    schema: {
      key: { type: "string", required: true },
      value: { type: "string", required: true },
      expiresAt: { type: "string", required: true }
    },
    primaryKeyField: "key"
  }, neogma);

  // Register globally
  _.registerModel("Cache", () => CacheModel);

  return _.utils.createSuccessResponse(
    { registered: true },
    "Cache model registered successfully"
  );
}

return _.utils.createSuccessResponse(
  { registered: false },
  "Cache model was already registered"
);
'''
      }
    },
    {
      id: "fn2",
      L: "Function",
      P: {
        key: "cacheData",
        description: "Use globally registered Cache model",
        body: '''
// Cache model should be registered first via registerCacheModel function
if (!_.hasModel("Cache")) {
  return _.utils.createErrorResponse(
    "Cache model not registered. Call registerCacheModel first.",
    "ModelNotFoundError"
  );
}

// Use the registered model
const cacheEntry = await _.Models.Cache.createOne({
  key: c.cacheKey,
  value: _.utils.safeJsonStringify(c.data),
  expiresAt: _.utils.daysFromNow(1)
}, { session: _.session });

return _.utils.createSuccessResponse({
  cached: true,
  key: cacheEntry.dataValues.key,
  expiresAt: cacheEntry.dataValues.expiresAt
});
'''
      }
    }
  ],
  edges: []
}
```

### Important Notes

1. **No Type Safety**: Dynamic models don't have TypeScript type checking
2. **No Persistence**: Model definition is recreated on each function call
3. **No Global Access**: Model only exists within that function execution
4. **Session Required**: Always pass session to all operations
5. **For Production**: Move to `/src/lib/models/` and register in `index.ts`

## Hybrid Approach: OGM + Raw Cypher

The most powerful pattern is combining OGM for simple operations with raw Cypher for complex queries:

```typescript
export async function getUserDashboardStats(
  userId: string,
  subdomain: string
) {
  const driver = await getDriver();
  const session = driver.session({ database: subdomain });

  try {
    // Use OGM for simple queries
    const unreadCount = await Models.Notification.getUnreadCount(
      userId,
      session
    );

    // Use raw Cypher for complex aggregations
    const channelStats = await session.run(`
      MATCH (u:User {uuid: $userId})-[:UserYouTubeOwnership]->(o:YouTubeOwnership)
      MATCH (o)-[:YouTubeOwnershipChannel]->(c:Channel)
      OPTIONAL MATCH (c)-[:ChannelPlaylist]->(p:Playlist)
      OPTIONAL MATCH (p)-[:PlaylistVideo]->(v:Video)
      RETURN
        count(DISTINCT c) as channelCount,
        count(DISTINCT p) as playlistCount,
        count(DISTINCT v) as videoCount,
        sum(v.viewCount) as totalViews
    `, { userId });

    const stats = channelStats.records[0];

    return {
      success: true,
      data: {
        notifications: {
          unread: unreadCount
        },
        youtube: {
          channels: stats.get("channelCount").toNumber(),
          playlists: stats.get("playlistCount").toNumber(),
          videos: stats.get("videoCount").toNumber(),
          totalViews: stats.get("totalViews")?.toNumber() || 0
        }
      }
    };
  } finally {
    await session.close();
  }
}
```

## Session Management

### Always Provide Session

The application uses a multi-tenant architecture where each subdomain has its own database. You **MUST** always provide a session:

```typescript
// ✅ Correct
const notification = await Models.Notification.findOne(
  { where: { id } },
  session  // Required!
);

// ❌ Wrong - will throw error
const notification = await Models.Notification.findOne(
  { where: { id } }
);
```

### Session Lifecycle

1. **In Server Functions**: Session is provided via `_.session`
   ```javascript
   const result = await _.Models.Notification.createOne(data, {
     session: _.session
   });
   ```

2. **In TypeScript Files**: Create and close sessions manually
   ```typescript
   const driver = await getDriver();
   const session = driver.session({ database: subdomain });

   try {
     // ... operations
   } finally {
     await session.close();  // Always close!
   }
   ```

## Converting Between OGM and Vertex Format

The UI components expect data in Vertex format (with `P` field for properties). Convert OGM results using the helper functions:

### Single Instance

```typescript
import { modelToVertex } from "~/lib/models";

const notification = await Models.Notification.findOne(
  { where: { id } },
  session
);

// Convert to Vertex format
const vertexFormat = modelToVertex<NotificationProperties>(notification);

// Now has structure: { id, L, P, IN, OUT }
// Access properties via: vertexFormat.P.title
```

### Multiple Instances

```typescript
import { modelsToVertices } from "~/lib/models";

const notifications = await Models.Notification.findByUserId(
  userId,
  { session }
);

// Convert array to Vertex format
const vertexArray = modelsToVertices<NotificationProperties>(notifications);

// Each item: { id, L, P, IN, OUT }
```

### In Server Functions (Recommended)

**No import needed!** These functions are available directly via `_`:

```javascript
// In hjson function body
const notification = await _.Models.Notification.findOne(
  { where: { id: c.notificationId } },
  _.session
);

// Use _.modelToVertex (no import needed!)
const vertexFormat = _.modelToVertex(notification);

return {
  success: true,
  data: {
    notification: vertexFormat  // UI-compatible format
  }
};

// For multiple instances
const notifications = await _.Models.Notification.findByUserId(
  userId,
  { session: _.session }
);

const vertexArray = _.modelsToVertices(notifications);
```

## Best Practices

### 1. Type Safety

Always define proper TypeScript interfaces for properties, relationships, and methods:

```typescript
// ✅ Good: Type-safe
interface NotificationProperties {
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
}

// ❌ Bad: No type safety
interface NotificationProperties {
  [key: string]: any;
}
```

### 2. Lazy Initialization

Always use the lazy initialization pattern to avoid circular dependencies:

```typescript
let MyModel: ReturnType<typeof createMyModel>;

export function getMyModel() {
  if (!MyModel) {
    MyModel = createMyModel();
  }
  return MyModel;
}
```

### 3. Session Validation

Use the helper to validate sessions in static methods:

```typescript
import { requireSession } from "../base/types";

model.findByUserId = async (userId, session) => {
  requireSession(session);  // Throws error if invalid
  // ... continue with query
};
```

### 4. Timestamps

Use the timestamp helpers for consistent date handling:

```typescript
import { withTimestamps, touchTimestamp } from "../base/BaseModel";

// On create
const data = withTimestamps({ userId, title, message });
await model.createOne(data, { session });

// On update
const updates = touchTimestamp({ title: "New Title" });
await instance.update(updates, session);
```

### 5. Error Handling

Use the ModelError class for consistent error handling:

```typescript
import { ModelError, ErrorCodes } from "../base/BaseModel";

if (!session) {
  throw new ModelError(
    "Session is required",
    ErrorCodes.SESSION_REQUIRED
  );
}

if (!userId) {
  throw new ModelError(
    "User ID is required",
    ErrorCodes.VALIDATION_ERROR
  );
}
```

### 6. Return Vertex Format for UI

When returning data to the frontend, convert to Vertex format:

```typescript
const notifications = await Models.Notification.findByUserId(
  userId,
  { session }
);

// Convert to Vertex format for UI compatibility
const vertexArray = modelsToVertices<NotificationProperties>(notifications);

return {
  success: true,
  data: {
    notifications: vertexArray  // UI expects Vertex format
  }
};
```

## Examples

### Example 1: User Notification System

See `/src/lib/models/example/NotificationModel.ts` for a complete example including:
- Properties, relationships, and methods interfaces
- Static methods (findByUserId, markAllAsReadForUser, getUnreadCount)
- Instance methods (markAsRead, delete, updateContent)
- Proper session handling
- Type safety throughout

### Example 2: Create and Read

```typescript
// Create
const notification = await Models.Notification.createOne({
  userId: "user123",
  type: "success",
  title: "Welcome!",
  message: "Your account is ready",
  read: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}, { session });

// Read
const unread = await Models.Notification.findByUserId(
  "user123",
  { session, unreadOnly: true }
);
```

### Example 3: Update and Delete

```typescript
// Update using instance method
const notification = await Models.Notification.findOne(
  { where: { id: "notif123" } },
  session
);
await notification.markAsRead(session);

// Update using model method
await notification.updateContent({
  title: "Updated Title",
  message: "Updated Message"
}, session);

// Delete
await notification.delete(session);
```

### Example 4: Bulk Operations with Raw Cypher

```typescript
// When you need bulk operations, use raw Cypher
const result = await session.run(`
  MATCH (n:Notification {userId: $userId, read: false})
  SET n.read = true, n.updatedAt = $updatedAt
  RETURN count(n) as count
`, {
  userId: "user123",
  updatedAt: new Date().toISOString()
});

const count = result.records[0].get("count").toNumber();
```

### Example 5: Mixed Approach in Server Function

```hjson
{
  vertexes: [
    {
      id: "fn1",
      L: "Function",
      P: {
        key: "getUserNotifications",
        body: '''
const userId = c.userId;

// Use OGM for simple query
const notifications = await _.Models.Notification.findByUserId(
  userId,
  { session: _.session, limit: 10 }
);

// Use raw Cypher for count
const countResult = await _.session.run(`
  MATCH (n:Notification {userId: $userId})
  RETURN count(n) as total, sum(CASE WHEN n.read = false THEN 1 ELSE 0 END) as unread
`, { userId });

const stats = countResult.records[0];

// Convert to Vertex format for UI
const { modelsToVertices } = await import("~/lib/models");
const vertexArray = modelsToVertices(notifications);

return {
  success: true,
  data: {
    notifications: vertexArray,
    total: stats.get("total").toNumber(),
    unread: stats.get("unread").toNumber()
  }
};
'''
      }
    }
  ],
  edges: []
}
```

## Summary

- **Use OGM** for simple CRUD operations and type-safe data access
- **Use Raw Cypher** for complex queries, aggregations, and dynamic filtering
- **Always provide session** for multi-tenant architecture
- **Convert to Vertex format** when returning data to UI
- **Follow the examples** in NotificationModel.ts for best practices

The hybrid approach gives you the best of both worlds: type safety and simplicity from OGM, power and flexibility from raw Cypher.
