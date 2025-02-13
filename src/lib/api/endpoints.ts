export const API = {
  changePasswordUrl: "/api/profile/changePassword",
  createSubDomainUrl: "/api/subdomain/create",
  deleteSubDomainUrl: "/api/subdomain/delete",
  downloadFileUrl: "/api/file/download",
  getInitialDataUrl: "/api/get/get_initial_data",
  getSubDomainActivityUrl: "/api/subdomain/activity",
  getSubDomainInfo: "/api/get/get_sub_domain_info",
  // Subdomain management endpoints
  getSubDomainsUrl: "/api/subdomain/list",
  getUserUrl: "/api/auth/get_user",
  loginUrl: "/api/auth/login",
  logOutUrl: "/api/auth/logout",
  profileUrl: "/api/profile/profile",
  replaceFileUrl: "/api/file/replace",
  signUpUrl: "/api/auth/signup",
  submitDataUrl: "/api/mutate/submit_data",
  updateProfileImageUrl: "/api/profile/updateProfileImage",
  updateSubDomainUrl: "/api/subdomain/update",
  uploadFileUrl: "/api/file/upload",
};

export function generate401RedirectUrl(pathname: string): string {
  return `/auth/login?redirectUrl=${encodeURIComponent(pathname)}`;
}
