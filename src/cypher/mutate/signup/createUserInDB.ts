import type { Session } from "neo4j-driver";
import type { Transaction } from "neo4j-driver";

import { v7 as uuidv7 } from "uuid";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { hashPassword } from "~/lib/auth/password";

export async function createUserInSuperDB(
  superTx: Session | Transaction,
  userData: {
    email: string;
    password: string;
    subDomain: string[];
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

  for (const subDomain of userData.subDomain) {
    await createAndLinkSubDomain(superTx, uuid, subDomain);
  }

  return convertNodeToJson(userNode);
}

export async function createUserInUserDB(
  sessionOrTx: Session | Transaction,
  params: Record<string, unknown>,
  isSuper?: boolean,
) {
  // If password is provided, hash it
  let hashedPassword;
  let salt;
  if (typeof params.password === "string" && !isSuper) {
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
                isSuper: $isSuper,
                avatar: '',
                emailConfirmed: false
            }) SET u.createdAt = localDateTime() RETURN u;`;

  const createUserResult = await sessionOrTx.run(createUserQuery2, {
    ...params,
    hashedPassword,
    isSuper: isSuper ?? null,
    salt,
  });
  return convertNodeToJson(createUserResult.records[0].get("u"));
}

async function createAndLinkSubDomain(
  tx: Session | Transaction,
  uuid: string,
  subDomain: string,
) {
  const createSubDomainQuery = `CREATE (s:SubDomain {
    key: $subDomain
  }) RETURN s;`;

  const createSubDomainResult = await tx.run(createSubDomainQuery, {
    subDomain,
  });

  const createEdgeQuery = `MATCH (u:User { uuid: $uuid }), (s:SubDomain { key: $subDomain })
                          CREATE (u)-[:UserSubDomain]->(s);`;

  await tx.run(createEdgeQuery, { subDomain, uuid });

  return createSubDomainResult.records[0].get("s");
}
