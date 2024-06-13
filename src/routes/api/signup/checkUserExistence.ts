import type {TransactionPromise} from "neo4j-driver-core";
import {findVertexesMGCall} from "~/cypher/get/findVertex";

export async function checkUserExistence(
  tx: TransactionPromise,
  username: string,
  email: string,
  subdomain: string,
) {
  // Check if the subdomain already exists
  if (
    subdomain &&
    !(
      await findVertexesMGCall({
        label: "User",
        attribute: "subdomain",
        value: subdomain,
      })
    ).error
  ) {
    throw new Error("Sub Domain already exists");
  }

  // Check if the username already exists
  if (
    username &&
    !(
      await findVertexesMGCall({
        label: "User",
        attribute: "username",
        value: username,
      })
    ).error
  ) {
    throw new Error("Username already exists");
  }

  // Check if the email already exists
  if (
    email &&
    !(
      await findVertexesMGCall({
        label: "User",
        attribute: "email",
        value: email,
      })
    ).error
  ) {
    throw new Error("Email address already exists");
  }
}