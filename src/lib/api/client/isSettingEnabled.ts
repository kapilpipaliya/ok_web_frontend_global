import type { ServerResult } from "~/cypher/types/ServerResult";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

/**
 * Check if a specific setting type is enabled
 * @param type - Setting type (oauth, razorpay, stripe, etc.)
 * @param enabledField - The field name to check (e.g., 'googleEnabled', 'razorpayEnabled')
 * @returns Promise<ServerResult> with boolean result
 */
export async function isSettingEnabled(
  type: string,
  enabledField: string,
): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    // Check if the setting exists and the specified field is true
    const result = await dbSession.run(
      `MATCH (s:Setting {type: $type})
       WHERE s[$enabledField] = true
       RETURN s LIMIT 1`,
      { type, enabledField },
    );

    return { result: result.records.length > 0 };
  } catch (error) {
    return { result: false };
  } finally {
    await dbSession.close();
  }
}

/**
 * Check if Google OAuth is enabled
 * @returns Promise<ServerResult> with boolean result
 */
export async function isGoogleOAuthEnabled(): Promise<ServerResult> {
  "use server";
  return await isSettingEnabled("oauth", "googleEnabled");
}

/**
 * Check if Razorpay is enabled
 * @returns Promise<ServerResult> with boolean result
 */
export async function isRazorpayEnabled(): Promise<ServerResult> {
  "use server";
  return await isSettingEnabled("razorpay", "razorpayEnabled");
}

/**
 * Check if Stripe is enabled
 * @returns Promise<ServerResult> with boolean result
 */
export async function isStripeEnabled(): Promise<ServerResult> {
  "use server";
  return await isSettingEnabled("stripe", "stripeEnabled");
}
