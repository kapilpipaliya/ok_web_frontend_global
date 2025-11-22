/**
 * YouTube OAuth Manager - Multi-Ownership Support
 *
 * Handles OAuth flow, token storage, and token refresh for YouTube API access.
 * Supports multiple YouTube account connections per user (multi-ownership).
 *
 * Architecture:
 * - User can connect multiple YouTube accounts (ownerships)
 * - Each ownership has its own OAuth token and manages its own channels/playlists
 * - Ownership relationships: User -[UserYouTubeOwnership]-> YouTubeOwnership -[YouTubeOwnershipToken]-> YouTubeToken
 */

import { google } from "googleapis";
import type { Session } from "neo4j-driver";
import neo4j from "neo4j-driver";
import {
  encryptToken,
  decryptToken,
  decryptClientSecret,
} from "~/lib/auth/tokenEncryption";
import { randomUUID } from "crypto";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import {
  logSharedAPIUsage,
  YOUTUBE_API_COSTS,
} from "~/lib/youtube/apiUsageTracking";

const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly", // readonly YouTube access
  "https://www.googleapis.com/auth/youtube", // full YouTube access
];

/**
 * Get OAuth2 client configuration from database
 */
async function getOAuthConfig(
  session: Session,
  redirectUri: string,
): Promise<{
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}> {
  const result = await session.run(`
    MATCH (s:Setting {type: 'oauth'})
    WHERE s.googleEnabled = true
    RETURN s.googleClientId as clientId,
           s.googleClientSecret as clientSecret
    LIMIT 1
  `);

  if (result.records.length === 0) {
    throw new Error(
      "YouTube OAuth is not configured. Please configure OAuth settings in admin panel.",
    );
  }

  const record = result.records[0];
  const clientId = record.get("clientId");
  const clientSecretEncrypted = record.get("clientSecret");

  if (!clientId || !clientSecretEncrypted) {
    throw new Error(
      "Incomplete OAuth configuration. Please check admin settings.",
    );
  }

  // Decrypt client secret
  const clientSecret = decryptClientSecret(clientSecretEncrypted);

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

/**
 * Construct redirect URI from request
 * For background workers without request, uses environment variable or default
 *
 * @param request - Optional request object
 * @param callbackPath - Callback path (default: '/api/auth/youtube/callback')
 */
export function getRedirectUriFromRequest(
  request?: Request,
  callbackPath: string = "/api/auth/youtube/callback"
): string {
  // If no request provided (background workers), use environment or default
  if (!request) {
    return process.env.APP_URL
      ? `${process.env.APP_URL}${callbackPath}`
      : `https://localhost:3001${callbackPath}`;
  }

  const url = new URL(request.url);

  // Use HTTPS by default
  // Only use HTTP for plain 'localhost' (without domain)
  const protocol = url.hostname === "localhost" ? url.protocol : "https:";

  // Construct the redirect URI
  return `${protocol}//${url.host}${callbackPath}`;
}

/**
 * Generate YouTube OAuth authorization URL
 * Step 1 of OAuth flow: Redirect user to this URL
 *
 * @param userId - User UUID
 * @param session - Neo4j session
 * @param request - HTTP request
 * @param customName - Optional custom name for this ownership
 */
export async function getYouTubeAuthUrl(
  userId: string,
  session: Session,
  request: Request,
  customName?: string,
): Promise<string> {
  const redirectUri = getRedirectUriFromRequest(request);
  const config = await getOAuthConfig(session, redirectUri);

  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri,
  );

  // Generate unique ownership ID
  const ownershipId = randomUUID();

  // Create state object with userId, ownershipId, and optional customName
  const state = JSON.stringify({
    userId,
    ownershipId,
    customName: customName || null,
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Required to get refresh token
    scope: YOUTUBE_SCOPES,
    state, // Pass user ID, ownership ID, and custom name
    prompt: "consent", // Force consent to always get refresh token
    include_granted_scopes: false, // Only request YouTube scopes
  });

  return authUrl;
}

/**
 * Handle OAuth callback and exchange code for tokens
 * Step 2 of OAuth flow: Called after user authorizes
 *
 * Creates new YouTubeOwnership with linked token and fetches primary channel info
 */
