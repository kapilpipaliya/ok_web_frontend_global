export const API = {
  auth: {
    autoLoginUrl: "/api/auth/autoLogin",
    changePasswordUrl: "/api/auth/changePassword",
    getUserUrl: "/api/auth/getUser",
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
    downloadFileUrl: "/api/file/download",
    replaceFileUrl: "/api/file/replace",
    uploadFileUrl: "/api/file/upload",
  },
  // Other endpoints
  getInitialDataUrl: "/api/get/getInitialData",
  role: {
    deleteRoleUrl: "/api/roles/delete",
    getRolesUrl: "/api/roles/list",
    getRoleUrl: "/api/roles/get",
    updateRoleUrl: "/api/roles/update",
    upsertRoleUrl: "/api/roles/upsert",
  },
  settings: {
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
  },
  subdomain: {
    activityUrl: "/api/subdomain/activity",
    createUrl: "/api/subdomain/create",
    deleteUrl: "/api/subdomain/delete",
    listUrl: "/api/subdomain/list",
    updateUrl: "/api/subdomain/update",
  },
  submitDataUrl: "/api/mutate/submitData",
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
