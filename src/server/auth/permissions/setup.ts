export const setupPermissionsSchema = `
CREATE CONSTRAINT unique_permission IF NOT EXISTS
FOR (p:Permission) REQUIRE p.key IS UNIQUE;

CREATE CONSTRAINT unique_role IF NOT EXISTS
FOR (r:Role) REQUIRE r.key IS UNIQUE;

MERGE (admin:Role {key: 'Admin', name: 'Administrator'})
MERGE (super:Role {key: 'SuperUser', name: 'Super User'})
MERGE (user:Role {key: 'User', name: 'Regular User'})

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
`; 