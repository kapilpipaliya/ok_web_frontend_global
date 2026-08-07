import type { FetchEvent } from "@solidjs/start/server";

const BLOCK_MS = 24 * 60 * 60 * 1000;

/** client IP -> unblock at (epoch ms) */
const blockedUntilByIp = new Map<string, number>();

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

/** True for `/.git` and paths under `/.git/` only (not e.g. `/.gitlab`). */
export function isGitRepositoryProbePath(pathname: string): boolean {
  const p = normalizedPathname(pathname);
  return p === "/.git" || p.startsWith("/.git/");
}

export function getClientIpForBlocking(
  request: Request,
  clientAddress?: string,
): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  if (clientAddress) return clientAddress;
  return undefined;
}

export function isIpGitBlocked(ip: string | undefined): boolean {
  if (!ip) return false;
  const until = blockedUntilByIp.get(ip);
  if (until === undefined) return false;
  if (Date.now() >= until) {
    blockedUntilByIp.delete(ip);
    return false;
  }
  return true;
}

export function blockClientIpForGitProbe24h(ip: string | undefined): void {
  if (!ip) return;
  blockedUntilByIp.set(ip, Date.now() + BLOCK_MS);
}

/**
 * Drop the TCP connection without writing an HTTP response (no status line, no body).
 * Marks the request handled so remaining middleware and the route handler are skipped.
 */
export function terminateConnectionSilently(event: FetchEvent): void {
  const native = event.nativeEvent as {
    _handled?: boolean;
    node?: {
      req?: { socket?: { destroy?: () => void } };
      res?: {
        headersSent?: boolean;
        socket?: { destroy?: () => void };
        destroy?: () => void;
      };
    };
  };

  native._handled = true;
  try {
    const res = native.node?.res;
    const req = native.node?.req;
    if (res && !res.headersSent) {
      const sock = res.socket ?? req?.socket;
      if (sock?.destroy) {
        sock.destroy();
        return;
      }
    }
    res?.destroy?.();
  } catch {
    /* ignore */
  }
}
