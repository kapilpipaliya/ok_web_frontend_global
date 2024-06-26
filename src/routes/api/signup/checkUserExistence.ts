import type {TransactionPromise} from "neo4j-driver-core";
import {findVertexesMGCall} from "~/cypher/get/findVertex";

export async function checkUserExistence(
  tx: TransactionPromise,
  username: string,
  email: string,
  subdomain: string,
) {
  const checkIfExists = async (label: string, attribute: string, value: string) => {
    return !(await findVertexesMGCall({ label, attribute, value })).error;
  };

  if (subdomain && (await checkIfExists("User", "subdomain", subdomain))) {
    throw new Error("Sub Domain already exists");
  }

  if (username && (await checkIfExists("User", "username", username))) {
    throw new Error("Username already exists");
  }

  if (email && (await checkIfExists("User", "email", email))) {
    throw new Error("Email address already exists");
  }
}
