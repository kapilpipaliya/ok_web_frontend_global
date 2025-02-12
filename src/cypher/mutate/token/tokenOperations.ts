import type { Session } from "neo4j-driver";

interface TokenData {
  createdAt: number;
  data: string;
  token: string;
  used: boolean;
}

export async function deleteExpiredTokens(
  session: Session,
  expiryTime: number
): Promise<void> {
  const query = `
    MATCH (t:Token)
    WHERE t.createdAt < $expiryTime OR t.used = true
    DELETE t
  `;

  await session.run(query, {
    expiryTime: Date.now() - expiryTime
  });
}

export async function getAndConsumeToken(
  session: Session,
  hashedToken: string
): Promise<null | TokenData> {
  const query = `
    MATCH (t:Token {hashedToken: $hashedToken})
    SET t.used = true
    RETURN t
  `;

  const result = await session.run(query, { hashedToken });
  if (result.records.length === 0) {
    return null;
  }

  const token = result.records[0].get('t').properties;
  return token as TokenData;
}

export async function saveToken(
  session: Session,
  hashedToken: string,
  data: string
): Promise<void> {
  const query = `
    CREATE (t:Token {
      hashedToken: $hashedToken,
      data: $data,
      createdAt: $createdAt,
      used: false
    })
  `;

  await session.run(query, {
    createdAt: Date.now(),
    data,
    hashedToken
  });
} 