export const API = {
  getInitialDataUrl: "/api/get/get_initial_data",
  getSubDomainInfo: "/api/get/get_sub_domain_info",
  getUserUrl: "/api/auth/get_user",
  loginUrl: "/api/auth/login",
  logOutUrl: "/api/auth/logout",
  profileUrl: "/api/profile/profile",
  signUpUrl: "/api/auth/signup",
  submitDataUrl: "/api/mutate/submit_data",
};

export function generate401RedirectUrl(pathname: string): string {
  return `/auth/login?redirectUrl=${encodeURIComponent(pathname)}`;
}
