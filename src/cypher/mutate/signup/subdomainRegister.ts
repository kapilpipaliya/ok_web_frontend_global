import type { Node, Session, Transaction } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDriver } from "~/cypher/core/driver";
import { saveAllEmailTemplates } from "~/cypher/mutate/email/saveEmailTemplates";
import { syncNodesAPICall } from "~/cypher/mutate/sync";

import { createDatabase } from "./createDatabase";
import { createRootFolder } from "./createRootFolder";
import { createUserInUserDB } from "./createUserInDB";
import { insertComponents } from "./insertComponents";

export interface SubdomainRegisterRequestData {
  email: string;
  password: string;
  subDomain: string;
  username: string;
  uuid?: string;
}

export async function subdomainRegister(
  tx: Session | Transaction,
  data: SubdomainRegisterRequestData,
) {
  // validation is done on the parent function

  await createDatabase(data.subDomain);

  const query = "Match (u:User {uuid: $uuid}) RETURN u";
  const result = await tx.run(query, { uuid: data.uuid });
  const user = convertNodeToJson(result.records[0].get("u") as Node);

  const userDbSession = (await getDriver()).session({
    database: data.subDomain,
  });
  await createUserInUserDB(
    userDbSession,
    {
      email: data.email,
      username: data.username,
      uuid: user.P.uuid,
    },
    true,
  );

  await createRootFolder(userDbSession, user.P.uuid);

  // await insertDataTypes(userDbSession);

  await insertComponents(userDbSession);

  // After successful subdomain creation and registration
  try {
    await saveAllEmailTemplates(userDbSession);
  } catch (error) {
    console.error("Failed to save email templates:", error);
    // Continue even if email template creation fails
  }

  syncNodesAPICall({
    // This is not syncing Root to child relationship.
    nodesToTransfer: ["Comp"], // "DataType", "Nav"
    subDomain: data.subDomain,
  });
  userDbSession.close();
  return user;
}
