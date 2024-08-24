import type { Transaction } from "neo4j-driver";

import { syncNodesMGCall } from "~/cypher/mutate/sync";

import type { SignupRequestData } from "./SignupRequestData";

import { getComponentTree } from "../sync/component_tree/convertToJson";
import { insertComponentTree } from "../sync/component_tree/insertComonentTree";
import { checkUserExistence } from "./checkUserExistence";
import { createRootFolder } from "./createRootFolder";
import { createUserInSuperDB } from "./createUserInDB";
import { getNewPortsForUser } from "./getNewPortsForUser";
import { insertComponents } from "./insertComponents";
import { insertDataTypes } from "./insertDataTypes";
import { updatePortForNewUser } from "./updatePortForNewUser";
import { waitForDockerCreate } from "./waitForDockerCreate";

export async function signupAdmin(
  superTx: Transaction,
  data: SignupRequestData,
) {
  // Check if the user already exists
  await checkUserExistence(superTx, data.username, data.email, data.subdomain);

  // Get ports for the user's database
  const { driverPort, labPort, logsPort } = await getNewPortsForUser(superTx);

  await waitForDockerCreate(data.username, driverPort, logsPort, labPort);

  await updatePortForNewUser(superTx, driverPort, logsPort, labPort);

  // Create a new user in the database according to subdomain
  const user = await createUserInSuperDB(
    superTx,
    data.username,
    data.email,
    data.password,
    data.subdomain,
    driverPort,
    logsPort,
    labPort,
  );

  await createRootFolder(superTx);

  await insertDataTypes(superTx);

  // Insert component tree
  await insertComponentTree(superTx, getComponentTree());
  await insertComponents(superTx);

  syncNodesMGCall({
    nodesToTransfer: ["Comp", "DataType"], //  "Nav"
    userport: driverPort,
  });

  return user;
}
