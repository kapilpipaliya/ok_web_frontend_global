import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function getRazorpaySettings(): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    // Fetch Razorpay settings from database
    const result = await dbSession.run(
      "MATCH (s:RazorpaySettings) RETURN s LIMIT 1",
    );

    if (result.records.length > 0) {
      const node = result.records[0].get("s");
      const vertex = convertNodeToJson(node) as Vertex;

      // Decrypt the key secret in the vertex properties
      if (vertex.P.razorpayKeySecret) {
        try {
          vertex.P.razorpayKeySecret = Buffer.from(
            vertex.P.razorpayKeySecret,
            "base64",
          ).toString("utf-8");
        } catch (e) {
          // Keep as is if decryption fails
        }
      }

      // Decrypt the webhook secret in the vertex properties
      if (vertex.P.razorpayWebhookSecret) {
        try {
          vertex.P.razorpayWebhookSecret = Buffer.from(
            vertex.P.razorpayWebhookSecret,
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

export async function saveRazorpaySettings(settings: {
  razorpayEnabled?: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
}): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    const {
      razorpayEnabled,
      razorpayKeyId,
      razorpayKeySecret,
      razorpayWebhookSecret,
    } = settings;

    // Encrypt the key secret if provided
    let encryptedKeySecret = razorpayKeySecret;
    if (razorpayKeySecret && razorpayKeySecret.trim() !== "") {
      encryptedKeySecret = Buffer.from(razorpayKeySecret).toString("base64");
    }

    // Encrypt the webhook secret if provided
    let encryptedWebhookSecret = razorpayWebhookSecret;
    if (razorpayWebhookSecret && razorpayWebhookSecret.trim() !== "") {
      encryptedWebhookSecret = Buffer.from(razorpayWebhookSecret).toString(
        "base64",
      );
    }

    // Check if RazorpaySettings vertex exists
    const checkResult = await dbSession.run(
      "MATCH (s:RazorpaySettings) RETURN s LIMIT 1",
    );

    if (checkResult.records.length > 0) {
      // Update existing settings
      const updateQuery = `
        MATCH (s:RazorpaySettings)
        SET s.razorpayEnabled = $razorpayEnabled,
            s.razorpayKeyId = $razorpayKeyId,
            s.razorpayKeySecret = $razorpayKeySecret,
            s.razorpayWebhookSecret = $razorpayWebhookSecret
        RETURN s
      `;

      await dbSession.run(updateQuery, {
        razorpayEnabled: razorpayEnabled,
        razorpayKeyId: razorpayKeyId || "",
        razorpayKeySecret: encryptedKeySecret || "",
        razorpayWebhookSecret: encryptedWebhookSecret || "",
      });
    } else {
      // Create new settings
      const createQuery = `
        CREATE (s:RazorpaySettings {
          razorpayEnabled: $razorpayEnabled,
          razorpayKeyId: $razorpayKeyId,
          razorpayKeySecret: $razorpayKeySecret,
          razorpayWebhookSecret: $razorpayWebhookSecret
        })
        RETURN s
      `;

      await dbSession.run(createQuery, {
        razorpayEnabled: razorpayEnabled,
        razorpayKeyId: razorpayKeyId || "",
        razorpayKeySecret: encryptedKeySecret || "",
        razorpayWebhookSecret: encryptedWebhookSecret || "",
      });
    }

    return { result: [], message: "Razorpay settings saved successfully" };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

export async function isRazorpayEnabled(): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    // Check if Razorpay is enabled
    const result = await dbSession.run(
      "MATCH (s:RazorpaySettings) WHERE s.razorpayEnabled = true RETURN s LIMIT 1",
    );

    return { result: result.records.length > 0 };
  } catch (error) {
    return { result: false };
  } finally {
    await dbSession.close();
  }
}
