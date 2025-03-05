import type { Session, Transaction } from "neo4j-driver";

import { getDefaultTheme } from "~/lib/theme/getDefaultTheme";

export async function createRootFolder(
  tx: Session | Transaction,
): Promise<void> {
  const query = `
    MERGE (:Folder {key: 'Root'})
    MERGE (:Comp {key: 'Root'})
    MERGE (:Perm {key: 'Root'})
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
    await createSupportStatus(tx);
  } catch (error) {
    console.error("Error creating root folder or root comp:", error);
    throw error;
  }
}

// TODO: this is access levels, not permissions
async function createDefaultPermissions(tx: Session | Transaction) {
  return;
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

const createSupportStatus = async (tx: Session | Transaction) => {
  const query = `
    MERGE (openStatus:SupportStatus {key: 'Open'})
    SET openStatus.name = 'Open'
    SET openStatus.description = 'The ticket is open and awaiting response.'
    
    MERGE (inProgressStatus:SupportStatus {key: 'In Progress'})
    SET inProgressStatus.name = 'In Progress'
    SET inProgressStatus.description = 'The ticket is currently being worked on.'
    
    MERGE (resolvedStatus:SupportStatus {key: 'Resolved'})
    SET resolvedStatus.name = 'Resolved'
    SET resolvedStatus.description = 'The ticket has been resolved.'
    
    MERGE (closedStatus:SupportStatus {key: 'Closed'})
    SET closedStatus.name = 'Closed'
    SET closedStatus.description = 'The ticket has been closed.'
  `;

  try {
    await tx.run(query);
  } catch (error) {
    console.error("Error creating SupportStatus vertices:", error);
    throw error;
  }
};

async function createDefaultRoles(tx: Session | Transaction) {
  const createConstraintPermissionQuery = `
    CREATE CONSTRAINT unique_permission IF NOT EXISTS
    FOR (p:Perm) REQUIRE p.key IS UNIQUE;
  `;

  const createConstraintRoleQuery = `
    CREATE CONSTRAINT unique_role IF NOT EXISTS
    FOR (r:Role) REQUIRE r.key IS UNIQUE;
  `;

  const createRolesQuery = `
    MERGE (admin:Role {key: 'Admin'})
    MERGE (user:Role {key: 'User'})
    MERGE (guest:Role {key: 'Guest'})
  `;

  try {
    await tx.run(createConstraintPermissionQuery);
    await tx.run(createConstraintRoleQuery);
    await tx.run(createRolesQuery);
  } catch (error) {
    console.error("Error creating default roles:", error);
    throw error;
  }
}

/*
// Create permissions
UNWIND [
  {key: 'create:user', name: 'Create User', description: 'Can create new users'},
  {key: 'delete:user', name: 'Delete User', description: 'Can delete users'},
  {key: 'edit:user', name: 'Edit User', description: 'Can edit user details'},
  {key: 'view:user', name: 'View User', description: 'Can view user details'},
  {key: 'manage:roles', name: 'Manage Roles', description: 'Can manage roles'},
  {key: 'manage:system', name: 'Manage System', description: 'Can manage system settings'},
  {key: 'upload:files', name: 'Upload Files', description: 'Can upload files'},
  {key: 'delete:files', name: 'Delete Files', description: 'Can delete files'},
  {key: 'view:files', name: 'View Files', description: 'Can view files'}
] AS perm
MERGE (p:Permission {key: perm.key})
SET p += perm;
*/
