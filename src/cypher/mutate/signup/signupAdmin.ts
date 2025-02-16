import type { Session, Transaction } from "neo4j-driver";

import type { SignupRequestData } from "./SignupRequestData";

import { createUserInSuperDB } from "./createUserInDB";
import { newAdminValidations } from "./newAdminValidations";

export async function signupAdmin(
  tx: Session | Transaction,
  data: SignupRequestData,
) {
  // Check if the user already exists
  await newAdminValidations(tx, data.username, data.email);

  const user = await createUserInSuperDB(tx, {
    email: data.email,
    password: data.password,
    subDomain: [],
    username: data.username,
  });

  return user;
}
