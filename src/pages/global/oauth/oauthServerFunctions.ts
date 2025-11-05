import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function getOAuthSettings(): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    // Fetch OAuth settings from database
    const result = await dbSession.run(
      "MATCH (o:OAuthSettings) RETURN o LIMIT 1",
    );

    if (result.records.length > 0) {
      const node = result.records[0].get("o");
      const vertex = convertNodeToJson(node) as Vertex;

      // Decrypt the client secret in the vertex properties
      if (vertex.P.googleClientSecret) {
        try {
          vertex.P.googleClientSecret = Buffer.from(
            vertex.P.googleClientSecret,
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

export async function saveOAuthSettings(settings: {
  googleClientId?: string;
  googleClientSecret?: string;
  googleEnabled?: boolean;
}): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    const { googleClientId, googleClientSecret, googleEnabled } = settings;

    // Encrypt the client secret if provided
    let encryptedSecret = googleClientSecret;
    if (googleClientSecret && googleClientSecret.trim() !== "") {
      // Simple encryption - in production, use proper encryption
      encryptedSecret = Buffer.from(googleClientSecret).toString("base64");
    }

    // Check if OAuthSettings vertex exists
    const checkResult = await dbSession.run(
      "MATCH (o:OAuthSettings) RETURN o LIMIT 1",
    );

    if (checkResult.records.length > 0) {
      // Update existing settings
      const updateQuery = `
        MATCH (o:OAuthSettings)
        SET o.googleClientId = $googleClientId,
            o.googleClientSecret = $googleClientSecret,
            o.googleEnabled = $googleEnabled
        RETURN o
      `;

      await dbSession.run(updateQuery, {
        googleClientId: googleClientId || "",
        googleClientSecret: encryptedSecret || "",
        googleEnabled: googleEnabled,
      });
    } else {
      // Create new settings
      const createQuery = `
        CREATE (o:OAuthSettings {
          googleClientId: $googleClientId,
          googleClientSecret: $googleClientSecret,
          googleEnabled: $googleEnabled
        })
        RETURN o
      `;

      await dbSession.run(createQuery, {
        googleClientId: googleClientId || "",
        googleClientSecret: encryptedSecret || "",
        googleEnabled: googleEnabled,
      });
    }

    return { result: [], message: "OAuth settings saved successfully" };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}

export async function isGoogleOAuthEnabled(): Promise<ServerResult> {
  "use server";

  const { dbSession } = await getDBSessionForSubdomain();

  try {
    // Check if Google OAuth is enabled
    const result = await dbSession.run(
      "MATCH (o:OAuthSettings) WHERE o.googleEnabled = true RETURN o LIMIT 1",
    );

    return { result: result.records.length > 0 };
  } catch (error) {
    return { result: false };
  } finally {
    await dbSession.close();
  }
}
