import {
  getClientIpForBlocking,
  terminateConnectionSilently,
} from "./gitProbeBlock";

export { getClientIpForBlocking, terminateConnectionSilently };

/** client IPs blocked until process restart */
const blockedIps = new Set<string>();

function collapseSlashes(path: string): string {
  return path.replace(/\/{2,}/g, "/");
}

function normalizedPathname(pathname: string): string {
  let p = pathname;
  try {
    p = decodeURIComponent(p);
  } catch {
    /* ignore invalid escape sequences */
  }
  return collapseSlashes(p).toLowerCase();
}

/** True when the last path segment ends with `.php` (e.g. `/petx.php`). */
export function isPhpProbePath(pathname: string): boolean {
  const trimmed = normalizedPathname(pathname).replace(/\/+$/, "") || "/";
  const lastSegment = trimmed.split("/").pop() ?? "";
  return lastSegment.endsWith(".php");
}

export function isIpPhpBlocked(ip: string | undefined): boolean {
  if (!ip) return false;
  return blockedIps.has(ip);
}

export function blockClientIpForPhpProbe(ip: string | undefined): void {
  if (!ip) return;
  blockedIps.add(ip);
}
