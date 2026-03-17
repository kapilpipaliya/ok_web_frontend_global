# Shopify App Integration

This document describes the Shopify embedded app integration for the platform, including OAuth authentication, session management, and API access.

## Overview

The Shopify app integration provides:
- **OAuth Authentication**: Secure OAuth 2.0 flow for merchant authorization
- **Session Management**: Neo4j-based session store for persisting Shopify sessions
- **Per-Shop Databases**: Isolated Neo4j databases for each Shopify shop
- **GraphQL/REST API Access**: Full access to Shopify Admin API via GraphQL and REST

## Architecture

### Session Storage

Sessions are stored in Neo4j using a custom session store adapter (`Neo4jSessionStore`). Each shop has its own database, and sessions are stored as `ShopifySession` nodes with the following properties:

- `id`: Session ID (format: `offline_{shop}` or `{shop}_{userId}_{isOnline}`)
- `shop`: Shop domain (e.g., `example.myshopify.com`)
- `state`: OAuth state parameter
- `isOnline`: Boolean indicating online/offline session
- `scope`: OAuth scopes granted
- `accessToken`: Shopify Admin API access token
- `refreshToken`: Refresh token (if applicable)
- `expires`: Access token expiration date
- `refreshTokenExpires`: Refresh token expiration date

### Database Naming

Each shop gets its own Neo4j database following the pattern:
```
shop{normalized-shop-domain}
```

Example: `productsmanagestore.myshopify.com` → `shopproductsmanagestoremyshopifycom`

## Setup

### Environment Variables

Required environment variables:

```bash
# Shopify App Credentials
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret

# Optional
SHOPIFY_API_VERSION=2025-10  # Default: 2025-10
```

### Shopify Partner Dashboard Configuration

1. **App URL**: `https://ysaar.com/shopify`
2. **Allowed redirection URL(s)**: `https://ysaar.com/api/shopify/auth`
3. **Scopes**: `read_products`, `write_products` (configured in code)

## OAuth Flow

### 1. Initial Request (Embedded App Load)

When a merchant loads the embedded app, Shopify sends a request with query parameters:

```
?embedded=1
&hmac=...
&host=...
&id_token=...
&locale=en
&session=...
&shop=example.myshopify.com
&timestamp=...
```

**Endpoint**: Handled by `authShopifyAdminRequest` server function

**What it does**:
- Validates HMAC signature
- Creates per-shop Neo4j database if needed
- Updates HTTP session with shop information

### 2. OAuth Authorization

If the shop hasn't been authorized yet, redirect to OAuth:

```javascript
const shopify = await args.getShopifyClient();
const authUrl = await shopify.auth.begin({
  shop: "example.myshopify.com",
  callbackPath: "/api/shopify/auth",
  isOnline: false, // Use offline access for embedded apps
  rawRequest: request,
  rawResponse: response,
});
```

### 3. OAuth Callback

**Endpoint**: `GET /api/shopify/auth`

**Query Parameters**:
- `shop`: Shop domain
- `code`: Authorization code
- `state`: OAuth state parameter
- `host`: Shopify host parameter

**What it does**:
1. Exchanges authorization code for access token
2. Creates Shopify session with access token
3. Stores session in Neo4j session store
4. Updates HTTP session
5. Redirects back to `/shopify?shop=...&host=...`

## API Endpoints

### OAuth Callback

**Route**: `/api/shopify/auth`

**Method**: `GET`

**Query Parameters**:
- `shop` (required): Shop domain
- `code` (required): Authorization code
- `state` (optional): OAuth state
- `host` (optional): Shopify host

**Response**: Redirects to `/shopify` with shop and host parameters

## Server Functions

### `authShopifyAdminRequest`

**Key**: `authShopifyAdminRequest`

**Description**: Authenticates a Shopify admin app request, validates HMAC, and ensures per-shop database exists.

**Input** (`contextData`):
```javascript
{
  searchParams: {
    embedded: "1",
    hmac: "...",
    host: "...",
    id_token: "...",
    locale: "en",
    session: "...",
    shop: "example.myshopify.com",
    timestamp: "..."
  }
}
```

**Output**:
```javascript
{
  success: true,
  shop: "example.myshopify.com",
  subDomain: "shopproductsmanagestoremyshopifycom",
  message: "Shopify admin app request authenticated"
}
```

### `fetchFirst25Products`

**Key**: `fetchFirst25Products`

**Description**: Fetches the first 25 products from Shopify using Admin GraphQL API.

**Input** (`contextData`):
```javascript
{
  shop: "example.myshopify.com" // Optional, will try to get from session
}
```

**Output**:
```javascript
{
  success: true,
  shop: "example.myshopify.com",
  products: {
    edges: [
      {
        cursor: "...",
        node: {
          id: "gid://shopify/Product/...",
          title: "Product Name",
          handle: "product-handle",
          status: "ACTIVE",
          createdAt: "...",
          updatedAt: "..."
        }
      }
    ]
  }
}
```

## Usage Examples

### Calling from Client-Side Component

```javascript
// In a component's props function
props: '''
return {
  onClick: async () => {
    // Fetch products
    const response = await args.executeNamedServerFunction({
      functionName: "fetchFirst25Products",
      contextData: {
        shop: args.searchParams?.shop
      }
    });
    
    if (response.result?.success) {
      console.log("Products:", response.result.products);
    } else {
      console.error("Error:", response.result?.error);
    }
  }
};
'''
```

### Using Shopify Client Directly

