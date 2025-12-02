/**
 * Schedule/Cron System
 *
 * Recurring and one-time scheduled tasks with cron support
 */

import type { Session } from "neo4j-driver";

/**
 * Scheduled job
 */
export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string; // Cron expression or ISO date
  type: "cron" | "once";
  handler: string; // Handler function name
  data?: any;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Job handler function
 */
export type ScheduleHandler = (data?: any) => Promise<any> | any;

/**
 * Schedule manager
 */
class ScheduleManager {
  private handlers: Map<string, ScheduleHandler> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private session?: Session;

  /**
   * Set database session
   */
  setSession(session: Session): void {
    this.session = session;
  }

  /**
   * Register handler
   */
  registerHandler(name: string, handler: ScheduleHandler): void {
    this.handlers.set(name, handler);
  }

  /**
   * Parse cron expression to milliseconds (simplified)
   */
  private parseCronInterval(cron: string): number {
    // Simplified cron parser - only supports common patterns
    // Format: minute hour day month weekday
    // Examples: "0 0 * * *" = daily at midnight
    //           "*/5 * * * *" = every 5 minutes
    //           "0 */2 * * *" = every 2 hours

    const parts = cron.split(" ");
    if (parts.length !== 5) {
      throw new Error("Invalid cron expression");
    }

    const [minute, hour] = parts;

    // Every X minutes
    if (minute.startsWith("*/")) {
      const minutes = parseInt(minute.substring(2));
      return minutes * 60 * 1000;
    }

    // Every X hours
    if (hour.startsWith("*/")) {
      const hours = parseInt(hour.substring(2));
      return hours * 60 * 60 * 1000;
    }

    // Daily (0 0 * * *)
    if (minute === "0" && hour === "0") {
      return 24 * 60 * 60 * 1000;
    }

    // Default: 1 hour
    return 60 * 60 * 1000;
  }

  /**
   * Calculate next run time for cron
   */
  private calculateNextRun(cron: string, lastRun?: string): string {
    const interval = this.parseCronInterval(cron);
    const base = lastRun ? new Date(lastRun) : new Date();
    const nextRun = new Date(base.getTime() + interval);
    return nextRun.toISOString();
  }

  /**
   * Start scheduled job
   */
  async start(jobId: string): Promise<void> {
    if (!this.session) {
      throw new Error("Session not set");
    }

    // Get job from database
    const result = await this.session.run(
      "MATCH (j:ScheduledJob {id: $id}) RETURN j",
      { id: jobId }
    );

    if (result.records.length === 0) {
      throw new Error(`Scheduled job ${jobId} not found`);
    }

    const jobData = result.records[0].get("j").properties;
    const job: ScheduledJob = {
      id: jobData.id,
      name: jobData.name,
      schedule: jobData.schedule,
      type: jobData.type,
      handler: jobData.handler,
      data: jobData.data ? JSON.parse(jobData.data) : undefined,
      enabled: jobData.enabled,
      lastRun: jobData.lastRun || undefined,
      nextRun: jobData.nextRun || undefined,
      runCount: jobData.runCount || 0,
      createdAt: jobData.createdAt,
      updatedAt: jobData.updatedAt,
    };

    if (!job.enabled) {
      return;
    }

    const handler = this.handlers.get(job.handler);
    if (!handler) {
      console.error(`Handler ${job.handler} not found for job ${job.name}`);
      return;
    }

    if (job.type === "cron") {
      // Recurring job
      const interval = this.parseCronInterval(job.schedule);

      const intervalId = setInterval(async () => {
        try {
          await handler(job.data);
          await this.updateJobAfterRun(jobId, job.schedule);
        } catch (error) {
          console.error(`Error running scheduled job ${job.name}:`, error);
        }
      }, interval);

      this.intervals.set(jobId, intervalId);
    } else {
      // One-time job
      const runDate = new Date(job.schedule);
      const now = new Date();
      const delay = runDate.getTime() - now.getTime();

      if (delay > 0) {
        const timeoutId = setTimeout(async () => {
          try {
            await handler(job.data);
            await this.disableJob(jobId);
          } catch (error) {
            console.error(`Error running one-time job ${job.name}:`, error);
          }
        }, delay);

        this.intervals.set(jobId, timeoutId);
      }
    }
  }

