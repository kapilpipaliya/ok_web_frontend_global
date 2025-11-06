/**
 * YouTube OAuth Manager
 *
 * Handles OAuth flow, token storage, and token refresh for YouTube API access.
 * Each user must authorize YouTube Organizer to access their YouTube data.
 */

import { google } from 'googleapis';
import type { Session } from 'neo4j-driver';
import neo4j from 'neo4j-driver';
import { encryptToken, decryptToken } from '~/lib/auth/tokenEncryption';

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
];

/**
 * Get OAuth2 client configuration from database
 */
async function getOAuthConfig(session: Session, redirectUri: string): Promise<{
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}> {
  const result = await session.run(`
    MATCH (s:OAuthSettings)
    WHERE s.googleEnabled = true
    RETURN s.googleClientId as clientId,
           s.googleClientSecretEncrypted as clientSecretEncrypted
    LIMIT 1
  `);

  if (result.records.length === 0) {
    throw new Error(
      'YouTube OAuth is not configured. Please configure OAuth settings in admin panel.'
    );
  }

  const record = result.records[0];
  const clientId = record.get('clientId');
  const clientSecretEncrypted = record.get('clientSecretEncrypted');

  if (!clientId || !clientSecretEncrypted) {
    throw new Error(
      'Incomplete OAuth configuration. Please check admin settings.'
    );
  }

  // Decrypt client secret
  const { decryptClientSecret } = await import('~/lib/auth/tokenEncryption');
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
 */
export function getRedirectUriFromRequest(request?: Request): string {
  // If no request provided (background workers), use environment or default
  if (!request) {
    return process.env.APP_URL
      ? `${process.env.APP_URL}/api/auth/youtube/callback`
      : 'https://localhost:3000/api/auth/youtube/callback';
  }

  const url = new URL(request.url);

  // Use HTTPS by default
  // Only use HTTP for plain 'localhost' (without domain)
  const protocol = url.hostname === 'localhost' ? url.protocol : 'https:';

  // Construct the redirect URI
  return `${protocol}//${url.host}/api/auth/youtube/callback`;
}

/**
 * Generate YouTube OAuth authorization URL
 * Step 1 of OAuth flow: Redirect user to this URL
 */
export async function getYouTubeAuthUrl(
  userId: string,
  session: Session,
  request: Request
): Promise<string> {
  const redirectUri = getRedirectUriFromRequest(request);
  const config = await getOAuthConfig(session, redirectUri);

  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get refresh token
    scope: YOUTUBE_SCOPES,
    state: userId, // Pass user ID to identify user on callback
    prompt: 'consent', // Force consent to always get refresh token
    include_granted_scopes: false, // Only request YouTube scopes
  });

  return authUrl;
}

/**
 * Handle OAuth callback and exchange code for tokens
 * Step 2 of OAuth flow: Called after user authorizes
 */
