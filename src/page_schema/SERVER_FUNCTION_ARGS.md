# Server Function Args Reference

Complete reference of all utilities and functions available in server functions via the `_` object.

## Table of Contents

- [Core Utilities](#core-utilities)
- [Database & Neo4j](#database--neo4j)
- [Neogma OGM Models](#neogma-ogm-models)
- [YouTube Integration](#youtube-integration)
- [Authentication & Users](#authentication--users)
- [Server Function Utilities](#server-function-utilities)
- [Cypher Query Utilities](#cypher-query-utilities)
- [Node.js Built-ins](#nodejs-built-ins)
- [Other Utilities](#other-utilities)
- [Enhanced Utilities](#enhanced-utilities)
  - [Error Handling](#error-handling)
  - [Schema Validation (Zod)](#schema-validation-zod)
  - [Pipeline/Middleware](#pipelinemiddleware)
  - [Smart Transactions](#smart-transactions)
  - [Declarative Permissions](#declarative-permissions)
  - [Response Transformers](#response-transformers)
  - [Caching Layer](#caching-layer)
  - [Background Jobs](#background-jobs)
  - [Batch Operations](#batch-operations)

---

## Core Utilities

### Session Management

```javascript
// Current database session (multi-tenant)
_.session

// Get a new session
const newSession = await _.getSession();

// Always close sessions you create!
try {
  // ... operations
} finally {
  await newSession.close();
}

// Get Neo4j driver
const driver = await _.getDriver();
```

### Context Data

```javascript
// Request data passed from client
_.contextData

// Example: accessing parameters
const { userId, action, filters } = _.contextData;

// Current subdomain (database name)
_.subDomain

// Full context object
_.context

// Function name being executed
_.functionName

// HTTP request object (if available)
_.request
```

### Graph Data

```javascript
// Node/vertex data
_.graph.nodes
_.graph.relationships

// Vertex list
_.vertexes
```

---

## Database & Neo4j

### Session Operations

```javascript
// Run Cypher query
const result = await _.session.run(query, params);

// Process results
const records = result.records.map(record => {
  return {
    id: record.get('id'),
    name: record.get('name')
  };
});

// Get single value
const count = result.records[0]?.get('count')?.toNumber() || 0;
```

### Data Conversion

```javascript
// Convert Neo4j node to JSON
const vertex = _.convertNodeToJson(node);

// Neo4j conversion utilities
const value = _.neo4jConvert.toNumber(neo4jInt);

// Neo4j driver module
const { int, Date, DateTime } = _.neo4jDriver;
```

### Execute Other Server Functions

```javascript
// Call another server function
const result = await _.executeNamedServerFunction({
  functionName: "getUserData",
  contextData: { userId: "123" }
});

// Access the result
if (result.result.success) {
  const data = result.result.data;
}
```

---

## Neogma OGM Models

Full OGM support for type-safe database operations. All model utilities are available directly via `_` - no imports required!

See `/src/lib/models/README.md` for complete documentation.

### Available Model Functions

```javascript
_.Models                  // OGM model registry
_.registerModel()         // Register models globally
_.hasModel()             // Check if model exists
_.getRegisteredModels()  // Get all model names
_.getNeogmaInstance()    // Get neogma instance
_.modelToVertex()        // Convert single instance to Vertex
_.modelsToVertices()     // Convert array to Vertex format
```

### Quick Example: Using Existing Model

```javascript
// Create
const notification = await _.Models.Notification.createOne({
  userId: "user123",
  type: "info",
  title: "Hello",
  message: "Welcome!"
}, { session: _.session });

// Convert to Vertex format (no import needed!)
const vertexFormat = _.modelToVertex(notification);

return { success: true, data: { notification: vertexFormat } };
```

### CRUD Operations

```javascript
// Create
const item = await _.Models.MyModel.createOne(data, { session: _.session });

// Read
const items = await _.Models.MyModel.findMany(
  { where: { status: "active" } },
  _.session
);

// Update
await item.update({ status: "completed" }, _.session);

// Delete
await item.delete(_.session);

// Convert for UI
return _.utils.createSuccessResponse({
  items: _.modelsToVertices(items)
});
```

### Convert to Vertex Format

```javascript
// Single instance
const vertexFormat = _.modelToVertex(notification);

// Multiple instances
const vertexArray = _.modelsToVertices(notifications);

// In response
return _.utils.createSuccessResponse({
  notification: _.modelToVertex(notification),
  notifications: _.modelsToVertices(notifications)
});
```

### Register Models Globally

Register a model once, use everywhere:

```javascript
// Import ModelFactory
const { ModelFactory } = await import("neogma");

// Get neogma instance
const neogma = await _.getNeogmaInstance();

// Check if already registered (avoid duplicates)
if (!_.hasModel("Cache")) {
  // Create model
  const CacheModel = ModelFactory({
    label: "Cache",
    schema: {
      key: { type: "string", required: true },
      value: { type: "string", required: true }
    }
  }, neogma);

  // Register globally
  _.registerModel("Cache", () => CacheModel);
}

// Now available in ALL functions via _.Models
const cache = await _.Models.Cache.findOne(
  { where: { key: "mykey" } },
  _.session
);
```

### Check Model Exists

```javascript
// Check specific model
if (!_.hasModel("MyModel")) {
  return _.utils.createErrorResponse(
    "Model not registered",
    "ModelNotFoundError"
  );
}

// Use the model
const data = await _.Models.MyModel.findMany(...);
```

### List All Models

```javascript
// Get all registered models
const allModels = _.getRegisteredModels();
console.log("Available models:", allModels);
// ["Notification", "Cache", "UserActivity", ...]
```

### Hybrid Approach (OGM + Raw Cypher)

Combine OGM for simple operations with raw Cypher for complex queries:

```javascript
// OGM for simple operations
const user = await _.Models.User.findOne(
  { where: { email } },
  _.session
);

// Raw Cypher for complex aggregations
const stats = await _.session.run(`
  MATCH (u:User {uuid: $userId})-[:OWNS]->(p:Post)
  RETURN count(p) as postCount
`, { userId: user.dataValues.uuid });

// Combine results
return _.utils.createSuccessResponse({
  user: _.modelToVertex(user),
  postCount: stats.records[0].get("postCount").toNumber()
});
```

### Global Model Registration Pattern

```javascript
// Function 1: Register (do this once)
if (!_.hasModel("Session")) {
  const { ModelFactory } = await import("neogma");
  const neogma = await _.getNeogmaInstance();

  const SessionModel = ModelFactory({
    label: "Session",
    schema: {
      sessionId: { type: "string", required: true },
      userId: { type: "string", required: true },
      expiresAt: { type: "string", required: true }
    }
  }, neogma);

  _.registerModel("Session", () => SessionModel);
}

// Function 2, 3, 4, etc.: Use anywhere
const session = await _.Models.Session.findOne(
  { where: { sessionId } },
  _.session
);
```

### Tips

1. **Always use `_.session`**: Multi-tenant architecture requires session
2. **Register once, use everywhere**: Global registration persists across function calls
3. **Check before creating**: Use `_.hasModel()` to avoid duplicate registrations
4. **Convert for UI**: Use `_.modelToVertex()` / `_.modelsToVertices()` for UI compatibility
5. **Combine approaches**: Use OGM for CRUD, raw Cypher for complex queries

### Performance

- **Lazy initialization**: Models created only when first accessed
- **Global registry**: Avoid recreating models
- **Session reuse**: Pass `_.session` to all operations
- **Connection pooling**: Driver handles connection lifecycle

---

## YouTube Integration

### OAuth & Connections

```javascript
// Get YouTube client for ownership
const youtube = await _.getYouTubeClient(ownershipId, _.session);

// Get valid token
const token = await _.getValidYouTubeToken(ownershipId, _.session);

// Check connection status
const status = await _.getYouTubeConnectionStatus(
  ownershipId,
  _.session
);

// Check if connected
const isConnected = await _.hasYouTubeConnection(
  ownershipId,
  _.session
);

// Disconnect
await _.disconnectYouTube(ownershipId, _.session);

// Get redirect URI
const redirectUri = _.getRedirectUriFromRequest(_.request);
```

### API Quota Management

```javascript
// API operation costs
const cost = _.calculateOperationCost("channels.list", { part: ["snippet"] });
const quotaCosts = _.YOUTUBE_API_COSTS;

// Quota limits
const dailyLimit = _.DAILY_QUOTA_LIMIT;
const reservationExpiry = _.RESERVATION_EXPIRY_MS;

// Log API usage
await _.logSharedAPIUsage(
  _.session,
  cost,
  "channels.list",
  ownershipId
);

// Get usage stats
const todayUsage = await _.getTodaySharedAPIUsage(_.session);
const ownershipUsage = await _.getSharedAPIUsageByOwnership(
  ownershipId,
  _.session
);

// Reserve quota
const reservation = await _.reserveQuota(
  _.session,
  cost,
  priority,
  ownershipId
);

// Release quota
await _.releaseQuota(_.session, reservation.id);

// Cleanup expired reservations
await _.cleanupExpiredReservations(_.session);
```

---

## Authentication & Users

### User Operations

```javascript
// Get current user from session
const user = await _.getUserFromSession();

// Get effective user (handles admin impersonation)
const effectiveUser = await _.getEffectiveUser(
  _.session,
  actualUser,
  _.contextData
);

// Admin impersonation
await _.setImpersonation(
  _.session,
  adminUserId,
  targetUserId
);

await _.clearImpersonation(_.session, adminUserId);
```

### Token Encryption

```javascript
// Encrypt/decrypt OAuth tokens
const encrypted = await _.encryptToken(token);
const decrypted = await _.decryptToken(encryptedToken);

// Client secret encryption
const encryptedSecret = await _.encryptClientSecret(secret);
const decryptedSecret = await _.decryptClientSecret(encryptedSecret);
```

---

## Server Function Utilities

Available via `_.utils`. All utilities from `/src/lib/utils/serverFunctionUtils.ts`.

### ID Generation

```javascript
// Generate UUID v4
const id = _.utils.generateUUID();
// "550e8400-e29b-41d4-a716-446655440000"

// Short ID (8 characters)
const shortId = _.utils.generateShortId();
// "550e8400"

// Generate key from string
const key = _.utils.generateKey("Hello World 123!");
// "hello_world_123"
```

### Date/Time

```javascript
// Current ISO timestamp
const timestamp = _.utils.now();
// "2025-12-01T10:30:00.000Z"

// Days ago
const weekAgo = _.utils.daysAgo(7);
const monthAgo = _.utils.daysAgo(30);

// Days from now
const tomorrow = _.utils.daysFromNow(1);
const nextWeek = _.utils.daysFromNow(7);

// Format date
const formatted = _.utils.formatDate(new Date());
// "2025-12-01"

// Parse and validate
const date = _.utils.parseDate("2025-12-01T10:30:00.000Z");
const isValid = _.utils.isValidDate("2025-12-01");
```

### String Operations

```javascript
// Slugify (URL-friendly)
const slug = _.utils.slugify("Hello World!");
// "hello-world"

// Truncate
const short = _.utils.truncate("Long text here", 10);
// "Long te..."

// Capitalize
const cap = _.utils.capitalize("hello");
// "Hello"

// Title case
const title = _.utils.titleCase("hello world");
// "Hello World"

// Strip HTML
const text = _.utils.stripHtml("<p>Hello</p>");
// "Hello"

// Escape HTML
const safe = _.utils.escapeHtml("<script>alert('xss')</script>");
// "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"
```

### Validation

```javascript
// Email validation
const validEmail = _.utils.isValidEmail("user@example.com");
// true

// URL validation
const validUrl = _.utils.isValidUrl("https://example.com");
// true

// UUID validation
const validUUID = _.utils.isValidUUID("550e8400-e29b-41d4-a716-446655440000");
// true

// Empty check
const isEmpty = _.utils.isEmpty("  ");
// true

// Null/undefined check
const isNull = _.utils.isNullOrUndefined(null);
// true
```

### Graph Operations

```javascript
// Create vertex
const vertex = _.utils.createVertex(
  "id123",
  ["User"],
  { name: "John", email: "john@example.com" }
);

// Create edge
const edge = _.utils.createEdge(
  "edge123",
  "FOLLOWS",
  "user1",
  "user2",
  { since: "2025-01-01" }
);

// Get property safely
const name = _.utils.getVertexProperty(vertex, "name", "Unknown");

// Check label
const isUser = _.utils.hasLabel(vertex, "User");

// Filter by label
const users = _.utils.filterByLabel(vertices, "User");
```

### Pagination

```javascript
// Calculate pagination
const pagination = _.utils.calculatePagination({
  total: 100,
  page: 2,
  limit: 10
});
// {
//   total: 100,
//   page: 2,
//   limit: 10,
//   totalPages: 10,
//   skip: 10,
//   hasNext: true,
//   hasPrev: true,
//   startIndex: 11,
//   endIndex: 20
// }

// Create paginated response
return _.utils.createPaginatedResponse({
  data: items,
  total: 100,
  page: 2,
  limit: 10,
  success: true,
  message: "Items retrieved"
});
```

### Response Helpers

```javascript
// Error response
return _.utils.createErrorResponse(
  "User not found",
  "NotFoundError",
  { userId }
);

// Success response
return _.utils.createSuccessResponse(
  { user: userData },
  "User retrieved successfully",
  { timestamp: Date.now() }
);

// Safe JSON operations
const parsed = _.utils.safeJsonParse(jsonString, {});
const stringified = _.utils.safeJsonStringify(object, "{}");
```

### Array Operations

```javascript
// Remove duplicates
const unique = _.utils.unique([1, 2, 2, 3]);
// [1, 2, 3]

// Chunk array
const chunks = _.utils.chunk([1, 2, 3, 4, 5], 2);
// [[1, 2], [3, 4], [5]]

// Group by key
const grouped = _.utils.groupBy(users, user => user.role);
// { admin: [...], user: [...] }

// Sort by key
const sorted = _.utils.sortBy(users, user => user.name, "asc");
```

### Object Operations

```javascript
// Pick keys
const picked = _.utils.pick(user, ["id", "name", "email"]);

// Omit keys
const omitted = _.utils.omit(user, ["password", "salt"]);

// Deep merge
const merged = _.utils.deepMerge(defaults, userSettings);
```

### Number Operations

```javascript
// Clamp
const clamped = _.utils.clamp(150, 0, 100);
// 100

// Format with commas
const formatted = _.utils.formatNumber(1234567);
// "1,234,567"

// Round to decimals
const rounded = _.utils.roundTo(3.14159, 2);
// 3.14

// Random integer
const random = _.utils.randomInt(1, 100);
```

### Async Operations

```javascript
// Sleep
await _.utils.sleep(1000); // Wait 1 second

// Retry with backoff
const result = await _.utils.retry(
  async () => await fetchData(),
  { maxAttempts: 3, delayMs: 1000, backoff: true }
);

// Batch execute with concurrency
const results = await _.utils.batchExecute(
  items,
  async (item) => await processItem(item),
  5 // Concurrency limit
);
```

---

## Cypher Query Utilities

Available via `_.cypher`. All utilities from `/src/lib/utils/cypherUtils.ts`.

### Query Building

```javascript
// Build WHERE clause
const { clause, params } = _.cypher.buildWhereClause(
  { userId: "123", status: "active" },
  "u"
);
// clause: "WHERE u.userId = $userId AND u.status = $status"
// params: { userId: "123", status: "active" }

// Build ORDER BY
const orderBy = _.cypher.buildOrderByClause("createdAt", "DESC", "n");
// "ORDER BY n.createdAt DESC"

// Build pagination
const { skipClause, limitClause, params: paginationParams } =
  _.cypher.buildPaginationClauses({ page: 2, limit: 10 });
// skipClause: "SKIP $skip"
// limitClause: "LIMIT $limit"
// params: { skip: 10, limit: 10 }
```

### Pattern Building

```javascript
// Build MATCH pattern
const { pattern, params } = _.cypher.buildMatchPattern(
  "User",
  "u",
  { email: "user@example.com" }
);
// pattern: "(u:User {email: $u_email})"
// params: { u_email: "user@example.com" }

// Build relationship pattern
const { pattern, params } = _.cypher.buildRelationshipPattern({
  startAlias: "u",
  endAlias: "p",
  relType: "OWNS",
  direction: "out"
});
// pattern: "(u)-[:OWNS]->(p)"
```

### Search & Text

```javascript
// Build regex pattern
const pattern = _.cypher.buildRegexPattern("search term", true);
// "(?i).*search term.*"

// Build search condition
const { condition, params } = _.cypher.buildSearchCondition(
  ["title", "description"],
  "keyword",
  "n"
);
// condition: "(n.title =~ $searchPattern OR n.description =~ $searchPattern)"
// params: { searchPattern: "(?i).*keyword.*" }

// Escape string
const safe = _.cypher.escapeCypherString("It's a test");
// "It\\'s a test"
```

### Common Queries

```javascript
// Count query
const { query, params } = _.cypher.buildCountQuery(
  "User",
  { status: "active" },
  "u"
);
const result = await _.session.run(query, params);
const count = result.records[0].get("count").toNumber();

// Exists query
const { query, params } = _.cypher.buildExistsQuery(
  "User",
  { email: "user@example.com" },
  "u"
);
const result = await _.session.run(query, params);
const exists = result.records[0].get("exists");

// Delete query
const { query, params } = _.cypher.buildDeleteQuery(
  "TempData",
  { createdAt: "<somedate>" },
  "t",
  true // detach delete
);
```

### Complete Query Builder

```javascript
const query = _.cypher.buildQuery({
  match: "(u:User {status: 'active'})",
  where: "u.age > 18",
  optionalMatch: [
    "(u)-[:OWNS]->(p:Post)"
  ],
  with: "u, count(p) as postCount",
  return: "u, postCount",
  orderBy: "ORDER BY postCount DESC",
  skip: 10,
  limit: 10
});
```

---

## Node.js Built-ins

### Crypto Module

```javascript
// Available via _.crypto
const { randomBytes, createHash, createCipheriv } = _.crypto;

// Generate random bytes
const token = _.crypto.randomBytes(32).toString('hex');

// Hash
const hash = _.crypto
  .createHash('sha256')
  .update('data')
  .digest('hex');
```

### Path Module

```javascript
// Available via _.path
const { join, basename, dirname, extname } = _.path;

// Join paths
const fullPath = _.path.join('/usr', 'local', 'bin');
// "/usr/local/bin"

// Get basename
const filename = _.path.basename('/path/to/file.txt');
// "file.txt"

// Get directory
const dir = _.path.dirname('/path/to/file.txt');
// "/path/to"

// Get extension
const ext = _.path.extname('file.txt');
// ".txt"
```

---

## Other Utilities

### BullMQ (Job Queue)

```javascript
// Available via _.bullmq
const { Queue, Worker, QueueScheduler } = _.bullmq;

// Create queue
const myQueue = new _.bullmq.Queue('my-queue');

// Add job
await myQueue.add('process-data', { userId: '123' });
```

### Email

```javascript
// Send email
await _.sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  html: "<p>Hello!</p>",
  text: "Hello!"
});
```

### Backup & Restore

```javascript
// Create database backup
const backup = await _.createDatabaseBackup(_.subDomain);

// Restore from backup
await _.restoreFromBackup(backupPath, _.subDomain);
```

---

## Enhanced Utilities

The following enhanced utilities are available to make server functions cleaner and more maintainable.

### Error Handling

Structured error classes that automatically format responses:

```javascript
// Throw specific errors
throw _.errors.Validation("Email is required");
throw _.errors.Authentication("Please log in");
throw _.errors.Forbidden("Admin access required");
throw _.errors.NotFound("User", userId);
throw _.errors.Conflict("Email already exists");
throw _.errors.RateLimit("Too many requests", 60); // retry after 60s
throw _.errors.Database("Query failed", { query });
throw _.errors.BusinessLogic("Insufficient balance", { balance });

// Check if error is AppError
if (_.isAppError(error)) {
  return error.toJSON();
}

// Convert any error to response
return _.errorToResponse(error);
```

### Schema Validation (Zod)

Type-safe runtime validation:

```javascript
// Define schema
const userSchema = _.schema.object({
  email: _.schema.email(),
  name: _.schema.string().min(2).max(100),
  age: _.schema.number().int().positive().optional()
});

// Validate
const validation = _.validate(userData, userSchema);
if (!validation.success) {
  return _.responses.badRequest(validation.error, { errors: validation.errors });
}

// Or validate and throw
const validData = _.validateOrThrow(userData, userSchema);

// Built-in patterns
const paginationSchema = _.commonSchemas.pagination;
const idSchema = _.commonSchemas.idParam;

// Schema builders
const customSchema = _.schema.object({
  userId: _.schema.uuid(),
  status: _.schema.enum(["active", "inactive"]),
  tags: _.schema.array(_.schema.string()),
  metadata: _.schema.record(_.schema.string(), _.schema.any())
});
```

### Pipeline/Middleware

Chainable operations for clean function structure:

```javascript
// Basic pipeline
const result = await _.createPipeline(_.contextData, {
  session: _.session,
  getUserFromSession: _.getUserFromSession,
})
  .validate(userSchema)           // Validate input
  .authenticate()                  // Require authentication
  .authorize("admin", "moderator") // Require roles
  .rateLimit({ max: 10, window: 60 }) // Rate limit
  .transform((data) => ({         // Transform data
    ...data,
    timestamp: Date.now()
  }))
  .custom(async (ctx) => {        // Custom middleware
    // Custom checks or processing
    if (ctx.data.amount > 1000) {
      throw _.errors.BusinessLogic("Amount exceeds limit");
    }
  })
  .execute(async (ctx) => {       // Execute main logic
    // ctx.data - validated data
    // ctx.user - authenticated user
    // ctx.metadata - metadata

    return { success: true };
  });

return result; // Auto-formatted response
```

### Smart Transactions

Auto-commit/rollback with retry logic:

```javascript
// Simple transaction (auto-commits on success, rolls back on error)
const result = await _.transaction(_.session, async (tx) => {
  const userResult = await tx.run(
    "CREATE (u:User {id: $id, name: $name}) RETURN u",
    { id: _.utils.uuid(), name: "John" }
  );

  const profileResult = await tx.run(
    "CREATE (p:Profile {userId: $userId}) RETURN p",
    { userId: userResult.records[0].get("u").properties.id }
  );

  return { user, profile };
});

// Transaction with retry (for deadlocks/timeouts)
const retryResult = await _.transactionWithRetry(
  _.session,
  async (tx) => {
    // Operations that might have transient failures
    return await someOperation(tx);
  },
  3,      // maxRetries
  1000    // retryDelay (ms)
);

// Batch transaction
const batchResult = await _.transactionBatch(_.session, [
  (tx) => tx.run("CREATE (n:Node1) RETURN n"),
  (tx) => tx.run("CREATE (n:Node2) RETURN n"),
  (tx) => tx.run("CREATE (n:Node3) RETURN n")
]);
```

### Declarative Permissions

Clean permission checking:

```javascript
// Require authentication
const { user } = await _.requirePermissions(
  { authenticated: true },
  {
    getUserFromSession: _.getUserFromSession,
    session: _.session,
    contextData: _.contextData
  }
);

// Require specific role
await _.requirePermissions(
  {
    authenticated: true,
    roles: ["admin", "moderator"]
  },
  { getUserFromSession: _.getUserFromSession, session: _.session, contextData: _.contextData }
);

// Require ownership
await _.requirePermissions(
  {
    authenticated: true,
    ownership: {
      resource: "Post",
      field: "authorId",
      resourceId: postId
    }
  },
  { getUserFromSession: _.getUserFromSession, session: _.session, contextData: _.contextData }
);

// Helper functions
const user = await _.getUserFromSession();
if (_.hasRole(user, "admin", "moderator")) { /* ... */ }
if (_.hasPermission(user, "posts.edit")) { /* ... */ }
if (_.isAdmin(user)) { /* ... */ }
const isOwner = await _.isOwner(_.session, user.P.uuid, postId, "authorId");
```

### Response Transformers

Consistent response formatting:

```javascript
// Success responses
return _.responses.ok({ user: userData });
return _.responses.created({ id: "123" }); // 201
return _.responses.noContent(); // 204

// Error responses
return _.responses.badRequest("Invalid input");
return _.responses.unauthorized();
return _.responses.forbidden();
return _.responses.notFound("User", userId);
return _.responses.conflict("Email exists");
return _.responses.serverError("Something went wrong");

// Paginated response
return _.responses.paginated(items, page, limit, total);

// Data formatters
const obj = _.formatters.vertex(vertex);
const objects = _.formatters.vertices(vertices);
const picked = _.formatters.pick(vertex, ["id", "name"]);
const omitted = _.formatters.omit(vertex, ["password"]);
const grouped = _.formatters.groupBy(items, item => item.category);
const lookup = _.formatters.keyBy(items, item => item.id);
```

### Caching Layer

In-memory cache with TTL:

```javascript
// Simple cache
_.cacheSet("user:123", userData, { ttl: 300 }); // 5 minutes
const cachedUser = _.cacheGet("user:123");
_.cacheDelete("user:123");

// With namespace
_.cacheSet("sessions", sessionData, { ttl: 3600, namespace: "auth" });
const session = _.cacheGet("sessions", { namespace: "auth" });
_.cacheClear("auth"); // Clear namespace

// Get or set (fetch if not cached)
const userData = await _.cacheGetOrSet(
  "user:" + userId,
  async () => {
    // This runs only on cache miss
    const result = await _.session.run(
      "MATCH (u:User {id: $id}) RETURN u",
      { id: userId }
    );
    return _.neo4jConvert(result.records[0].get("u"));
  },
  { ttl: 600 }
);

// Memoize function
const expensiveOp = _.cacheMemoize(
  async (userId) => await calculateStats(userId),
  { ttl: 300 }
);

// Cache manager with namespace
const userCache = _.createCacheManager("users");
userCache.set("profile:123", profileData);
const profile = userCache.get("profile:123");
userCache.clear();

// Factory
_.cache.get(key);
_.cache.set(key, value, options);
_.cache.delete(key);
_.cache.clear();
_.cache.stats(); // Get statistics
```

### Background Jobs

Simple job queue for async operations:

```javascript
// Register job handler (do this once)
_.registerJobHandler("sendWelcomeEmail", async (data, job) => {
  await _.sendEmail({
    to: data.email,
    subject: "Welcome!",
    html: `<h1>Welcome ${data.name}</h1>`
  });
  return { sent: true };
});

// Add job to queue
const jobId = await _.addJob(
  "sendWelcomeEmail",
  { email: "user@example.com", name: "John" },
  {
    priority: 5,        // Higher priority
    delay: 5000,        // Wait 5s before processing
    maxAttempts: 3      // Retry up to 3 times
  }
);

// Wait for completion
const job = await _.waitForJob(jobId, 30000); // 30s timeout

// Get status
const status = _.getJobStatus(jobId);

// Get all jobs
const pendingJobs = _.jobs.getAll("pending");
const stats = _.jobs.stats();

// Factory
_.jobs.register(name, handler);
_.jobs.add(name, data, options);
_.jobs.get(jobId);
_.jobs.wait(jobId);
_.jobs.cancel(jobId);
_.jobs.clearCompleted();
```

### Batch Operations

Process large datasets efficiently:

```javascript
// Process items in batches
const result = await _.batchProcess(
  items,
  async (item, index) => {
    // Process each item
    return await processItem(item);
  },
  {
    batchSize: 100,       // Items per batch
    concurrency: 5,       // Parallel operations
    continueOnError: true, // Continue if item fails
    onProgress: (completed, total) => {
      console.log(`Processed ${completed}/${total}`);
    }
  }
);
// result: { success, results, errors, successCount, errorCount }

// Batch create vertices
const createResult = await _.batchCreateVertices(
  _.session,
  "User",
  [
    { name: "John", email: "john@example.com" },
    { name: "Jane", email: "jane@example.com" }
  ],
  { batchSize: 100 }
);

// Batch update
await _.batchUpdateVertices(
  _.session,
  "User",
  [
    { id: "user1", updates: { name: "New Name" } },
    { id: "user2", updates: { status: "active" } }
  ]
);

// Batch delete
await _.batchDeleteVertices(_.session, "TempData", ["id1", "id2"]);

// Parallel map with concurrency
const results = await _.parallelMap(
  userIds,
  async (userId) => await fetchUser(userId),
  5 // Process 5 in parallel
);

// Process in chunks
const chunkResult = await _.processInChunks(
  largeArray,
  async (chunk, chunkIndex) => {
    // Process entire chunk
    return chunk.map(n => n * 2);
  },
  100 // Chunk size
);

// Retry with exponential backoff
const retryResult = await _.retry(
  async () => await fetchFromAPI(),
  {
    maxAttempts: 5,
    delay: 1000,
    backoff: 2,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}: ${error.message}`);
    }
  }
);

// Factory
_.batch.process(items, processor, options);
_.batch.createVertices(session, label, items);
_.batch.updateVertices(session, label, items);
_.batch.deleteVertices(session, label, ids);
_.batch.map(items, mapper, concurrency);
_.batch.chunk(array, size);
_.batch.retry(operation, options);
```

### Complete Real-World Example

Combining all enhanced utilities:

```javascript
// User management with pipeline, validation, cache, and transactions
const createUserSchema = _.schema.object({
  name: _.schema.string().min(2).max(100),
  email: _.schema.email(),
  password: _.schema.string().min(8)
});

const result = await _.createPipeline(_.contextData, {
  session: _.session,
  getUserFromSession: _.getUserFromSession,
})
  // Validate input
  .validate(createUserSchema)

  // Require admin role
  .authenticate()
  .authorize("admin")

  // Rate limit
  .rateLimit({ max: 10, window: 3600, key: "create-user" })

  // Check email doesn't exist (with cache)
  .custom(async (ctx) => {
    const exists = await _.cacheGetOrSet(
      `user:email:${ctx.data.email}`,
      async () => {
        const result = await ctx.session.run(
          "MATCH (u:User {email: $email}) RETURN u",
          { email: ctx.data.email }
        );
        return result.records.length > 0;
      },
      { ttl: 60 }
    );

    if (exists) {
      throw _.errors.Conflict("Email already exists");
    }
  })

  // Execute with transaction
  .execute(async (ctx) => {
    const result = await _.transaction(ctx.session, async (tx) => {
      // Create user
      const userResult = await tx.run(
        `CREATE (u:User {
          id: $id,
          name: $name,
          email: $email,
          password: $password,
          createdAt: $createdAt
        }) RETURN u`,
        {
          id: _.utils.uuid(),
          name: ctx.data.name,
          email: ctx.data.email,
          password: _.crypto.createHash("sha256").update(ctx.data.password).digest("hex"),
          createdAt: _.utils.now()
        }
      );

      const user = _.neo4jConvert(userResult.records[0].get("u"));

      // Send welcome email as background job
      await _.addJob("sendWelcomeEmail", {
        email: user.P.email,
        name: user.P.name
      });

      return user;
    });

    // Clear cache
    _.cacheDelete(`user:email:${ctx.data.email}`);

    // Return formatted response (omit password)
    return _.responses.created(
      _.formatters.omit(result, ["password"])
    );
  });

return result;
```

---

## Complete Example

Here's a complete example using multiple utilities:

```javascript
try {
  const { userId, page = 1, limit = 10, searchTerm } = _.contextData;

  // Validate inputs
  if (!userId || !_.utils.isValidUUID(userId)) {
    return _.utils.createErrorResponse(
      "Valid user ID is required",
      "ValidationError"
    );
  }

  // Build search condition
  const searchCondition = searchTerm
    ? _.cypher.buildSearchCondition(["title", "description"], searchTerm, "n")
    : null;

  // Build WHERE clause
  const { clause: whereClause, params: whereParams } = _.cypher.buildWhereClause(
    { userId, status: "active" },
    "n"
  );

  // Build pagination
  const { skipClause, limitClause, params: paginationParams } =
    _.cypher.buildPaginationClauses({ page, limit });

  // Combine search if needed
  const finalWhere = searchCondition
    ? `${whereClause} AND ${searchCondition.condition}`
    : whereClause;

  const finalParams = {
    ...whereParams,
    ...paginationParams,
    ...(searchCondition?.params || {})
  };

  // Count query
  const countQuery = `
    MATCH (n:Notification)
    ${finalWhere}
    RETURN count(n) as total
  `;
  const countResult = await _.session.run(countQuery, finalParams);
  const total = countResult.records[0].get("total").toNumber();

  // Data query
  const dataQuery = `
    MATCH (n:Notification)
    ${finalWhere}
    RETURN n
    ORDER BY n.createdAt DESC
    ${skipClause}
    ${limitClause}
  `;
  const dataResult = await _.session.run(dataQuery, finalParams);
  const notifications = dataResult.records.map(r => _.convertNodeToJson(r.get("n")));

  // Return paginated response
  return _.utils.createPaginatedResponse({
    data: notifications,
    total,
    page,
    limit,
    success: true,
    message: `Found ${notifications.length} notifications`
  });

} catch (error) {
  console.error("Error:", error);
  return _.utils.createErrorResponse(error, "ServerError");
}
```

---

## Summary

All utilities are organized under these namespaces in `_`:

### Core Namespaces
- **`_.utils`** - General-purpose utilities (strings, dates, arrays, etc.)
- **`_.cypher`** - Cypher query building utilities
- **`_.Models`** - Neogma OGM models
- **`_.crypto`** - Node.js crypto module
- **`_.path`** - Node.js path module

### Enhanced Utilities (New!)
- **`_.errors`** - Structured error classes (Validation, Authentication, NotFound, etc.)
- **`_.schema`** - Zod schema validation builders
- **`_.validate`** / **`_.validateOrThrow`** - Input validation
- **`_.createPipeline`** - Chainable middleware/pipeline for clean code
- **`_.transaction`** - Smart transaction helpers with auto-commit/rollback
- **`_.requirePermissions`** - Declarative permission checking
- **`_.responses`** - Response formatters (ok, created, badRequest, etc.)
- **`_.formatters`** - Data transformers (vertex, vertices, omit, pick, etc.)
- **`_.cache`** - In-memory caching with TTL
- **`_.jobs`** - Background job queue
- **`_.batch`** - Batch operations and parallel processing

### Direct Properties
- Session, context, YouTube, auth, etc.

This provides a comprehensive toolkit for building production-ready server functions with clean, maintainable code!
