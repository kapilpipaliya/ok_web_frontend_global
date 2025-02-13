import { generateSalt, hash, verify } from "@razr/crypto";

export async function hashPassword(password: string) {
  const salt = generateSalt();
  const hashedPassword = await hash(password, salt);
  return { hashedPassword, salt };
}

export async function verifyPassword(password: string, hashedPassword: string, salt: Uint8Array) {
  return await verify(password, hashedPassword, salt);
} 