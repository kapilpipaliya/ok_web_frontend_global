import type { Session, Transaction } from "neo4j-driver";

import { createHash, randomBytes } from "node:crypto";

import { deleteExpiredTokens } from "~/cypher/mutate/token/deleteExpiredTokens";
import { getAndConsumeToken } from "~/cypher/mutate/token/getAndConsumeToken";
import { saveToken } from "~/cypher/mutate/token/saveToken";

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function generateSecureToken(
  data: string,
  dbSession: Session | Transaction,
): Promise<string> {
  // Create a random token
  const randomToken = randomBytes(32).toString("hex");

  // Hash the token for storage
  const hashedToken = createHash("sha256").update(randomToken).digest("hex");

  // Store the HASHED token in database
  await saveToken(dbSession, hashedToken, data);

  // Clean up old tokens periodically
  await cleanupOldTokens(dbSession);

  // Return the RANDOM token (not the hash) to be sent in the email
  return randomToken;
}

export async function validateAndConsumeToken(
  token: string,
  dbSession: Session,
): Promise<null | string> {
  // Hash the received token to match what's stored in the database
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

async function cleanupOldTokens(
  dbSession: Session | Transaction,
): Promise<void> {
  await deleteExpiredTokens(dbSession, TOKEN_EXPIRY);
}
