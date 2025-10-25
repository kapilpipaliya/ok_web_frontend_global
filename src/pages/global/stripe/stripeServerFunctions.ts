import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function getStripeSettings(): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    // Fetch Stripe settings from database
    const result = await dbSession.run(
      "MATCH (s:StripeSettings) RETURN s LIMIT 1",
    );

    if (result.records.length > 0) {
      const node = result.records[0].get("s");
      const vertex = convertNodeToJson(node) as Vertex;

      // Decrypt the secret key in the vertex properties
      if (vertex.P.stripeSecretKey) {
        try {
          vertex.P.stripeSecretKey = Buffer.from(
            vertex.P.stripeSecretKey,
            "base64",
          ).toString("utf-8");
        } catch (e) {
          // Keep as is if decryption fails
        }
      }

      // Decrypt the webhook secret in the vertex properties
      if (vertex.P.stripeWebhookSecret) {
        try {
          vertex.P.stripeWebhookSecret = Buffer.from(
            vertex.P.stripeWebhookSecret,
            "base64",
          ).toString("utf-8");
        } catch (e) {
          // Keep as is if decryption fails
        }
      }

      return {
        result: [vertex],
      };
    }

    // Return empty array if no settings found
    return {
      result: [],
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

export async function saveStripeSettings(settings: {
  stripeEnabled?: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
}): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    const {
      stripeEnabled,
      stripePublishableKey,
      stripeSecretKey,
      stripeWebhookSecret,
    } = settings;

    // Encrypt the secret key if provided
    let encryptedSecretKey = stripeSecretKey;
    if (stripeSecretKey && stripeSecretKey.trim() !== "") {
      encryptedSecretKey = Buffer.from(stripeSecretKey).toString("base64");
    }

    // Encrypt the webhook secret if provided
    let encryptedWebhookSecret = stripeWebhookSecret;
    if (stripeWebhookSecret && stripeWebhookSecret.trim() !== "") {
      encryptedWebhookSecret = Buffer.from(stripeWebhookSecret).toString(
        "base64",
      );
    }

    // Check if StripeSettings vertex exists
    const checkResult = await dbSession.run(
      "MATCH (s:StripeSettings) RETURN s LIMIT 1",
    );

    if (checkResult.records.length > 0) {
      // Update existing settings
      const updateQuery = `
        MATCH (s:StripeSettings)
        SET s.stripeEnabled = $stripeEnabled,
            s.stripePublishableKey = $stripePublishableKey,
            s.stripeSecretKey = $stripeSecretKey,
            s.stripeWebhookSecret = $stripeWebhookSecret
        RETURN s
      `;

      await dbSession.run(updateQuery, {
        stripeEnabled: stripeEnabled || false,
        stripePublishableKey: stripePublishableKey || "",
        stripeSecretKey: encryptedSecretKey || "",
        stripeWebhookSecret: encryptedWebhookSecret || "",
      });
    } else {
      // Create new settings
      const createQuery = `
        CREATE (s:StripeSettings {
          stripeEnabled: $stripeEnabled,
          stripePublishableKey: $stripePublishableKey,
          stripeSecretKey: $stripeSecretKey,
          stripeWebhookSecret: $stripeWebhookSecret
        })
        RETURN s
      `;

      await dbSession.run(createQuery, {
        stripeEnabled: stripeEnabled || false,
        stripePublishableKey: stripePublishableKey || "",
        stripeSecretKey: encryptedSecretKey || "",
        stripeWebhookSecret: encryptedWebhookSecret || "",
      });
    }

    return { result: [], message: "Stripe settings saved successfully" };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

export async function isStripeEnabled(): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    // Check if Stripe is enabled
    const result = await dbSession.run(
      "MATCH (s:StripeSettings) WHERE s.stripeEnabled = true RETURN s LIMIT 1",
    );

    return { result: result.records.length > 0 };
  } catch (error) {
    return { result: false };
  } finally {
    await dbSession.close();
  }
}
