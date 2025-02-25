export type Permission = {
  key: string;
  name: string;
  description: string;
};

export type Role = {
  key: string;
  name: string;
  permissions: string[];
};

export const SYSTEM_ROLES = {
  ADMIN: 'Admin',
  SUPER_USER: 'SuperUser',
  USER: 'User',
} as const;

export const PERMISSIONS = {
  CREATE_USER: 'create:user',
  DELETE_USER: 'delete:user',
  EDIT_USER: 'edit:user',
  VIEW_USER: 'view:user',
  MANAGE_ROLES: 'manage:roles',
  MANAGE_SYSTEM: 'manage:system',
  UPLOAD_FILES: 'upload:files',
  DELETE_FILES: 'delete:files',
  VIEW_FILES: 'view:files',
} as const; 