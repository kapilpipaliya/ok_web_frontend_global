import type { Node, Session, Transaction } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { convertNodeToJson } from "~/cypher/convertNodeToJson";
import { getDriver } from "~/cypher/driver";
import { syncNodesMGCall } from "~/cypher/mutate/sync";

import type { SignupRequestData } from "./SignupRequestData";

import { createDatabase } from "./createDatabase";
import { createRootFolder } from "./createRootFolder";
import { createUserInSuperDB, createUserInUserDB } from "./createUserInDB";
import { insertComponents } from "./insertComponents";
import { newAdminValidations } from "./newAdminValidations";

export async function signupAdmin(tx: Session | Transaction, data: SignupRequestData) {
  // Check if the user already exists
  if (!data.isSubDomainCreation) {
    await newAdminValidations(tx, data.username, data.email, data.subDomain);
  }

  await createDatabase(data.subDomain);

  // Create a new user in the database according to subDomain
  let user: Vertex;
  if (!data.isSubDomainCreation) {
    user = await createUserInSuperDB(tx, {
      email: data.email,
      password: data.password,
      subDomain: [data.subDomain],
      username: data.username,
    });
  } else {
    const query = `Match (u:User {uuid: $uuid}) RETURN u`;
    const result = await tx.run(query, { uuid: data.uuid });
    user = convertNodeToJson(result.records[0].get("u") as Node);
  }

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

  syncNodesMGCall({
    // This is not syncing Root to child relationship.
    nodesToTransfer: ["Comp"], // "DataType", "Nav"
    subDomain: data.subDomain,
  });
  userDbSession.close();
  return user;
}
