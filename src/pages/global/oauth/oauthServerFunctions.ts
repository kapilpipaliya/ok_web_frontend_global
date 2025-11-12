import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Vertex } from "~/lib/graph/type/vertex";
import {
  encryptClientSecret,
  decryptClientSecret,
} from "~/lib/auth/tokenEncryption";

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

      // Decrypt the client secret and rename to googleClientSecret for the frontend
      if (vertex.P.googleClientSecretEncrypted) {
        try {
          vertex.P.googleClientSecret = decryptClientSecret(
            vertex.P.googleClientSecretEncrypted,
          );
          // Remove the encrypted version from the response
          delete vertex.P.googleClientSecretEncrypted;
        } catch (e) {
          console.error("Failed to decrypt client secret:", e);
          // Set to empty string if decryption fails
          vertex.P.googleClientSecret = "";
          delete vertex.P.googleClientSecretEncrypted;
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

    // Encrypt the client secret if provided using proper AES-256-GCM encryption
    let encryptedSecret = googleClientSecret;
    if (googleClientSecret && googleClientSecret.trim() !== "") {
      try {
        encryptedSecret = encryptClientSecret(googleClientSecret);
      } catch (error) {
        console.error("Failed to encrypt client secret:", error);
        return {
          error:
            "Failed to encrypt client secret. Please ensure TOKEN_ENCRYPTION_KEY is properly configured.",
        };
      }
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
            o.googleClientSecretEncrypted = $googleClientSecretEncrypted,
            o.googleEnabled = $googleEnabled,
            o.updatedAt = datetime()
        RETURN o
      `;

      await dbSession.run(updateQuery, {
        googleClientId: googleClientId || "",
        googleClientSecretEncrypted: encryptedSecret || "",
        googleEnabled: googleEnabled,
      });
    } else {
      // Create new settings
      const createQuery = `
        CREATE (o:OAuthSettings {
          googleClientId: $googleClientId,
          googleClientSecretEncrypted: $googleClientSecretEncrypted,
          googleEnabled: $googleEnabled,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN o
      `;

      await dbSession.run(createQuery, {
        googleClientId: googleClientId || "",
        googleClientSecretEncrypted: encryptedSecret || "",
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
