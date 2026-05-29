import type { Session } from "neo4j-driver";

import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { getDriver } from "~/cypher/core/driver";
import { getSubdomainsForAccount } from "~/cypher/session/getSubdomainsForAccount";

interface ConfirmUserEmailAcrossPlatformArgs {
  dbSession: Session;
  email?: string;
  subDomain: string;
  uuid: string;
}

export async function confirmUserEmailAcrossPlatform({
  dbSession,
  email,
  subDomain,
  uuid,
}: ConfirmUserEmailAcrossPlatformArgs) {
  // do extra update in current db for safety
  const currentDbResult = await confirmUserEmailInSession(
    dbSession,
    uuid,
    email,
  );

  if (subDomain !== ADMIN_DB_NAME) {
    return currentDbResult;
  }

  const subdomains = (await getSubdomainsForAccount(dbSession, uuid)).filter(
    (database): database is string =>
      typeof database === "string" && database !== ADMIN_DB_NAME,
  );

  if (subdomains.length === 0) {
    return currentDbResult;
  }

  const driver = await getDriver();
  const updateSessions = subdomains.map((database) =>
    driver.session({ database }),
  );

  try {
    await Promise.all(
      updateSessions.map((session) => confirmUserEmailInSession(session, uuid)),
    );
  } catch (error) {
    console.error(
      "Failed to sync email confirmation to linked subdomains:",
      error,
    );
  } finally {
    await Promise.all(updateSessions.map((session) => session.close()));
  }

  return currentDbResult;
}

async function confirmUserEmailInSession(
  session: Session,
  uuid: string,
  email?: string,
) {
  return await session.run(
    `MATCH (u:User {uuid: $uuid})
     WHERE u.email = $email
     SET u.emailConfirmed = true,
         u.updatedAt = datetime()
     RETURN u`,
    { email, uuid },
  );
}
