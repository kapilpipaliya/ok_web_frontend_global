import type { Session, Transaction } from "neo4j-driver";

import { v7 as uuidv7 } from "uuid";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";

import type { SignupRequestData } from "./type/SignupRequestData";

import { saveAllEmailTemplates } from "../email/saveEmailTemplates";
import { addAdminRoleToUser } from "./admin/addAdminRoleToUser";
import { addSystemAdminRoleToUser } from "./admin/addSystemAdminRoleToUser";
import { newAdminValidations } from "./admin/newAdminValidations";
import { createRootFolder } from "./seed/createRootFolder";
import { insertComponents } from "./seed/insertComponents";
import { validateEmail } from "~/lib/validation/validateEmail";

import {
  createInvitedUserInDB,
  createUserInAdminDB,
} from "./user/createUserInDB";

export async function signupAdmin(
  tx: Transaction,
  data: SignupRequestData,
  isAdmin = false,
) {
  // Check if the user already exists
  await newAdminValidations(tx, data.username, data.email);

  const user = await createUserInAdminDB(tx, {
    email: data.email,
    emailConfirmed: isAdmin,
    password: data.password,
    username: data.username,
  });

  if (isAdmin) {
    await createRootFolder(tx);
  }

  // Create Account vertex and AccountUser relationship
  const accountId = uuidv7();
  await createAccount(tx, accountId, data.username);
  await createAccountUserRelation(tx, accountId, user.P.uuid);
  await addAdminRoleToUser(tx, user.P.uuid);

  if (isAdmin) {
    await addSystemAdminRoleToUser(tx, user.P.uuid);
  }

  // Create SubDomain and link with Account if it's system user
  if (isAdmin) {
    await createSystemSubdomain(tx, accountId);

    const response = await insertComponents(tx);
    if (!response.success) {
      throw new Error("Failed to insert component tree");
    }

    await saveAllEmailTemplates(tx);
  }

  return { accountId, error: "", user };
}

/**
 * Same account/admin setup as signupAdmin, but creates an invited user without a password
 * (status "invited") so the merchant can set credentials via the invitation email flow.
 */
export async function signupAdminInvited(
  tx: Transaction,
  data: Pick<SignupRequestData, "email" | "username"> & { name?: string },
) {
  if (validateEmail(data.email)) {
    throw new Error("A valid email address is required");
  }

  const email = data.email.trim();
  await newAdminValidations(tx, data.username, email);

  const user = await createInvitedUserInDB(tx, {
    email,
    name: data.name,
    username: data.username,
  });

  await createRootFolder(tx);
  const accountId = uuidv7();
  await createAccount(tx, accountId, data.username);
  await createAccountUserRelation(tx, accountId, user.P.uuid);
  await addAdminRoleToUser(tx, user.P.uuid);

  return { accountId, error: "", user };
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

async function createSystemSubdomain(
  tx: Session | Transaction,
  accountId: string,
) {
  const query = `
    CREATE (s:SubDomain {
      key: $adminDbName,
      createdAt: datetime(),
      lastModified: datetime()
    })
    WITH s
    MATCH (a:Account {id: $accountId})
    CREATE (a)-[:AccountSubdomain]->(s)
    RETURN s
  `;

  return await tx.run(query, {
    accountId,
    adminDbName: ADMIN_DB_NAME,
  });
}
