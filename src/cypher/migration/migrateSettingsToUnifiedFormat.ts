import type { Session } from "neo4j-driver";

/**
 * Migrate existing setting vertices to the unified Setting format
 * This script adds the Setting label and type property to existing settings
 * while keeping the old labels for backward compatibility
 *
 * @param dbSession - Neo4j database session
 */
export async function migrateSettingsToUnifiedFormat(dbSession: Session) {
  const migrations = [
    {
      oldLabel: "OAuthSetting",
      type: "oauth",
      keyPrefix: "oauth_",
    },
    {
      oldLabel: "EmailSetting",
      type: "email",
      keyPrefix: "email_",
    },
    {
      oldLabel: "RazorpaySetting",
      type: "razorpay",
      keyPrefix: "razorpay_",
    },
    {
      oldLabel: "StripeSetting",
      type: "stripe",
      keyPrefix: "stripe_",
    },
  ];

  console.log("Starting settings migration to unified format...");

  for (const migration of migrations) {
    try {
      // Check if any nodes exist with the old label
      const checkResult = await dbSession.run(
        `MATCH (s:${migration.oldLabel})
         RETURN count(s) as count`,
      );

      const count = checkResult.records[0]?.get("count").toNumber() || 0;

      if (count === 0) {
        console.log(`No ${migration.oldLabel} nodes found, skipping...`);
        continue;
      }

      console.log(`Found ${count} ${migration.oldLabel} node(s), migrating...`);

      // Add Setting label, type property, and REMOVE old label from existing nodes
      const migrateResult = await dbSession.run(
        `MATCH (s:${migration.oldLabel})
         SET s:Setting,
             s.type = $type,
             s.key = COALESCE(s.key, $defaultKey),
             s.updatedAt = COALESCE(s.updatedAt, datetime()),
             s.createdAt = COALESCE(s.createdAt, datetime())
         REMOVE s:${migration.oldLabel}
         RETURN s.key as key`,
        {
          type: migration.type,
          defaultKey: `${migration.keyPrefix}Default`,
        },
      );

      const migratedCount = migrateResult.records.length;
      console.log(
        `Successfully migrated ${migratedCount} ${migration.oldLabel} node(s)`,
      );

      // Log the keys
      migrateResult.records.forEach((record) => {
        console.log(`  - Migrated: ${record.get("key")}`);
      });

      // Update account-specific relationships for EmailSetting
      if (migration.oldLabel === "EmailSetting") {
        const accountRelResult = await dbSession.run(
          `MATCH (a:Account)-[r:AccountEmailSetting]->(s:EmailSetting)
           WHERE NOT (a)-[:AccountSetting]->(s)
           CREATE (a)-[:AccountSetting]->(s)
           RETURN count(r) as count`,
        );

        const accountRelCount =
          accountRelResult.records[0]?.get("count").toNumber() || 0;
        if (accountRelCount > 0) {
          console.log(
            `  - Updated ${accountRelCount} account email setting relationships`,
          );
        }
      }
    } catch (error) {
      console.error(`Error migrating ${migration.oldLabel}:`, error);
      throw error;
    }
  }

  console.log("Settings migration completed successfully!");

  // Print summary
  const summaryResult = await dbSession.run(
    `MATCH (s:Setting)
     RETURN s.type as type, count(s) as count
     ORDER BY type`,
  );

  console.log("\nMigration Summary:");
  console.log("==================");
  summaryResult.records.forEach((record) => {
    const type = record.get("type");
    const count = record.get("count").toNumber();
    console.log(`${type}: ${count} setting(s)`);
  });

  return {
    success: true,
    message: "Settings migration completed successfully",
  };
}

/**
 * Rollback migration - restores old labels, removes Setting label and type property
 * Use this if you need to revert the migration
 *
 * @param dbSession - Neo4j database session
 */
export async function rollbackSettingsMigration(dbSession: Session) {
  console.log("Rolling back settings migration...");

  const migrations = [
    { oldLabel: "OAuthSetting", type: "oauth" },
    { oldLabel: "EmailSetting", type: "email" },
    { oldLabel: "RazorpaySetting", type: "razorpay" },
    { oldLabel: "StripeSetting", type: "stripe" },
  ];

  for (const migration of migrations) {
    try {
      const result = await dbSession.run(
        `MATCH (s:Setting {type: $type})
         SET s:${migration.oldLabel}
         REMOVE s:Setting
         REMOVE s.type
         RETURN count(s) as count`,
        { type: migration.type },
      );

      const count = result.records[0]?.get("count").toNumber() || 0;
      console.log(`Rolled back ${count} ${migration.oldLabel} node(s)`);
    } catch (error) {
      console.error(`Error rolling back ${migration.oldLabel}:`, error);
      throw error;
    }
  }

  console.log("Rollback completed successfully!");

  return {
    success: true,
    message: "Settings migration rollback completed successfully",
  };
}
