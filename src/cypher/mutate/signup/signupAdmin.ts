
import type { TransactionPromise } from "neo4j-driver-core";

import { syncNodesMGCall } from "~/cypher/mutate/sync";

import type { SignupRequestData } from "./SignupRequestData";

import { checkUserExistence } from "./checkUserExistence";
import { createRootFolder } from "./createRootFolder";
import { createUserInDB } from "./createUserInDB";
import { getNewPortsForUser } from "./getNewPortsForUser";
import { insertDataTypes } from "./insertDataTypes";
import { updatePortForNewUser } from "./updatePortForNewUser";
import { waitForDockerCreate } from "./waitForDockerCreate";

export async function signupAdmin(tx: TransactionPromise, data: SignupRequestData) {
    // Check if the user already exists
    await checkUserExistence(tx, data.username, data.email, data.subdomain);
  
    // Get ports for the user's database
    const { driverPort, labPort, logsPort } = await getNewPortsForUser(tx);
  
    await waitForDockerCreate(data.username, driverPort, logsPort, labPort);
  
    await updatePortForNewUser(tx, driverPort, logsPort, labPort);
  
    // Create a new user in the database according to subdomain
    const user = await createUserInDB(
      tx,
      data.username,
      data.email,
      data.password,
      data.subdomain,
      driverPort,
      logsPort,
      labPort
    );
  
    await createRootFolder(tx);
  
    await insertDataTypes(tx);
    syncNodesMGCall({
      nodesToTransfer: ["CompCategory", "Comp", "DataType"], //  "Nav"
      userport: driverPort,
    });
  
    return user;
  }
  