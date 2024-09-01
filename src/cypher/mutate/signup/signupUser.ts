import type { Transaction } from "neo4j-driver";

import type { SignupRequestData } from "./SignupRequestData";

import { createUserInUserDB } from "./createUserInDB";
import { newAdminValidations } from "./newAdminValidations";

export async function signupUser(tx: Transaction, data: SignupRequestData) {
  // Check if the user already exists
  await newAdminValidations(tx, data.username, data.email, data.subDomain);

  // Create a new user in the user's database
  const user = await createUserInUserDB(tx, {
    email: data.email,
    password: data.password,
    uId: null,
    username: data.username,
  });

  return user;
}
