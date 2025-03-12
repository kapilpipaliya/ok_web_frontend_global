import type { Session, Transaction } from "neo4j-driver";

import { v7 as uuidv7 } from "uuid";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { hashPassword } from "~/lib/auth/password";

export async function createUserInSuperDB(
  superTx: Session | Transaction,
  userData: {
    email: string;
    password: string;
    username: string;
  },
) {
  const uuid = uuidv7();

  // Hash password before saving
  const { hashedPassword, salt } = await hashPassword(userData.password);

  const createUserQuery = `CREATE (u:User {
            username: $username,
            uuid: $uuid,
            email: $email,
            password: $hashedPassword,
            salt: $salt,
            emailConfirmed: false
        }) SET u.createdAt = localDateTime() RETURN u;`;

  const createUserParams = {
    ...userData,
    hashedPassword,
    salt,
    uuid,
  };

  const createUserResult = await superTx.run(createUserQuery, createUserParams);
  const userNode = createUserResult.records[0].get("u");

  return convertNodeToJson(userNode);
}

export async function createUserInUserDB(
  sessionOrTx: Session | Transaction,
  params: Record<string, unknown>,
  isSystemUser?: boolean,
) {
  // If password is provided, hash it
  let hashedPassword = null;
  let salt = null;
  if (typeof params.password === "string" && !isSystemUser) {
    const hashResult = await hashPassword(params.password);
    hashedPassword = hashResult.hashedPassword;
    salt = hashResult.salt;
  }

  const createUserQuery2 = `CREATE (u:User {
                username: $username,
                uuid: $uuid,
                email: $email,
                password: $hashedPassword,
                salt: $salt,
                isSystemUser: $isSystemUser,
                emailConfirmed: $emailConfirmed
            }) SET u.createdAt = localDateTime() RETURN u;`;

  const createUserResult = await sessionOrTx.run(createUserQuery2, {
    ...params,
    hashedPassword,
    isSystemUser: isSystemUser ?? null,
    salt,
    emailConfirmed: params.emailConfirmed ?? false,
  });
  return convertNodeToJson(createUserResult.records[0].get("u"));
}