  /**
   * Stop scheduled job
   */
  stop(jobId: string): void {
    const intervalId = this.intervals.get(jobId);
    if (intervalId) {
      clearInterval(intervalId);
      clearTimeout(intervalId);
      this.intervals.delete(jobId);
    }
  }

  /**
   * Update job after run
   */
  private async updateJobAfterRun(jobId: string, schedule: string): Promise<void> {
    if (!this.session) return;

    const now = new Date().toISOString();
    const nextRun = this.calculateNextRun(schedule, now);

    await this.session.run(
      `MATCH (j:ScheduledJob {id: $id})
       SET j.lastRun = $lastRun,
           j.nextRun = $nextRun,
           j.runCount = j.runCount + 1,
           j.updatedAt = $updatedAt`,
      {
        id: jobId,
        lastRun: now,
        nextRun,
        updatedAt: now,
      }
    );
  }

  /**
   * Disable job after one-time execution
   */
  private async disableJob(jobId: string): Promise<void> {
    if (!this.session) return;

    await this.session.run(
      `MATCH (j:ScheduledJob {id: $id})
       SET j.enabled = false,
           j.lastRun = $lastRun,
           j.updatedAt = $updatedAt`,
      {
        id: jobId,
        lastRun: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    this.stop(jobId);
  }

  /**
   * Start all enabled jobs
   */
  async startAll(): Promise<void> {
    if (!this.session) {
      throw new Error("Session not set");
    }

    const result = await this.session.run(
      "MATCH (j:ScheduledJob {enabled: true}) RETURN j.id as id"
    );

    for (const record of result.records) {
      const jobId = record.get("id");
      await this.start(jobId);
    }
  }

  /**
   * Stop all jobs
   */
  stopAll(): void {
    for (const jobId of this.intervals.keys()) {
      this.stop(jobId);
    }
  }
}

/**
 * Global schedule manager
 */
const globalManager = new ScheduleManager();

/**
 * Register cron job
 */
export async function registerCronJob(
  session: Session,
  name: string,
  schedule: string,
  handler: string,
  data?: any
): Promise<ScheduledJob> {
  const now = new Date().toISOString();
  const job: ScheduledJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    schedule,
    type: "cron",
    handler,
    data,
    enabled: true,
    nextRun: globalManager["calculateNextRun"](schedule),
    runCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await session.run(
    `CREATE (j:ScheduledJob {
      id: $id,
      name: $name,
      schedule: $schedule,
      type: $type,
      handler: $handler,
      data: $data,
      enabled: $enabled,
      nextRun: $nextRun,
      runCount: $runCount,
      createdAt: $createdAt,
      updatedAt: $updatedAt
    })`,
    {
      id: job.id,
      name: job.name,
      schedule: job.schedule,
      type: job.type,
      handler: job.handler,
      data: job.data ? JSON.stringify(job.data) : null,
      enabled: job.enabled,
      nextRun: job.nextRun || null,
      runCount: job.runCount,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }
  );

  return job;
}

/**
 * Register one-time job
 */
export async function registerOnceJob(
  session: Session,
  name: string,
  runAt: Date,
  handler: string,
  data?: any
): Promise<ScheduledJob> {
  const now = new Date().toISOString();
  const job: ScheduledJob = {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    schedule: runAt.toISOString(),
    type: "once",
    handler,
    data,
    enabled: true,
    nextRun: runAt.toISOString(),
    runCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await session.run(
    `CREATE (j:ScheduledJob {
      id: $id,
      name: $name,
      schedule: $schedule,
      type: $type,
      handler: $handler,
      data: $data,
      enabled: $enabled,
      nextRun: $nextRun,
      runCount: $runCount,
      createdAt: $createdAt,
      updatedAt: $updatedAt
    })`,
    {
      id: job.id,
      name: job.name,
      schedule: job.schedule,
      type: job.type,
      handler: job.handler,
      data: job.data ? JSON.stringify(job.data) : null,
      enabled: job.enabled,
      nextRun: job.nextRun || null,
      runCount: job.runCount,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }
  );

  return job;
}

/**
 * Get scheduled job
 */
export async function getScheduledJob(
  session: Session,
  jobId: string
): Promise<ScheduledJob | null> {
  const result = await session.run(
    "MATCH (j:ScheduledJob {id: $id}) RETURN j",
    { id: jobId }
  );

  if (result.records.length === 0) {
    return null;
  }

  const job = result.records[0].get("j").properties;
  return {
    id: job.id,
    name: job.name,
    schedule: job.schedule,
    type: job.type,
    handler: job.handler,
    data: job.data ? JSON.parse(job.data) : undefined,
    enabled: job.enabled,
    lastRun: job.lastRun || undefined,
    nextRun: job.nextRun || undefined,
    runCount: job.runCount || 0,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

/**
 * List scheduled jobs
 */
export async function listScheduledJobs(
  session: Session,
  enabledOnly: boolean = false
): Promise<ScheduledJob[]> {
  const whereClause = enabledOnly ? "{enabled: true}" : "";
  const result = await session.run(
    `MATCH (j:ScheduledJob ${whereClause}) RETURN j ORDER BY j.createdAt DESC`
  );

  return result.records.map((record) => {
    const job = record.get("j").properties;
    return {
      id: job.id,
      name: job.name,
      schedule: job.schedule,
      type: job.type,
      handler: job.handler,
      data: job.data ? JSON.parse(job.data) : undefined,
      enabled: job.enabled,
      lastRun: job.lastRun || undefined,
      nextRun: job.nextRun || undefined,
      runCount: job.runCount || 0,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  });
}

/**
 * Enable/disable job
 */
export async function toggleScheduledJob(
  session: Session,
  jobId: string,
  enabled: boolean
): Promise<void> {
  await session.run(
    `MATCH (j:ScheduledJob {id: $id})
     SET j.enabled = $enabled, j.updatedAt = $updatedAt`,
    {
      id: jobId,
      enabled,
      updatedAt: new Date().toISOString(),
    }
  );

  if (enabled) {
    await globalManager.start(jobId);
  } else {
    globalManager.stop(jobId);
  }
}

/**
 * Delete scheduled job
 */
export async function deleteScheduledJob(
  session: Session,
  jobId: string
): Promise<void> {
  globalManager.stop(jobId);
  await session.run(
    "MATCH (j:ScheduledJob {id: $id}) DELETE j",
    { id: jobId }
  );
}

/**
 * Schedule helper factory
 */
export const schedule = {
  /**
   * Register cron job
   */
  register: registerCronJob,

  /**
   * Register one-time job
   */
  once: registerOnceJob,

  /**
   * Get job
   */
  get: getScheduledJob,

  /**
   * List jobs
   */
  list: listScheduledJobs,

  /**
   * Toggle job
   */
  toggle: toggleScheduledJob,

  /**
   * Delete job
   */
  delete: deleteScheduledJob,

  /**
   * Register handler
   */
  registerHandler: (name: string, handler: ScheduleHandler) => {
    globalManager.registerHandler(name, handler);
  },

  /**
   * Set session
   */
  setSession: (session: Session) => {
    globalManager.setSession(session);
  },

  /**
   * Start job
   */
  start: (jobId: string) => globalManager.start(jobId),

  /**
   * Stop job
   */
  stop: (jobId: string) => globalManager.stop(jobId),

  /**
   * Start all jobs
   */
  startAll: () => globalManager.startAll(),

  /**
   * Stop all jobs
   */
  stopAll: () => globalManager.stopAll(),
};
