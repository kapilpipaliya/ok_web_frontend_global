import type { Session } from "neo4j-driver";

import type { EmailSetting } from "~/cypher/mutate/email/type/EmailSetting";

export async function createOrUpdateAccountEmailSetting(
  dbSession: Session,
  accountId: string,
  setting: EmailSetting,
) {
  // First try to find existing EmailSetting
  const findResult = await dbSession.run(
    `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
     RETURN s.key as key`,
    { accountId },
  );

  let settingKey: string;

  if (findResult.records.length === 0) {
    // Create new EmailSetting if not found
    settingKey = "Default";
    await dbSession.run(
      `MATCH (a:Account {id: $accountId})
       CREATE (s:EmailSetting {
         key: $key,
         createdAt: datetime(),
         updatedAt: datetime()
       })
       CREATE (a)-[:AccountEmailSetting]->(s)
       SET s += $setting
       RETURN s.key as key`,
      { accountId, key: settingKey, setting },
    );
  } else {
    // Update existing EmailSetting
    settingKey = findResult.records[0].get("key");
    await dbSession.run(
      `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
       SET s += $setting,
           s.updatedAt = datetime()
       RETURN s.key as key`,
      { accountId, setting },
    );
  }

  return settingKey;
}
