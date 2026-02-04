/**
 * Server actions for Shopify shop migration request (admin page).
 * Use from admin GlobalSettings > Shop migration request.
 */

import {
  getMigrationRequestForAllShops,
  saveMigrationRequestForAllShops as saveMigrationRequestForAllShopsLib,
} from "~/lib/shopify/shopMigrationRequest";

export async function getMigrationRequestForAllShopsAction(): Promise<{
  success: boolean;
  migrationRequestAt?: string;
  error?: string;
}> {
  "use server";
  try {
    const at = await getMigrationRequestForAllShops();
    return {
      success: true,
      migrationRequestAt: at ? at.toISOString() : undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

export async function saveMigrationRequestForAllShopsAction(): Promise<{
  success: boolean;
  migrationRequestAt?: string;
  error?: string;
}> {
  "use server";
  try {
    const at = await saveMigrationRequestForAllShopsLib();
    return {
      success: true,
      migrationRequestAt: at.toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
