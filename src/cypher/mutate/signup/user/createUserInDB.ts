import type { Session, Transaction } from "neo4j-driver";

import { v7 as uuidv7 } from "uuid";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { hashPassword } from "~/lib/auth/password";

// Common interfaces
interface BaseUserData {
  email: string;
  emailConfirmed?: boolean;
  username: string;
}

interface UserDataWithPassword extends BaseUserData {
  password: string;
}

// Define a loose return type to accommodate what convertNodeToJson returns
type UserResult = {
  [key: string]: unknown;
  createdAt: string;
  email: string;
  emailConfirmed: boolean;
  username: string;
  uuid: string;
};

/**
 * Create a user in the super database
 */
export async function createUserInSuperDB(
  superTx: Session | Transaction,
  userData: UserDataWithPassword,
): Promise<UserResult> {
  const uuid = uuidv7();
  const { hashedPassword, processedData, salt } =
    await processUserData(userData);

  const createUserParams = {
    ...processedData,
    hashedPassword,
    salt,
    uuid,
  };

  return executeUserCreationQuery(
    superTx,
    buildUserCreationQuery("SuperDB"),
    createUserParams,
    "SuperDB",
  );
}

/**
 * Create a user in the user database
 */
export async function createUserInUserDB(
  sessionOrTx: Session | Transaction,
  params: Record<string, unknown> & UserDataWithPassword,
  isSystemUser?: boolean,
): Promise<UserResult> {
  const uuid = (params.uuid as string) || uuidv7();
  const { hashedPassword, processedData, salt } = await processUserData(
    params,
    isSystemUser,
  );

  const queryParams = {
    ...processedData,
    hashedPassword,
    isSystemUser: isSystemUser ?? null,
    salt,
    uuid,
  };

  return executeUserCreationQuery(
    sessionOrTx,
    buildUserCreationQuery("UserDB"),
    queryParams,
    "UserDB",
  );
}

/**
 * Build a Neo4j query for user creation
 * @param dbType The type of database (SuperDB or UserDB)
 * @param additionalFields Additional fields to include in the query
 */
function buildUserCreationQuery(
  dbType: "SuperDB" | "UserDB",
  additionalFields: Record<string, boolean> = {},
): string {
  // Start with the common fields all user creations need
  const baseFields = [
    "username: $username",
    "uuid: $uuid",
    "email: $email",
    "password: $hashedPassword",
    "salt: $salt",
    "emailConfirmed: $emailConfirmed",
  ];

  // Add database-specific fields or conditionally include fields
  const dbSpecificFields = [];

  if (dbType === "UserDB" || additionalFields["isSystemUser"]) {
    dbSpecificFields.push("isSystemUser: $isSystemUser");
  }

  // Add any additional custom fields defined in additionalFields
  Object.entries(additionalFields).forEach(([field, include]) => {
    if (include && field !== "isSystemUser") {
      // isSystemUser already handled above
      dbSpecificFields.push(`${field}: $${field}`);
    }
  });

  // Combine all fields
  const allFields = [...baseFields, ...dbSpecificFields];

  // Build and return the query
  return `
    CREATE (u:User {
      ${allFields.join(",\n      ")}
    }) 
    SET u.createdAt = localDateTime() 
    RETURN u;
  `;
}

/**
 * Common function to execute a Neo4j user creation query
 */
async function executeUserCreationQuery(
  sessionOrTx: Session | Transaction,
  query: string,
  params: Record<string, unknown>,
  dbName: string,
): Promise<UserResult> {
  try {
    const result = await sessionOrTx.run(query, params);
    const userNode = result.records[0]?.get("u");

    if (!userNode) {
      throw new Error(`Failed to create user in ${dbName}`);
    }

    // Convert to unknown first, then to the expected type
    return convertNodeToJson(userNode) as unknown as UserResult;
  } catch (error) {
    console.error(`Error creating user in ${dbName}:`, error);
    throw error;
  }
}

/**
 * Process user data and hash password if needed
 */
async function processUserData(
  userData: UserDataWithPassword,
  isSystemUser?: boolean,
): Promise<{
  hashedPassword: null | string;
  processedData: Record<string, unknown>;
  salt: null | string;
}> {
  let hashedPassword = null;
  let salt = null;

  // Only hash password for non-system users
  if (
    userData.password &&
    typeof userData.password === "string" &&
    !isSystemUser
  ) {
    const hashResult = await hashPassword(userData.password);
    hashedPassword = hashResult.hashedPassword;
    salt = hashResult.salt;
  }

  return {
    hashedPassword,
    processedData: {
      ...userData,
      emailConfirmed: userData.emailConfirmed ?? false,
    },
    salt,
  };
}
