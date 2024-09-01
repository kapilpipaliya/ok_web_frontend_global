import type { Transaction } from "neo4j-driver";

import { syncNodesMGCall } from "~/cypher/mutate/sync";

import type { SignupRequestData } from "./SignupRequestData";

import { createRootFolder } from "./createRootFolder";
import { createUserInSuperDB } from "./createUserInDB";
import { getNewPortsForUser } from "./getNewPortsForUser";
import { insertComponents } from "./insertComponents";
import { newAdminValidations } from "./newAdminValidations";
import { updatePortForNewUser } from "./updatePortForNewUser";
import { waitForDockerCreate } from "./waitForDockerCreate";

export async function signupAdmin(
  superTx: Transaction,
  data: SignupRequestData,
) {
  // Check if the user already exists
  await newAdminValidations(superTx, data.username, data.email, data.subDomain);

  // Get ports for the user's database
  const { driverPort, labPort, logsPort } = await getNewPortsForUser(superTx);

  await waitForDockerCreate(data.username, driverPort, logsPort, labPort);
  await updatePortForNewUser(superTx, driverPort, logsPort, labPort);

  // Create a new user in the database according to subDomain
  const user = await createUserInSuperDB(superTx, {
    driverPort,
    email: data.email,
    labPort,
    logsPort,
    password: data.password,
    subDomain: [data.subDomain],
    username: data.username,
  });

  await createRootFolder(superTx);

  // await insertDataTypes(superTx);

  await insertComponents(superTx);

  syncNodesMGCall({
    // This is not syncing Root to child relationship.
    nodesToTransfer: ["Comp"], // "DataType", "Nav"
    userport: driverPort,
  });

  return user;
}
