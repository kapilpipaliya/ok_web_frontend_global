export const API = {
  changePasswordUrl: "/api/auth/changePassword",
  createSubDomainUrl: "/api/subdomain/create",
  deleteSubDomainUrl: "/api/subdomain/delete",
  downloadFileUrl: "/api/file/download",
  // Global Settings endpoints
  getCompanySettingsUrl: "/api/settings/company/get",
  getEmailSettingsUrl: "/api/settings/email/get",
  getGeneralSettingsUrl: "/api/settings/general/get",
  getInitialDataUrl: "/api/get/get_initial_data",
  getSubDomainActivityUrl: "/api/subdomain/activity",
  // Subdomain management endpoints
  getSubDomainsUrl: "/api/subdomain/list",
  getUserUrl: "/api/auth/get_user",
  loginUrl: "/api/auth/login",
  logOutUrl: "/api/auth/logout",
  profileUrl: "/api/auth/update_profile",
  replaceFileUrl: "/api/file/replace",
  signUpUrl: "/api/auth/signup",
  submitDataUrl: "/api/mutate/submit_data",

  testEmailSettingsUrl: "/api/settings/email/test",
  updateCompanySettingsUrl: "/api/settings/company", 
  updateEmailSettingsUrl: "/api/settings/email",
  updateGeneralSettingsUrl: "/api/settings/general",
  updateProfileImageUrl: "/api/auth/updateProfileImage",
  updateSubDomainUrl: "/api/subdomain/update",
  uploadFileUrl: "/api/file/upload",
};

export function generate401RedirectUrl(pathname: string): string {
  return `/auth/login?redirectUrl=${encodeURIComponent(pathname)}`;
}
