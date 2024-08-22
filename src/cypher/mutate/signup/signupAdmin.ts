

import type { Transaction } from "neo4j-driver";

import { syncNodesMGCall } from "~/cypher/mutate/sync";

import type { SignupRequestData } from "./SignupRequestData";

import { getComponentTree } from "../sync/component_tree/convertToJson";
import { insertComponentTree } from "../sync/component_tree/insertComonentTree";
import { checkUserExistence } from "./checkUserExistence";
import { createRootFolder } from "./createRootFolder";
import { createUserInDB } from "./createUserInDB";
import { getNewPortsForUser } from "./getNewPortsForUser";
import { insertComponents } from "./insertComponents";
import { insertDataTypes } from "./insertDataTypes";
import { updatePortForNewUser } from "./updatePortForNewUser";
import { waitForDockerCreate } from "./waitForDockerCreate";

export async function signupAdmin(tx: Transaction, data: SignupRequestData) {
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

    // Insert component tree
    await insertComponentTree(tx, getComponentTree());
    await insertComponents(tx);
    
    syncNodesMGCall({
      nodesToTransfer: ["CompCategory", "Comp", "DataType"], //  "Nav"
      userport: driverPort,
    });
  
    return user;
  }
  