export async function handleYouTubeCallback(
  code: string,
  userId: string,
  session: Session,
  request: Request
): Promise<{ success: boolean; error?: string }> {
  try {
    const redirectUri = getRedirectUriFromRequest(request);
    const config = await getOAuthConfig(session, redirectUri);

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    if (!tokens.refresh_token) {
      throw new Error(
        'No refresh token received. User may have already authorized this app.'
      );
    }

    // Encrypt tokens before storage
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token);

    // Store tokens in database
    await session.run(
      `
      MATCH (u:User {uuid: $userId})
      MERGE (u)-[:UserYouTubeToken]->(token:YouTubeToken)
      SET token.accessTokenEncrypted = $accessToken,
          token.refreshTokenEncrypted = $refreshToken,
          token.expiresAt = datetime({epochMillis: $expiresAt}),
          token.scope = $scope,
          token.issuedAt = datetime(),
          token.lastRefreshed = datetime(),
          token.isRevoked = false
    `,
      {
        userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: neo4j.int(tokens.expiry_date || Date.now() + 3600 * 1000),
        scope: YOUTUBE_SCOPES.join(' '),
      }
    );

    return { success: true };
  } catch (error) {
    console.error('YouTube OAuth callback error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get valid YouTube access token for a user
 * Automatically refreshes if expired
 */
export async function getValidYouTubeToken(
  userId: string,
  session: Session,
  request?: Request
): Promise<string> {
  // Fetch encrypted tokens from database
  const result = await session.run(
    `
    MATCH (u:User {uuid: $userId})-[:UserYouTubeToken]->(token:YouTubeToken)
    WHERE token.isRevoked = false
    RETURN token
  `,
    { userId }
  );

  if (result.records.length === 0) {
    throw new Error(
      'No YouTube authorization found. Please connect your YouTube account in settings.'
    );
  }

  const tokenData = result.records[0].get('token').properties;

  // Check if token is revoked
  if (tokenData.isRevoked) {
    throw new Error(
      'YouTube access has been revoked. Please reconnect your YouTube account.'
    );
  }

  // Decrypt tokens
  const accessToken = decryptToken(tokenData.accessTokenEncrypted);
  const refreshToken = decryptToken(tokenData.refreshTokenEncrypted);

  // Check if access token is expired (with 5 minute buffer)
  const expiresAt = new Date(tokenData.expiresAt);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (now.getTime() >= expiresAt.getTime() - bufferTime) {
    // Token expired or about to expire - refresh it
    console.log('YouTube access token expired, refreshing...');

    const redirectUri = getRedirectUriFromRequest(request);
    const config = await getOAuthConfig(session, redirectUri);

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    try {
      // Get new access token using refresh token
      const { credentials } = await oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('No access token received during refresh');
      }

      // Encrypt new access token
      const newEncryptedAccessToken = encryptToken(credentials.access_token);

      // Update in database
      await session.run(
        `
        MATCH (u:User {uuid: $userId})-[:UserYouTubeToken]->(token:YouTubeToken)
        SET token.accessTokenEncrypted = $accessToken,
            token.expiresAt = datetime({epochMillis: $expiresAt}),
            token.lastRefreshed = datetime()
      `,
        {
          userId,
          accessToken: newEncryptedAccessToken,
          expiresAt: neo4j.int(credentials.expiry_date || Date.now() + 3600 * 1000),
        }
      );

      return credentials.access_token;
    } catch (error: any) {
      // Refresh failed - token likely revoked
      if (
        error.code === 400 ||
        error.message?.includes('invalid_grant') ||
        error.message?.includes('Token has been expired or revoked')
      ) {
        // Mark as revoked
        await session.run(
          `
          MATCH (u:User {uuid: $userId})-[:UserYouTubeToken]->(token:YouTubeToken)
          SET token.isRevoked = true,
              token.revokedAt = datetime()
        `,
          { userId }
        );

        throw new Error(
          'YouTube authorization has been revoked. Please reconnect your account in settings.'
        );
      }
      throw error;
    }
  }

  // Token still valid
  return accessToken;
}

/**
 * Get authenticated YouTube API client for a user
 * This is the main function to use in server functions
 */
export async function getYouTubeClient(userId: string, session: Session, request?: Request) {
  const accessToken = await getValidYouTubeToken(userId, session, request);

  // Create OAuth2 client with token
  const client = new google.auth.OAuth2();
  client.setCredentials({
    access_token: accessToken,
  });

  // Return authenticated YouTube client
  return google.youtube({
    version: 'v3',
    auth: client,
  });
}

/**
 * Check if user has connected their YouTube account
 */
export async function hasYouTubeConnection(
  userId: string,
  session: Session
): Promise<boolean> {
  const result = await session.run(
    `
    MATCH (u:User {uuid: $userId})-[:UserYouTubeToken]->(token:YouTubeToken)
    WHERE token.isRevoked = false
    RETURN count(token) > 0 as hasConnection
  `,
    { userId }
  );

  return result.records[0]?.get('hasConnection') || false;
}

/**
 * Disconnect (revoke) user's YouTube connection
 * Marks token as revoked and schedules data deletion
 */
export async function disconnectYouTube(
  userId: string,
  session: Session
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark token as revoked
    await session.run(
      `
      MATCH (u:User {uuid: $userId})-[:UserYouTubeToken]->(token:YouTubeToken)
      SET token.isRevoked = true,
          token.revokedAt = datetime()
    `,
      { userId }
    );

    // TODO: Schedule YouTube data deletion within 30 days per policy
    // This should be implemented as a background job

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting YouTube:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get YouTube connection status for a user
 */
export async function getYouTubeConnectionStatus(
  userId: string,
  session: Session
): Promise<{
  connected: boolean;
  lastRefreshed?: Date;
  scope?: string;
}> {
  const result = await session.run(
    `
    MATCH (u:User {uuid: $userId})-[:UserYouTubeToken]->(token:YouTubeToken)
    WHERE token.isRevoked = false
    RETURN token.lastRefreshed as lastRefreshed,
           token.scope as scope
  `,
    { userId }
  );

  if (result.records.length === 0) {
    return { connected: false };
  }

  const record = result.records[0];

  return {
    connected: true,
    lastRefreshed: record.get('lastRefreshed')
      ? new Date(record.get('lastRefreshed'))
      : undefined,
    scope: record.get('scope'),
  };
}
