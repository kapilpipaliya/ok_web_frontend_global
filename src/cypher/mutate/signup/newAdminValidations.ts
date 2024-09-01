import type { Session, Transaction } from "neo4j-driver-core";

export async function newAdminValidations(
  txOrSession: Session | Transaction,
  username: string,
  email: string,
  subDomain: string,
) {
  const checkIfExists = async (
    label: string,
    attribute: string,
    value: string,
  ) => {
    const query = `MATCH (n:${label} {${attribute}: $value}) RETURN n LIMIT 1`;
    const result = await txOrSession.run(query, { value });
    return result.records.length > 0;
  };

  if (subDomain && (await checkIfExists("SubDomain", "key", subDomain))) {
    throw new Error("Sub Domain already exists");
  }

  if (username && (await checkIfExists("User", "username", username))) {
    throw new Error("Username already exists");
  }

  if (email && (await checkIfExists("User", "email", email))) {
    throw new Error("Email address already exists");
  }
}
