/**
 * App subdomains (decodecommerce.com). Single source of truth for hostname checks.
 * Update this list when adding or changing app subdomains.
 */
export const APP_SUBDOMAIN_HOSTNAMES = [
  "decodeproduct.decodecommerce.com",
  "decodeorder.decodecommerce.com",
  "decodefile.decodecommerce.com",
] as const;

/**
 * Returns true if the given hostname is one of the app subdomains
 * (decodeproduct, decodeorder, decodefile).
 */
export function isAppSubdomain(hostname: string): boolean {
  return (APP_SUBDOMAIN_HOSTNAMES as readonly string[]).includes(hostname);
}
