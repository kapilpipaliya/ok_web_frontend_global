import type { Transaction } from "neo4j-driver";

import { v7 as uuidv7 } from "uuid";

import type { SignupRequestData } from "./SignupRequestData";

import { createUserInUserDB } from "./createUserInDB";
import { newAdminValidations } from "./newAdminValidations";

export async function signupUser(tx: Transaction, data: SignupRequestData) {
  // Check if the user already exists
  await newAdminValidations(tx, data.username, data.email);

  // Create a new user in the user's database
  const user = await createUserInUserDB(tx, {
    email: data.email,
    password: data.password,
    username: data.username,
    uuid: uuidv7(),
  });

  return user;
}
