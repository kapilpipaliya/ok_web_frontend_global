/**
 * App subdomains (decodecommerce.com). Single source of truth for hostname checks.
 * Update this list when adding or changing app subdomains.
 */
export const APP_SUBDOMAIN_HOSTNAMES = [
  "decodeproduct.decodecommerce.com",
  "orvio.decodecommerce.com",
  "decodefile.decodecommerce.com",
  "storetasks.decodecommerce.com",
  "attendra.decodecommerce.com",
] as const;

/**
 * Returns true if the given hostname is one of the app subdomains
 * (decodeproduct, orvio, decodefile).
 */
export function isAppSubdomain(hostname: string): boolean {
  return (APP_SUBDOMAIN_HOSTNAMES as readonly string[]).includes(hostname);
}
