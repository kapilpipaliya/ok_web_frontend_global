import type { Session, Transaction } from "neo4j-driver";

import { v7 as uuidv7 } from "uuid";

import type { SignupRequestData } from "./SignupRequestData";

import { createUserInSuperDB } from "./createUserInDB";
import { newAdminValidations } from "./newAdminValidations";

export async function signupAdmin(
  tx: Session | Transaction,
  data: SignupRequestData,
) {
  // Check if the user already exists
  await newAdminValidations(tx, data.username, data.email);

  const user = await createUserInSuperDB(tx, {
    email: data.email,
    password: data.password,
    username: data.username,
  });

  // Create Account vertex and AccountUser relationship
  const accountId = uuidv7();
  await createAccount(tx, accountId, data.username);
  await createAccountUserRelation(tx, accountId, user.P.uuid);

  return user;
}

async function createAccount(
  tx: Session | Transaction,
  accountId: string,
  username: string,
) {
  await tx.run(
    `
    CREATE (a:Account {
      id: $accountId,
      name: $username,
      createdAt: datetime(),
      lastModified: datetime()
    })
    RETURN a
  `,
    {
      accountId,
      username,
    },
  );
}

// async function createAccountSubdomainRelation(tx: Session | Transaction, accountId: string, subdomainId: string) {
//   await tx.run(`
//     MATCH (a:Account {id: $accountId}), (s:Subdomain {id: $subdomainId})
//     CREATE (a)-[:AccountSubdomain]->(s)
//   `, {
//     accountId,
//     subdomainId,
//   });
// }

async function createAccountUserRelation(
  tx: Session | Transaction,
  accountId: string,
  userUuid: string,
) {
  await tx.run(
    `
    MATCH (a:Account {id: $accountId}), (u:User {uuid: $userUuid})
    CREATE (a)-[:AccountUser]->(u)
  `,
    {
      accountId,
      userUuid,
    },
  );
}
