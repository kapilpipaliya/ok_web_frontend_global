export const API = {
  auth: {
    autoLoginUrl: "/api/auth/autoLogin",
    changePasswordUrl: "/api/auth/changePassword",
    // getUserUrl: "/api/auth/getUserRPC",
    loginUrl: "/api/auth/login",
    logOutUrl: "/api/auth/logout",
    passwordReset: {
      completeUrl: "/api/auth/password-reset/complete",
      requestUrl: "/api/auth/password-reset/request",
      verifyOtpUrl: "/api/auth/password-reset/verifyOtp",
    },
    prepareAutoLoginUrl: "/api/auth/prepareAutoLogin",
    profileUrl: "/api/auth/updateProfile",
    signUpUrl: "/api/auth/signup",
    updateProfileImageUrl: "/api/auth/updateProfileImage",
  },
  developer: {
    systemCleanupUrl: "/api/setup/systemCleanup",
  },
  email: {
    auditUrl: "/api/email/audit",
  },
  file: {
    deleteFileUrl: "/api/file/delete",
    downloadCompanyCircularLogoUrl: "/api/file/downloadCompanyCircularLogo",
    downloadCompanyRectangularLogoUrl:
      "/api/file/downloadCompanyRectangularLogo",
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
  urls: {
    admin: {
      contact: "/support/contact",
      globalSettings: "/admin/GlobalSettings",
      login: "/auth/login",
      // it's name is admin, but its for subdomains
      root: "/admin",
      support: "/admin/support",
      userSettings: "/admin/UserSettings",
    },
    system: {
      globalSettings: "/system/GlobalSettings",
      projects: "/system/projects",
      root: "/system/projects",
      userSettings: "/system/UserSettings",
    },
    user: {
      logout: "/auth/logout",
    },
  },
  user: {
    deleteUserUrl: "/api/users/delete",
    getUsersListUrl: "/api/users/list",
    inviteUserUrl: "/api/users/invite",
    selfDeleteUrl: "/api/users/self-delete",
    updateUserUrl: "/api/users/update",
  },
} as const;

export function generate401RedirectUrl(pathname: string): string {
  return `/auth/login?redirectUrl=${encodeURIComponent(pathname)}`;
}
