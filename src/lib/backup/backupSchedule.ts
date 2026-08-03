const HOURLY_SCHEDULE_PATTERNS = new Set(["0 * * * *", "0 */1 * * *"]);

export const DEFAULT_BACKUP_SCHEDULE = "0 * * * *";

export type ScheduledBackupType = "hourly" | "daily";

export function isHourlyBackupSchedule(schedule?: string): boolean {
  return HOURLY_SCHEDULE_PATTERNS.has(
    (schedule || DEFAULT_BACKUP_SCHEDULE).trim(),
  );
}

export function getScheduledBackupType(schedule?: string): ScheduledBackupType {
  return isHourlyBackupSchedule(schedule) ? "hourly" : "daily";
}

export function formatBackupScheduleLabel(schedule?: string): string {
  const cron = (schedule || DEFAULT_BACKUP_SCHEDULE).trim();
  if (isHourlyBackupSchedule(cron)) {
    return "Every hour (UTC)";
  }
  if (cron === "0 2 * * *") {
    return "Daily at 2 AM UTC";
  }
  return cron;
}

export function getBackupRetentionSummary(): string {
  const hourly = process.env.BACKUP_RETENTION_HOURLY || "24";
  const daily = process.env.BACKUP_RETENTION_DAILY || "7";
  const weekly = process.env.BACKUP_RETENTION_WEEKLY || "4";
  const monthly = process.env.BACKUP_RETENTION_MONTHLY || "12";

  if (isHourlyBackupSchedule(process.env.BACKUP_SCHEDULE)) {
    return `${hourly}h / ${weekly}w / ${monthly}m`;
  }

  return `${daily}d / ${weekly}w / ${monthly}m`;
}