```javascript
// In a server function
const shopify = await args.getShopifyClient();
const sessionStore = args.getNeo4jSessionStore();

// Get session
const sessionId = shopify.session.getOfflineId(shop);
const session = await sessionStore.loadSession(sessionId);

// Create GraphQL client
const graphqlClient = new shopify.clients.Graphql({ session });

// Make GraphQL query
const query = `
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

const { data, errors } = await graphqlClient.request(query, {});
```

## Helper Functions

### `getShopifyClient()`

Returns the configured Shopify API object. This is a singleton instance with Neo4j session store configured.

**Usage**:
```javascript
const shopify = await args.getShopifyClient();
```

### `getNeo4jSessionStore()`

Returns the Neo4j session store instance for direct session management.

**Usage**:
```javascript
const sessionStore = args.getNeo4jSessionStore();
const session = await sessionStore.loadSession(sessionId);
await sessionStore.storeSession(session);
await sessionStore.deleteSession(sessionId);
```

### `verifyShopifyAdminRequest(params)`

Validates Shopify admin app request using HMAC signature.

**Usage**:
```javascript
const { valid, shop, error } = args.verifyShopifyAdminRequest(searchParams);
```

### `getDatabaseNameForShop(shop)`

Converts shop domain to Neo4j database name.

**Usage**:
```javascript
const dbName = args.getDatabaseNameForShop("example.myshopify.com");
// Returns: "shopproductsmanagestoremyshopifycom"
```

### `ensureShopDatabaseAndMigrate(shop, options)`

Ensures a Neo4j database exists for the shop and optionally runs migration.

**Usage**:
```javascript
const { dbSession, subDomain } = await args.ensureShopDatabaseAndMigrate(shop, {
  dryRun: false,
  contextData: { ... }
});
```

### `getDBSessionForShop(shop)`

Gets a Neo4j database session for an authenticated shop.

**Usage**:
```javascript
const { dbSession, subDomain } = await args.getDBSessionForShop(shop);
```

## Session Management

### Loading Sessions

Sessions are automatically loaded by the Shopify API when using:
- `shopify.session.getCurrentId()` - Gets session ID from request
- `shopify.session.customAppSession(shop)` - Creates/gets offline session

The session store is configured in `getShopifyClient()`, so sessions are automatically persisted and loaded.

### Storing Sessions

Sessions are stored automatically during:
- OAuth callback (`/api/shopify/auth`)
- Any session updates via Shopify API

You can also manually store sessions:
```javascript
const sessionStore = args.getNeo4jSessionStore();
await sessionStore.storeSession(session);
```

## Error Handling

### Missing Access Token

If a session doesn't have an access token, it means OAuth hasn't been completed. The error message will indicate:

```
"Shopify access token is missing. Ensure the shop is authenticated via OAuth flow. The session should be stored in Neo4j during OAuth callback."
```

**Solution**: Complete the OAuth flow by redirecting to the OAuth begin endpoint.

### Invalid HMAC

If HMAC validation fails, check:
1. `SHOPIFY_API_SECRET` is correctly set
2. Query parameters are not modified
3. Request is coming from Shopify

## Troubleshooting

### Session Not Found

**Problem**: `fetchFirst25Products` returns "Shopify access token is missing"

**Solutions**:
1. Check if OAuth callback completed successfully
2. Verify session exists in Neo4j: `MATCH (s:ShopifySession {shop: "example.myshopify.com"}) RETURN s`
3. Ensure session store is properly configured

### Database Not Created

**Problem**: Shop database doesn't exist

**Solution**: The database is created automatically during `authShopifyAdminRequest`. Check:
1. Neo4j connection is working
2. Database name is valid (no special characters)
3. Sufficient permissions to create databases

### OAuth Callback Fails

**Problem**: `/api/shopify/auth` returns error

**Common causes**:
1. Invalid authorization code (expired or already used)
2. Shop parameter missing
3. Session store failure
4. Network issues with Shopify API

**Debug**: Check server logs for detailed error messages.

## File Structure

```
src/
├── lib/
│   └── shopify/
│       ├── shopifyHelpers.ts          # Main helper functions
│       └── neo4jSessionStore.ts        # Neo4j session store adapter
├── routes/
│   └── api/
│       └── shopify/
│           └── auth.ts                 # OAuth callback endpoint
└── page_schema/
    └── ytorganizer/
        ├── functions/
        │   └── shopify/
        │       ├── authShopifyAdminRequest.hjson
        │       └── fetchFirst25Products.hjson
        ├── pages/
        │   └── shopify/
        │       └── ShopifyApp.hjson
        └── components/
            └── shopify/
                └── ShopifyLayout.hjson
```

## Security Considerations

1. **HMAC Validation**: All requests from Shopify are validated using HMAC signatures
2. **Session Storage**: Access tokens are stored securely in Neo4j (encrypted at rest if Neo4j encryption is enabled)
3. **Per-Shop Isolation**: Each shop has its own database, ensuring data isolation
4. **Token Expiration**: Access tokens expire and should be refreshed using refresh tokens

## Next Steps

1. **Implement OAuth Begin Endpoint**: Create endpoint to initiate OAuth flow
2. **Add More API Functions**: Create additional server functions for other Shopify operations
3. **Webhook Support**: Implement webhook handlers for real-time updates
4. **Token Refresh**: Implement automatic token refresh for expired tokens

## References

- [Shopify App Development](https://shopify.dev/docs/apps)
- [Shopify Admin API](https://shopify.dev/docs/api/admin-graphql)
- [OAuth for Apps](https://shopify.dev/docs/apps/auth/oauth)
- [Session Management](https://shopify.dev/docs/apps/auth/session-management)


