/**
 * Shopify Server Configuration
 *
 * This file configures and initializes the Shopify App React Router server utilities.
 * It sets up authentication, session storage, API versioning, and other core
 * Shopify app functionality.
 *
 * This is the central configuration file that other parts of the app import
 * to access Shopify authentication, API clients, and other utilities.
 */

// Import the Node.js adapter for Shopify App React Router
// This adapter enables the Shopify app to run on Node.js servers
// Different adapters exist for different runtime environments (Node, Deno, etc.)
import "@shopify/shopify-app-react-router/adapters/node";

// Shopify App React Router server utilities
// ApiVersion: Enum containing available Shopify API versions
// AppDistribution: Enum for app distribution types (AppStore, SingleMerchant, etc.)
// shopifyApp: Main function to create and configure a Shopify app instance
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";

// Prisma session storage adapter
// PrismaSessionStorage: Stores OAuth sessions in a database using Prisma
// This allows sessions to persist across server restarts
import { Neo4jSessionStore } from "./neo4jSessionStore";
import { getNeo4jSessionStore } from "./neo4jSessionStore";

// Prisma database client
// prisma: The Prisma client instance for database operations

/**
 * Shopify App Configuration
 * https://shopify.dev/docs/api/shopify-app-react-router/latest/entrypoints/shopifyapp
 *
 * Creates and configures the main Shopify app instance.
 * This configuration object defines how the app authenticates, stores sessions,
 * and interacts with Shopify's APIs.
 */
const shopify = shopifyApp({
  // API Key: Identifies your app to Shopify
  // Found in your Partner Dashboard under App Setup
  // Required for OAuth and App Bridge initialization
  apiKey: process.env.SHOPIFY_API_KEY,

  // API Secret Key: Used to verify webhook signatures and OAuth requests
  // Found in your Partner Dashboard under App Setup
  // Keep this secret - never expose it in client-side code
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",

  // API Version: The version of Shopify's Admin API to use
  // Using October25 (latest stable version at time of template creation)
  // API versions are deprecated over time, so update periodically
  apiVersion: ApiVersion.October25,

  // Scopes: Permissions the app requests from merchants
  // Split from comma-separated string in environment variable
  // Common scopes: read_products, write_products, read_orders, etc.
  // See: https://shopify.dev/docs/api/usage/access-scopes
  scopes: ["read_products", "write_content", "write_metaobjects", "write_online_store_navigation", "write_products"], // process.env.SCOPES?.split(","),

  // App URL: The public URL where your app is hosted
  // Used for OAuth redirects and webhook URLs
  // Format: https://your-app-domain.com
  appUrl: process.env.SHOPIFY_APP_URL || "",

  // Auth Path Prefix: URL prefix for authentication routes
  // All auth routes will be under /auth/* (e.g., /auth/login, /auth/callback)
  authPathPrefix: "/auth",

  // Session Storage: Where OAuth sessions are stored
  // Using Prisma to store sessions in a database
  // This allows sessions to persist across server restarts
  sessionStorage: getNeo4jSessionStore(),

  // Distribution: How the app is distributed
  // AppStore: Available in the Shopify App Store (public)
  // SingleMerchant: Private app for a single merchant
  distribution: AppDistribution.AppStore,

  // Future flags: Enable upcoming features
  // expiringOfflineAccessTokens: Tokens will expire and need refresh
  // This improves security by limiting token lifetime
  future: {
    expiringOfflineAccessTokens: true,
  },

  // Custom Shop Domains: Allow custom domains (not just *.myshopify.com)
  // Only set if SHOP_CUSTOM_DOMAIN environment variable is provided
  // This is useful for Shopify Plus merchants with custom domains
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

// Export the configured Shopify app instance
// This is the main object that provides all Shopify functionality
export default shopify;

// Export the API version for use in other parts of the app
// Useful when making direct API calls or checking API compatibility
export const apiVersion = ApiVersion.October25;

// Export utility functions from the Shopify app instance
// These are commonly used throughout the app

// addDocumentResponseHeaders: Adds required HTTP headers for embedded apps
// Used in entry.server.tsx to add CSP and other security headers
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;

// authenticate: Main authentication utility
// Provides methods to authenticate requests (admin, webhook, etc.)
// Used in route loaders/actions to verify user sessions
export const authenticate = shopify.authenticate;

// unauthenticated: For routes that don't require authentication
// Allows accessing Shopify APIs without a user session (e.g., public endpoints)
export const unauthenticated = shopify.unauthenticated;

// login: Handles the OAuth login flow
// Processes shop domain input and redirects to Shopify OAuth
// Used in /auth/login route
export const login = shopify.login;

// registerWebhooks: Registers webhook subscriptions with Shopify
// Call this during app installation to set up webhook endpoints
export const registerWebhooks = shopify.registerWebhooks;

// sessionStorage: Access to the session storage instance
// Allows direct database operations on sessions if needed
export const sessionStorage = shopify.sessionStorage;
