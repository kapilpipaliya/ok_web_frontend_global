/**
 * `DOMAIN` is one or more hostnames, comma-separated (e.g. `app.com,www.app.com`).
 * Whitespace around entries is trimmed; empty entries are ignored.
 */
export function parseDomainEnv(domainEnv: string | undefined): string[] {
  if (domainEnv == null || domainEnv.trim() === "") {
    return [];
  }
  return domainEnv
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function getConfiguredAppDomains(): string[] {
  return parseDomainEnv(process.env.DOMAIN);
}

/** First `DOMAIN` entry — used when a single canonical host is required. */
export function getPrimaryAppDomain(): string | undefined {
  return getConfiguredAppDomains()[0];
}

export function hostnameMatchesConfiguredAppDomain(
  hostnameOrDomain: string | null | undefined,
): boolean {
  if (!hostnameOrDomain) {
    return false;
  }
  return getConfiguredAppDomains().includes(hostnameOrDomain);
}
