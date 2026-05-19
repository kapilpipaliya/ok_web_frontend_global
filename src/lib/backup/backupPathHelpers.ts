/**
 * Backup Path Helpers
 * Common utilities for building cloud storage paths
 */

import { getPrimaryAppDomain } from "~/lib/envDomains";

/**
 * Build cloud storage path for backup files
 * Format: backup/{domain}/{databaseName}/{filename}
 *
 * @param filename - The backup filename
 * @param databaseName - Optional database name for subfolder
 * @returns Full cloud storage path
 */
export function buildBackupPath(
  filename: string,
  databaseName?: string,
): string {
  const domain = getPrimaryAppDomain() || "default";

  if (databaseName) {
    return `backup/${domain}/${databaseName}/${filename}`;
  }

  return `backup/${domain}/${filename}`;
}

/**
 * Build cloud storage prefix for listing backups
 * Format: backup/{domain}/
 *
 * @returns Prefix for listing files in the domain folder
 */
export function buildBackupPrefix(): string {
  const domain = getPrimaryAppDomain() || "default";
  return `backup/${domain}/`;
}

/**
 * Get domain from environment
 *
 * @returns Current domain or 'default'
 */
export function getDomain(): string {
  return getPrimaryAppDomain() || "default";
}
