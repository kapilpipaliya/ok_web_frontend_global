import type { Session } from "neo4j-driver";

import { createHash, randomBytes } from "node:crypto";

import {
  deleteExpiredTokens,
  getAndConsumeToken,
  saveToken,
} from "~/cypher/mutate/token/tokenOperations";

const TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function generateSecureToken(
  data: string,
  dbSession: Session,
): Promise<string> {
  // Create a random token
  const randomToken = randomBytes(32).toString("hex");

  // Hash the token for storage
  const hashedToken = createHash("sha256").update(randomToken).digest("hex");

  // Store the token in database
  await saveToken(dbSession, hashedToken, data);

  // Clean up old tokens periodically
  await cleanupOldTokens(dbSession);

  return randomToken;
}

export async function validateAndConsumeToken(
  token: string,
  dbSession: Session,
): Promise<null | string> {
  const hashedToken = createHash("sha256").update(token).digest("hex");

  const tokenData = await getAndConsumeToken(dbSession, hashedToken);

  if (!tokenData) {
    return null;
  }

  // Check if token is expired
  if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY) {
    return null;
  }

  return tokenData.data;
}

async function cleanupOldTokens(dbSession: Session): Promise<void> {
  await deleteExpiredTokens(dbSession, TOKEN_EXPIRY);
}
