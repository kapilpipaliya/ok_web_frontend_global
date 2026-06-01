/** FNV-1a 32-bit hash — valid CSS class prefix + hex (not cryptographic). */
export function hashCssString(css: string): string {
  let hash = 2166136261;
  for (let i = 0; i < css.length; i++) {
    hash ^= css.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `c${(hash >>> 0).toString(16)}`;
}
