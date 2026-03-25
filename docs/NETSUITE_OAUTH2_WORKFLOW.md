# NetSuite OAuth2 Workflow

This document explains the current NetSuite OAuth2 flow used by the DecodeOrder Shopify app.

## 1) Configure Environment Variables

Set these variables before testing:

- `NETSUITE_ACCOUNT_ID`
- `NETSUITE_CLIENT_ID`
- `NETSUITE_CLIENT_SECRET`
- `NETSUITE_REDIRECT_URI`
- Optional: `NETSUITE_ENV` (`production` by default, `sandbox` supported)
- Optional: `NETSUITE_OAUTH_SCOPE` (`rest_webservices` by default)

## 2) Open the Integration Page

- Navigate to `/netsuite-oauth`
- The page loads current connection status by calling `netsuiteGetOAuthStatus`

## 3) Start OAuth Authorization

- Click **Connect NetSuite**
- Frontend calls `netsuiteGetOAuthAuthorizationUrl`
- Server:
  - Validates required env vars
  - Creates secure `state`
  - Saves temporary state in Neo4j (`OAuthState`)
  - Returns NetSuite authorization URL
- Browser redirects user to NetSuite consent screen

## 4) Handle Callback and Token Exchange

- NetSuite redirects back to `NETSUITE_REDIRECT_URI` with `code` and `state`
- Frontend detects callback query params and calls `netsuiteHandleOAuthCallback`
- Server:
  - Validates `state` and expiry
  - Exchanges `code` for tokens via NetSuite token endpoint
  - Encrypts access/refresh tokens
  - Stores connection data in Neo4j (`OAuthConnection`, `integrationKey: "netsuite"`)
  - Deletes used `OAuthState`

## 5) Connected State

`netsuiteGetOAuthStatus` returns:

- `connected` flag
- metadata like `accountId`, `environment`, `scope`, `tokenType`, and `expiresAt`

## 6) Disconnect

- Click **Disconnect**
- Frontend calls `netsuiteDisconnectOAuth`
- Server deletes the `OAuthConnection` record for `integrationKey: "netsuite"`

## Notes

- Token values are persisted encrypted (using existing server encryption helpers).
- OAuth state is short-lived and single-use for CSRF protection.