export async function handleYouTubeCallback(
  code: string,
  stateData: {
    userId: string;
    ownershipId: string;
    customName?: string | null;
  },
  session: Session,
  request: Request,
): Promise<{ success: boolean; error?: string; ownership?: any }> {
  try {
    const { userId, ownershipId, customName } = stateData;

    const redirectUri = getRedirectUriFromRequest(request);
    const config = await getOAuthConfig(session, redirectUri);

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("No access token received from Google");
    }

    if (!tokens.refresh_token) {
      throw new Error(
        "No refresh token received. User may have already authorized this app.",
      );
    }

    // Get primary YouTube channel info for this token
    oauth2Client.setCredentials({ access_token: tokens.access_token });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Fetch user's YouTube channels to get primary channel info
    const channelsResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
      maxResults: 1,
    });

    // Log API usage for shared quota tracking (1 unit for channels.list)
    await logSharedAPIUsage(
      ownershipId,
      "channels.list",
      YOUTUBE_API_COSTS["channels.list"],
      session,
    );

    const primaryChannel = channelsResponse.data.items?.[0];
    if (!primaryChannel || !primaryChannel.id) {
      throw new Error("Unable to fetch your YouTube channel information");
    }

    const channelName = primaryChannel.snippet?.title || "Unknown Channel";
    const channelId = primaryChannel.id;

    // Encrypt tokens before storage
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    // Check if there's an existing ownership for this channel (active or disconnected)
    const existingCheck = await session.run(
      `
      MATCH (u:User {uuid: $userId})-[:UserYouTubeOwnership]->(o:YouTubeOwnership)
            -[:YouTubeOwnershipToken]->(token:YouTubeToken)
      WHERE o.channelId = $channelId
      RETURN o, token, token.isRevoked as isRevoked
      LIMIT 1
    `,
      { userId, channelId },
    );

    let ownership: any = null;
    let ownershipIdToUse = ownershipId;
    let isUpdate = false;
    let wasRevoked = false;

    if (existingCheck.records.length > 0) {
      // Update existing ownership with new token (whether active or disconnected)
      const existingOwnership = existingCheck.records[0].get("o");
      ownershipIdToUse = existingOwnership.properties.key;
      isUpdate = true;
      wasRevoked = existingCheck.records[0].get("isRevoked");

      const updateResult = await session.run(
        `
        MATCH (ownership:YouTubeOwnership {key: $ownershipId})
              -[r:YouTubeOwnershipToken]->(oldToken:YouTubeToken)

        // Update ownership
        SET ownership.channelName = $channelName,
            ownership.customName = COALESCE($customName, ownership.customName),
            ownership.lastSelected = datetime(),
            ownership.updatedAt = datetime()

        // Delete old token relationship and node
        DELETE r
        DELETE oldToken

        // Create new token
        CREATE (newToken:YouTubeToken {
          accessToken: $accessToken,
          refreshToken: $refreshToken,
          expiresAt: datetime({epochMillis: $expiresAt}),
          scope: $scope,
          issuedAt: datetime(),
          lastRefreshed: datetime(),
          isRevoked: false
        })
        CREATE (ownership)-[:YouTubeOwnershipToken]->(newToken)

        RETURN ownership
      `,
        {
          ownershipId: ownershipIdToUse,
          channelName,
          customName: customName || null,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: neo4j.int(tokens.expiry_date || Date.now() + 3600 * 1000),
          scope: YOUTUBE_SCOPES.join(" "),
        },
      );

      const ownershipNode = updateResult.records[0]?.get("ownership");
      ownership = ownershipNode ? convertNodeToJson(ownershipNode) : null;
    } else {
      // Create new ownership
      // Check if this is the first ownership (will be primary)
      const ownershipsCheck = await session.run(
        `
        MATCH (u:User {uuid: $userId})-[:UserYouTubeOwnership]->(o:YouTubeOwnership)
        RETURN count(o) as count
      `,
        { userId },
      );

      const count = ownershipsCheck.records[0]?.get("count");
      const isPrimary =
        (neo4j.isInt(count) ? count.toNumber() : Number(count)) === 0;

      const createResult = await session.run(
        `
        MATCH (u:User {uuid: $userId})
        CREATE (ownership:YouTubeOwnership {
          key: $ownershipId,
          channelName: $channelName,
          customName: $customName,
          channelId: $channelId,
          isPrimary: $isPrimary,
          lastSelected: datetime(),
          createdAt: datetime(),
          updatedAt: datetime()
        })
        CREATE (u)-[:UserYouTubeOwnership]->(ownership)

        CREATE (token:YouTubeToken {
          accessToken: $accessToken,
          refreshToken: $refreshToken,
          expiresAt: datetime({epochMillis: $expiresAt}),
          scope: $scope,
          issuedAt: datetime(),
          lastRefreshed: datetime(),
          isRevoked: false
        })
        CREATE (ownership)-[:YouTubeOwnershipToken]->(token)

        RETURN ownership
      `,
        {
          userId,
          ownershipId,
          channelName,
          customName: customName || null,
          channelId,
          isPrimary,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: neo4j.int(tokens.expiry_date || Date.now() + 3600 * 1000),
          scope: YOUTUBE_SCOPES.join(" "),
        },
      );

      const ownershipNode = createResult.records[0]?.get("ownership");
      ownership = ownershipNode ? convertNodeToJson(ownershipNode) : null;
    }

    return {
      success: true,
      isUpdate,
      wasRevoked,
      ownership: {
        id: ownershipIdToUse,
        channelName,
        customName,
        channelId,
        isPrimary: ownership?.P?.isPrimary,
      },
    };
  } catch (error) {
    console.error("YouTube OAuth callback error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get valid YouTube access token for an ownership
 * Automatically refreshes if expired
 *
 * @param ownershipId - YouTubeOwnership key/ID
 * @param session - Neo4j session
 * @param request - Optional HTTP request for redirect URI
 */
export async function getValidYouTubeToken(
  ownershipId: string,
  session: Session,
  request?: Request,
): Promise<string> {
  // Fetch encrypted tokens from database via ownership
  const result = await session.run(
    `
    MATCH (ownership:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipToken]->(token:YouTubeToken)
    WHERE token.isRevoked = false
    RETURN token, ownership.channelName as channelName
  `,
    { ownershipId },
  );

  if (result.records.length === 0) {
    throw new Error(
      "No YouTube authorization found for this channel. Please reconnect in settings.",
    );
  }

  const record = result.records[0];
  const tokenNode = record.get("token");
  const token = convertNodeToJson(tokenNode);
  const channelName = record.get("channelName");

  // Check if token is revoked
  if (token.P.isRevoked) {
    throw new Error(
      `YouTube access for "${channelName}" has been revoked. Please reconnect your account.`,
    );
  }

  // Decrypt tokens
  const accessToken = decryptToken(token.P.accessToken);
  const refreshToken = decryptToken(token.P.refreshToken);

  // Check if access token is expired (with 5 minute buffer)
  const expiresAt = new Date(token.P.expiresAt);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (now.getTime() >= expiresAt.getTime() - bufferTime) {
    // Token expired or about to expire - refresh it
    console.log(
      `YouTube access token for "${channelName}" expired, refreshing...`,
    );

    const redirectUri = getRedirectUriFromRequest(request);
    const config = await getOAuthConfig(session, redirectUri);

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    try {
      // Get new access token using refresh token
      const { credentials } = await oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error("No access token received during refresh");
      }

      // Encrypt new access token
      const newEncryptedAccessToken = encryptToken(credentials.access_token);

      // Update in database
      await session.run(
        `
        MATCH (ownership:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipToken]->(token:YouTubeToken)
        SET token.accessToken = $accessToken,
            token.expiresAt = datetime({epochMillis: $expiresAt}),
            token.lastRefreshed = datetime()
      `,
        {
          ownershipId,
          accessToken: newEncryptedAccessToken,
          expiresAt: neo4j.int(
            credentials.expiry_date || Date.now() + 3600 * 1000,
          ),
        },
      );

      return credentials.access_token;
    } catch (error: any) {
      // Refresh failed - token likely revoked
      if (
        error.code === 400 ||
        error.message?.includes("invalid_grant") ||
        error.message?.includes("Token has been expired or revoked")
      ) {
        // Mark as revoked
        await session.run(
          `
          MATCH (ownership:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipToken]->(token:YouTubeToken)
          SET token.isRevoked = true,
              token.revokedAt = datetime()
        `,
          { ownershipId },
        );

        throw new Error(
          `YouTube authorization for "${channelName}" has been revoked. Please reconnect in settings.`,
        );
      }
      throw error;
    }
  }

  // Token still valid
  return accessToken;
}

/**
 * Get authenticated YouTube API client for an ownership
 * This is the main function to use in server functions
 *
 * @param ownershipId - YouTubeOwnership key/ID
 * @param session - Neo4j session
 * @param request - Optional HTTP request for redirect URI
 */
export async function getYouTubeClient(
  ownershipId: string,
  session: Session,
  request?: Request,
) {
  const accessToken = await getValidYouTubeToken(ownershipId, session, request);

  // Create OAuth2 client with token
  const client = new google.auth.OAuth2();
  client.setCredentials({
    access_token: accessToken,
  });

  // Return authenticated YouTube client
  return google.youtube({
    version: "v3",
    auth: client,
  });
}

/**
 * Check if user has connected any YouTube accounts
 */
export async function hasYouTubeConnection(
  userId: string,
  session: Session,
): Promise<boolean> {
  const result = await session.run(
    `
    MATCH (u:User {uuid: $userId})-[:UserYouTubeOwnership]->(o:YouTubeOwnership)
           -[:YouTubeOwnershipToken]->(token:YouTubeToken)
    WHERE token.isRevoked = false
    RETURN count(o) > 0 as hasConnection
  `,
    { userId },
  );

  return result.records[0]?.get("hasConnection") || false;
}

/**
 * Disconnect (revoke) a specific YouTube ownership
 * Marks token as revoked and schedules data deletion
 *
 * @param ownershipId - YouTubeOwnership key/ID to disconnect
 * @param session - Neo4j session
 */
export async function disconnectYouTube(
  ownershipId: string,
  session: Session,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark token as revoked for this ownership
    await session.run(
      `
      MATCH (ownership:YouTubeOwnership {key: $ownershipId})
            -[:YouTubeOwnershipToken]->(token:YouTubeToken)
      SET token.isRevoked = true,
          token.revokedAt = datetime()
    `,
      { ownershipId },
    );

    // TODO: Schedule YouTube data deletion within 30 days per policy
    // This should be implemented as a background job

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting YouTube ownership:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get YouTube connection status for a user
 * Returns summary of all connected ownerships
 */
export async function getYouTubeConnectionStatus(
  userId: string,
  session: Session,
): Promise<{
  connected: boolean;
  ownerships: Array<{
    ownershipId: string;
    channelName: string;
    customName: string | null;
    channelId: string;
    isPrimary: boolean;
    lastRefreshed?: Date;
    scope?: string;
  }>;
}> {
  const result = await session.run(
    `
    MATCH (u:User {uuid: $userId})-[:UserYouTubeOwnership]->(o:YouTubeOwnership)
          -[:YouTubeOwnershipToken]->(token:YouTubeToken)
    WHERE token.isRevoked = false
    RETURN o.key as ownershipId,
           o.channelName as channelName,
           o.customName as customName,
           o.channelId as channelId,
           o.isPrimary as isPrimary,
           token.lastRefreshed as lastRefreshed,
           token.scope as scope
    ORDER BY o.isPrimary DESC, o.lastSelected DESC
  `,
    { userId },
  );

  if (result.records.length === 0) {
    return { connected: false, ownerships: [] };
  }

  const ownerships = result.records.map((record) => ({
    ownershipId: record.get("ownershipId"),
    channelName: record.get("channelName"),
    customName: record.get("customName"),
    channelId: record.get("channelId"),
    isPrimary: record.get("isPrimary"),
    lastRefreshed: record.get("lastRefreshed")
      ? new Date(record.get("lastRefreshed"))
      : undefined,
    scope: record.get("scope"),
  }));

  return {
    connected: true,
    ownerships,
  };
}
