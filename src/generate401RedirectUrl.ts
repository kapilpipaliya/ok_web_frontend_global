export function generate401RedirectUrl(pathname: string): string {
  return `/auth/login?redirectUrl=${encodeURIComponent(pathname)}`;
}
