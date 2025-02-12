import { createHash, randomBytes } from 'crypto';

import { getDBSessionForSubdomain } from '~/cypher/get/getSessionForSubdomain';
import { 
  deleteExpiredTokens, 
  getAndConsumeToken, 
  saveToken 
} from '~/cypher/mutate/token/tokenOperations';

const TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function generateSecureToken(data: string, request: Request): Promise<string> {
  // Create a random token
  const randomToken = randomBytes(32).toString('hex');
  
  // Hash the token for storage
  const hashedToken = createHash('sha256').update(randomToken).digest('hex');
  
  // Store the token in database
  const { dbSession } = await getDBSessionForSubdomain(request);
  await saveToken(dbSession, hashedToken, data);

  // Clean up old tokens periodically
  await cleanupOldTokens(request);

  return randomToken;
}

export async function validateAndConsumeToken(token: string, request: Request): Promise<null | string> {
  const hashedToken = createHash('sha256').update(token).digest('hex');
  
  const { dbSession } = await getDBSessionForSubdomain(request);
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

async function cleanupOldTokens(request: Request): Promise<void> {
  const { dbSession } = await getDBSessionForSubdomain(request);
  await deleteExpiredTokens(dbSession, TOKEN_EXPIRY);
} 