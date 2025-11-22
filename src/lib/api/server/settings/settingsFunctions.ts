import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { processResult } from "~/cypher/conversion/processResult";
import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { encryptToken } from "~/lib/auth/tokenEncryption";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";
import type { Session } from "neo4j-driver";

/**
 * Check if a field name indicates it should be encrypted
 * @param key - Field name
 * @returns true if field should be encrypted
 */
export function isSecretField(key: string): boolean {
  return key.endsWith("Secret");
}

/**
 * Check if a value is masked (contains only asterisks)
 * @param value - Value to check
 * @returns true if value is masked
 */
export function isMaskedValue(value: string): boolean {
  return value.match(/^\*+$/) !== null;
}

/**
 * Mask secret fields in settings data
 * @param vertex - Settings vertex with properties
 * @returns Vertex with secret fields masked
 */
function maskSecretFields(vertex: Vertex): Vertex {
  if (!vertex || !vertex.P) return vertex;

  const maskedProperties = { ...vertex.P };

  for (const key in maskedProperties) {
    if (isSecretField(key) && maskedProperties[key]) {
      const originalValue = String(maskedProperties[key]);
      // Use same number of asterisks as original value length
      maskedProperties[key] = "*".repeat(originalValue.length);
    }
  }

  return {
    ...vertex,
    P: maskedProperties,
  };
}

/**
 * Encrypt secret fields in data before saving
 * @param data - Settings data to process
 * @returns Processed data with encrypted secrets
 */
function encryptSecretFields(data: Record<string, unknown>): Record<string, unknown> {
  const processed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (isSecretField(key) && typeof value === "string") {
      // If value is masked (contains only *), skip this field (preserve existing value)
      if (isMaskedValue(value)) {
        continue; // Don't include in update
      }
      // Encrypt the secret
      processed[key] = encryptToken(value);
    } else {
      processed[key] = value;
    }
  }

  return processed;
}

/**
 * Get settings by type
 * @param dbSession - Neo4j database session
 * @param type - Setting type (oauth, email, razorpay, stripe, etc.)
 * @param accountId - Optional account ID for account-specific settings
 * @returns ServerResult with settings data
 */
export async function getSetting(
  dbSession: Session,
  type: string,
  accountId?: string,
): Promise<ServerResult> {
  try {
    const nodes: { [key: string]: Vertex } = {};
    const relationships: { [key: string]: Edge } = {};

    let result;
    if (accountId) {
      // Get account-specific settings
      result = await dbSession.run(
        `MATCH (a:Account {id: $accountId})-[:AccountSetting]->(s:Setting {type: $type})
         RETURN s as settings`,
        { accountId, type },
      );
    } else {
      // Get subdomain settings
      result = await dbSession.run(
        `MATCH (s:Setting {type: $type})
         RETURN s as settings`,
        { type },
      );
    }

    const settings = processResult(
      result.records,
      { nodes, relationships },
      "settings",
      "",
    );

    // Mask secret fields in the result
    const maskedSettings = settings.map((setting: Vertex) => maskSecretFields(setting));

    // Mask secret fields in the graph nodes
    const maskedNodes: { [key: string]: Vertex } = {};
    for (const [key, vertex] of Object.entries(nodes)) {
      maskedNodes[key] = maskSecretFields(vertex);
    }

    return {
      graph: {
        edges: relationships,
        vertexes: maskedNodes,
      },
      result: maskedSettings,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Save or update settings by type
 * @param dbSession - Neo4j database session
 * @param type - Setting type (oauth, email, razorpay, stripe, etc.)
 * @param data - Settings data to save
 * @param userEmail - User email for activity logging
 * @param accountId - Optional account ID for account-specific settings
 * @returns ServerResult with updated settings
 */
export async function saveSetting(
  dbSession: Session,
  type: string,
  data: Record<string, unknown>,
  userEmail: string,
  accountId?: string,
): Promise<ServerResult> {
  try {
    // Encrypt secret fields in the data
    const processedData = encryptSecretFields(data);

    let settingsKey: string;

    if (accountId) {
      // Handle account-specific settings
      const findResult = await dbSession.run(
        `MATCH (a:Account {id: $accountId})-[:AccountSetting]->(s:Setting {type: $type})
         RETURN s.key as key`,
        { accountId, type },
      );

      if (findResult.records.length === 0) {
        // Create new Setting
        settingsKey = `${type}_Default`;
        await dbSession.run(
          `MATCH (a:Account {id: $accountId})
           CREATE (s:Setting {
             key: $key,
             type: $type,
             createdAt: datetime(),
             updatedAt: datetime()
           })
           CREATE (a)-[:AccountSetting]->(s)
           SET s += $data
           RETURN s.key as key`,
          { accountId, key: settingsKey, type, data: processedData },
        );
      } else {
        // Update existing Setting
        settingsKey = findResult.records[0].get("key");
        await dbSession.run(
          `MATCH (a:Account {id: $accountId})-[:AccountSetting]->(s:Setting {type: $type})
           SET s += $data,
               s.updatedAt = datetime()
           RETURN s.key as key`,
          { accountId, type, data: processedData },
        );
      }
    } else {
      // Handle subdomain settings
      const result = await dbSession.run(
        `MATCH (s:Setting {type: $type})
         SET s += $data,
             s.updatedAt = datetime()
         RETURN s.key as key`,
        { type, data: processedData },
      );

      if (result.records.length === 0) {
        // Create new Setting
        const newKey = `${type}_Default`;
        const createResult = await dbSession.run(
          `CREATE (s:Setting {
            key: $key,
            type: $type,
            createdAt: datetime(),
            updatedAt: datetime()
          })
          SET s += $data
          RETURN s.key as key`,
          { key: newKey, type, data: processedData },
        );
        settingsKey = createResult.records[0].get("key");
      } else {
        settingsKey = result.records[0].get("key");
      }
    }

    // Log activity
    await createActivityLog(
      dbSession,
      `UPDATE_${type.toUpperCase()}_SETTINGS`,
      "Setting",
      settingsKey,
      userEmail,
      `Updated ${type} settings`,
    );

    // Fetch the updated settings to return
    const updatedSettingsResult = await dbSession.run(
      "MATCH (s:Setting {key: $key}) RETURN s",
      { key: settingsKey },
    );
    const updatedSettings = convertNodeToJson(
      updatedSettingsResult.records[0]?.get("s"),
    );

    // Mask secret fields in the response
    const maskedSettings = maskSecretFields(updatedSettings);

    return {
      graph: {
        edges: {},
        vertexes: { [settingsKey]: maskedSettings },
      },
      result: maskedSettings,
    };
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Delete settings by type
 * @param dbSession - Neo4j database session
 * @param type - Setting type to delete
 * @param accountId - Optional account ID for account-specific settings
 * @returns ServerResult
 */
export async function deleteSetting(
  dbSession: Session,
  type: string,
  accountId?: string,
): Promise<ServerResult> {
  try {
    if (accountId) {
      await dbSession.run(
        `MATCH (a:Account {id: $accountId})-[r:AccountSetting]->(s:Setting {type: $type})
         DELETE r, s`,
        { accountId, type },
      );
    } else {
      await dbSession.run(`MATCH (s:Setting {type: $type}) DELETE s`, { type });
    }

    return {
      result: { success: true, message: `${type} settings deleted successfully` },
    };
  } catch (error) {
    return handleAPIError(error);
  }
}
