import type { Transaction } from "neo4j-driver";

import { getDriver } from "~/cypher/driver";
import { syncNodesMGCall } from "~/cypher/mutate/sync";

import type { SignupRequestData } from "./SignupRequestData";

import { createDatabase } from "./createDatabase";
import { createRootFolder } from "./createRootFolder";
import { createUserInSuperDB, createUserInUserDB } from "./createUserInDB";
import { getNewPortsForUser } from "./getNewPortsForUser";
import { insertComponents } from "./insertComponents";
import { newAdminValidations } from "./newAdminValidations";
import { updatePortForNewUser } from "./updatePortForNewUser";

export async function signupAdmin(tx: Transaction, data: SignupRequestData) {
  // Check if the user already exists
  await newAdminValidations(tx, data.username, data.email, data.subDomain);

  // Get ports for the user's database
  const { driverPort, labPort, logsPort } = await getNewPortsForUser(tx);

  await createDatabase(data.subDomain, driverPort, logsPort, labPort);
  await updatePortForNewUser(tx, driverPort, logsPort, labPort);

  // Create a new user in the database according to subDomain
  const user = await createUserInSuperDB(tx, {
    driverPort,
    email: data.email,
    labPort,
    logsPort,
    password: data.password,
    subDomain: [data.subDomain],
    username: data.username,
  });

  const userDbSession = (await getDriver()).session({database: data.subDomain});
  await createUserInUserDB(
    userDbSession,
    {
      email: data.email,
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
