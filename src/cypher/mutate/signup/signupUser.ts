import type { Transaction } from "neo4j-driver";

import type { SignupRequestData } from "./SignupRequestData";

import { checkUserExistence } from "./checkUserExistence";
import { createUserInUserDB } from "./createUserInDB";

export async function signupUser(tx: Transaction, data: SignupRequestData) {
  // Check if the user already exists
  await checkUserExistence(tx, data.username, data.email, data.subdomain);

  // Create a new user in the user's database
  const user = await createUserInUserDB(tx, {
    email: data.email,
    password: data.password,
    uId: null,
    username: data.username,
  });

  return user;
}
