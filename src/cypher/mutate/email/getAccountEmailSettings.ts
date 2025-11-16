import type { Session } from "neo4j-driver";

export async function getAccountEmailSetting(
  dbSession: Session,
  accountId: string,
) {
  const result = await dbSession.run(
    `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
     RETURN s as setting`,
    { accountId },
  );
  return result.records[0]?.get("setting") || null;
}
