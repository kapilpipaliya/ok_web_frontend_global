export const API = {
  auth: {
    autoLoginUrl: "/api/auth/autoLogin",
    changePasswordUrl: "/api/auth/changePassword",
    // getUserUrl: "/api/auth/getUserRPC",
    loginUrl: "/api/auth/login",
    logOutUrl: "/api/auth/logout",
    prepareAutoLoginUrl: "/api/auth/prepare-auto-login",
    profileUrl: "/api/auth/updateProfile",
    signUpUrl: "/api/auth/signup",
    updateProfileImageUrl: "/api/auth/updateProfileImage",
  },
  email: {
    auditUrl: "/api/email/audit",
  },
  file: {
    deleteFileUrl: "/api/file/delete",
    downloadFileUrl: "/api/file/download",
    replaceFileUrl: "/api/file/replace",
    uploadFileUrl: "/api/file/upload",
  },
  // Other endpoints
  // getInitialDataUrl: "/api/get/getInitialData",
  permission: {
    deletePermissionUrl: "/api/permissions/delete",
  },
  role: {
    deleteRoleUrl: "/api/roles/delete",
    getRolesUrl: "/api/roles/list",
    getRoleUrl: "/api/roles/get",
    upsertRoleUrl: "/api/roles/upsert",
  },
  settings: {
    activity: {
      getUrl: "/api/settings/activity/list",
    },
    company: {
      getUrl: "/api/settings/company/get",
      updateLogoUrl: "/api/settings/updateCompanyLogo",
      updateUrl: "/api/settings/company/update",
    },
    email: {
      getUrl: "/api/settings/email/get",
      testUrl: "/api/settings/email/test",
      updateUrl: "/api/settings/email/update",
    },
    general: {
      getUrl: "/api/settings/general/get",
      updateUrl: "/api/settings/general/update",
    },
    theme: {
      deleteUrl: "/api/settings/theme/delete",
    },
  },
  subdomain: {
    activityUrl: "/api/subdomain/activity",
    createUrl: "/api/subdomain/create",
    deleteUrl: "/api/subdomain/delete",
    listUrl: "/api/subdomain/list",
    updateUrl: "/api/subdomain/update",
  },
  submitDataUrl: "/api/submit/submitData",
  support: {
    createTicketUrl: "/api/support/ticket/create",
    deleteTicketUrl: "/api/support/ticket/delete",
    getTicketsUrl: "/api/support/ticket/list",
    getTicketUrl: "/api/support/ticket/get",
    replyUrl: "/api/support/ticket/reply",
    upsertTicketUrl: "/api/support/ticket/upsert",
  },
  user: {
    deleteUserUrl: "/api/users/delete",
    getUsersListUrl: "/api/users/list",
    inviteUserUrl: "/api/users/invite",
    updateUserUrl: "/api/users/update",
  },
} as const;

export function generate401RedirectUrl(pathname: string): string {
  return `/auth/login?redirectUrl=${encodeURIComponent(pathname)}`;
}

// Define URL constants
export const AUTH_MENU_URLS = {
  ADMIN: {
    CONTACT: "/contact-us",
    GLOBAL_SETTINGS: "/admin/GlobalSettings",
    LOGIN: "/auth/login",
    USER_SETTINGS: "/admin/UserSettings",
  },
  SYSTEM: {
    GLOBAL_SETTINGS: "/system/GlobalSettings",
    PROJECTS: "/system/projects",
    USER_SETTINGS: "/system/UserSettings",
  },
} as const;
