import type { Session } from "neo4j-driver";

export interface EmailSettings {
  [key: string]: unknown;
  active?: string; // 'smtp', 'sendgrid', etc. Empty means not configured
  fromEmail?: string;
  secure?: boolean;
  // SendGrid settings (can be extended)
  sendGridApiKey?: string;
  // SMTP settings
  smtpHost?: string;
  smtpPassword?: string;
  smtpPort?: number;
  smtpUsername?: string;
  // Add other provider settings as needed
}

export async function createOrUpdateAccountEmailSettings(
  dbSession: Session, 
  accountId: string, 
  settings: EmailSettings
) {
  // First try to find existing EmailSetting
  const findResult = await dbSession.run(
    `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
     RETURN s.key as key`,
    { accountId }
  );

  let settingsKey: string;
  
  if (findResult.records.length === 0) {
    // Create new EmailSetting if not found
    settingsKey = `email_settings_${Date.now()}`;
    await dbSession.run(
      `MATCH (a:Account {id: $accountId})
       CREATE (s:EmailSetting {
         key: $key,
         createdAt: datetime(),
         updatedAt: datetime()
       })
       CREATE (a)-[:AccountEmailSetting]->(s)
       SET s += $settings
       RETURN s.key as key`,
      { accountId, key: settingsKey, settings }
    );
  } else {
    // Update existing EmailSetting
    settingsKey = findResult.records[0].get("key");
    await dbSession.run(
      `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
       SET s += $settings,
           s.updatedAt = datetime()
       RETURN s.key as key`,
      { accountId, settings }
    );
  }

  return settingsKey;
}

export async function getAccountEmailSettings(dbSession: Session, accountId: string) {
  const result = await dbSession.run(
    `MATCH (a:Account {id: $accountId})-[:AccountEmailSetting]->(s:EmailSetting)
     RETURN s as settings`,
    { accountId }
  );
  return result.records[0]?.get("settings") || null;
} 