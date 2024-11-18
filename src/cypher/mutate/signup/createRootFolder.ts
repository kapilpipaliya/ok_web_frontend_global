import type { Session, Transaction } from "neo4j-driver";

import { getDefaultTheme } from "~/pages/admin_layout/getDefaultTheme";

export async function createRootFolder(
  tx: Session | Transaction,
  uuid: string,
): Promise<void> {
  const query = `
    MERGE (:Folder {key: 'Root'})
    MERGE (:Comp {key: 'Root'})
    MERGE (globalSetting:GlobalSetting {key: 'Default'})
    MERGE (theme:Theme {key: 'Default'})
    SET theme.data = $theme
    MERGE (globalSetting)-[:GlobalSettingTheme]->(theme)
  `;

  const params = {
    theme: getDefaultTheme(),
  };

  try {
    await tx.run(query, params);
    await createDefaultPermissions(tx);
    await createDefaultRoles(tx);
    await addAdminRoleToUser(tx, uuid);
  } catch (error) {
    console.error("Error creating root folder or root comp:", error);
    throw error;
  }
}

async function createDefaultPermissions(tx: Session | Transaction) {
  const query = `
    MERGE (insert:Perm {key: 'insert'})
    MERGE (edit:Perm {key: 'edit'}) 
    MERGE (view:Perm {key: 'view'})
    MERGE (delete:Perm {key: 'delete'})
  `;

  try {
    await tx.run(query);
  } catch (error) {
    console.error("Error creating default permissions:", error);
    throw error;
  }
}

async function createDefaultRoles(tx: Session | Transaction) {
  const query = `
    MERGE (admin:Role {key: 'Admin'})
    MERGE (guest:Role {key: 'Guest'})
  `;

  try {
    await tx.run(query);
  } catch (error) {
    console.error("Error creating default roles:", error);
    throw error;
  }
}

export async function addAdminRoleToUser(
  sessionOrTx: Session | Transaction,
  uuid: string,
) {
  const query = `
    MATCH (u:User {uuid: $uuid}), (r:Role {key: 'Admin'})
    CREATE (u)-[:UserRole]->(r)
  `;

  const params = { uuid };

  try {
    await sessionOrTx.run(query, params);
  } catch (error) {
    console.error("Error adding Admin role to user:", error);
    throw error;
  }
}
