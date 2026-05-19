import type { ServerResult } from "~/cypher/types/ServerResult";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import {
  getSetting as getSettingFunc,
  saveSetting as saveSettingFunc,
} from "~/lib/api/server/settings/settingsFunctions";
import { enqueueEmailSettingsShopSync } from "~/server/queue/emailSettingsShopSyncQueue";
import { getUserFromSession } from "~/server/auth/session/getUserFromSession";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";

/**
 * Get settings by type from the server
 * @param type - Setting type (oauth, email, razorpay, stripe, etc.)
 * @returns Promise<ServerResult> with settings data
 */
export async function getSetting(type: string): Promise<ServerResult> {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    let accountId: string | undefined;
    if (subDomain === ADMIN_DB_NAME) {
      // Get account ID for account-specific settings
      const user = await getUserFromSession();
      const accountResult = await dbSession.run(
        `MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
         RETURN a.id as accountId`,
        { uuid: user?.P.uuid },
      );
      accountId = accountResult.records[0]?.get("accountId");
    }

    return await getSettingFunc(dbSession, type, accountId);
  } finally {
    await dbSession.close();
  }
}

/**
 * Save or update settings by type
 * @param type - Setting type (oauth, email, razorpay, stripe, etc.)
 * @param data - Settings data to save
 * @returns Promise<ServerResult> with updated settings
 */
export async function saveSetting(
  type: string,
  data: Record<string, unknown>,
): Promise<ServerResult> {
  "use server";

  const { dbSession, subDomain } = await getDBSessionForSubdomain();

  try {
    const user = await getUserFromSession();

    if (!user) {
      return {
        error: "User not found",
      };
    }

    let accountId: string | undefined;
    if (subDomain === ADMIN_DB_NAME) {
      // Get account ID for account-specific settings
      const accountResult = await dbSession.run(
        `MATCH (a:Account)-[:AccountUser]->(u:User {uuid: $uuid})
         RETURN a.id as accountId`,
        { uuid: user?.P.uuid },
      );
      accountId = accountResult.records[0]?.get("accountId");
    }

    const result = await saveSettingFunc(
      dbSession,
      type,
      data,
      user?.P.email ?? "",
      accountId,
    );

    if (
      !result.error &&
      type === "email" &&
      !accountId
    ) {
      void enqueueEmailSettingsShopSync(subDomain).catch((err) => {
        console.warn(
          "[Email settings] Failed to enqueue Shopify shop email sync:",
          err,
        );
      });
    }

    return result;
  } finally {
    await dbSession.close();
  }
}
