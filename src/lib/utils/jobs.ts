/**
 * Background Jobs Helper
 *
 * Simple job queue for async operations in server functions
 */

/*
Jobs Enhancement
  - Job dependencies (job B runs after job A)
  - Recurring/scheduled jobs
  - Job priorities with starvation prevention
  - Better monitoring/dashboard data
 */

/**
 * Job status
 */
export type JobStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Job definition
 */
export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  status: JobStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: any;
}

/**
 * Job handler function
 */
export type JobHandler<T = any> = (
  data: T,
  job: Job<T>
) => Promise<any> | any;

/**
 * Job options
 */
export interface JobOptions {
  priority?: number; // Higher = more priority (default: 0)
  maxAttempts?: number; // Max retry attempts (default: 3)
  delay?: number; // Delay in milliseconds before processing
  timeout?: number; // Job timeout in milliseconds
}

/**
 * Job queue statistics
 */
export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

/**
 * Job queue class
 */
class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private processing: Set<string> = new Set();
  private maxConcurrent: number = 5;
  private isRunning: boolean = false;
  private jobCounter: number = 0;

  /**
   * Register job handler
   */
  register<T = any>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler);
  }

  /**
   * Add job to queue
   */
  async add<T = any>(
    name: string,
    data: T,
    options: JobOptions = {}
  ): Promise<string> {
    const jobId = `${name}-${Date.now()}-${this.jobCounter++}`;

    const job: Job<T> = {
      id: jobId,
      name,
      data,
      status: "pending",
      priority: options.priority || 0,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: Date.now(),
    };

    this.jobs.set(jobId, job);

    // Delay job if specified
    if (options.delay) {
      setTimeout(() => {
        this.process();
      }, options.delay);
    } else {
      // Process immediately
      this.process();
    }

    return jobId;
  }

  /**
   * Process jobs in queue
   */
  private async process(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    while (true) {
      // Check if we can process more jobs
      if (this.processing.size >= this.maxConcurrent) {
        break;
      }

      // Get next pending job
      const job = this.getNextJob();
      if (!job) {
        break;
      }

      // Process job
      this.processJob(job);
    }

    this.isRunning = false;
  }

  /**
   * Get next pending job (highest priority first)
   */
  private getNextJob(): Job | null {
    const pendingJobs = Array.from(this.jobs.values())
      .filter((j) => j.status === "pending")
      .sort((a, b) => {
        // Higher priority first
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        // Earlier creation first
        return a.createdAt - b.createdAt;
      });

    return pendingJobs[0] || null;
  }

  /**
   * Process single job
   */
  private async processJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.name);

    if (!handler) {
      job.status = "failed";
      job.error = `No handler registered for job "${job.name}"`;
      return;
    }

    job.status = "processing";
    job.startedAt = Date.now();
    job.attempts++;
    this.processing.add(job.id);

    try {
      const result = await handler(job.data, job);
      job.status = "completed";
      job.completedAt = Date.now();
      job.result = result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Retry if attempts remaining
      if (job.attempts < job.maxAttempts) {
        job.status = "pending";
        console.warn(
          `[Jobs] Job ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts}): ${errorMessage}`
        );
      } else {
        job.status = "failed";
        job.completedAt = Date.now();
        job.error = errorMessage;
        console.error(
          `[Jobs] Job ${job.id} failed permanently: ${errorMessage}`
        );
      }
    } finally {
      this.processing.delete(job.id);

      // Continue processing
      this.process();
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): Job | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get job status
   */
  getStatus(jobId: string): JobStatus | null {
    const job = this.jobs.get(jobId);
    return job ? job.status : null;
  }

  /**
   * Wait for job completion
   */
  async waitFor(jobId: string, timeoutMs: number = 30000): Promise<Job> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const check = () => {
        const job = this.jobs.get(jobId);

        if (!job) {
          reject(new Error(`Job ${jobId} not found`));
          return;
        }

        if (job.status === "completed" || job.status === "failed") {
          resolve(job);
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          reject(new Error(`Job ${jobId} timeout`));
          return;
        }

        setTimeout(check, 100);
      };

      check();
    });
  }

  /**
   * Cancel job
   */
  cancel(jobId: string): boolean {
    const job = this.jobs.get(jobId);

    if (!job || job.status !== "pending") {
      return false;
    }

    job.status = "failed";
    job.error = "Cancelled by user";
    job.completedAt = Date.now();
    return true;
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): number {
    let cleared = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (job.status === "completed") {
        this.jobs.delete(id);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Clear failed jobs
   */
  clearFailed(): number {
    let cleared = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (job.status === "failed") {
        this.jobs.delete(id);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Clear all jobs
   */
  clear(): void {
    this.jobs.clear();
    this.processing.clear();
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const jobs = Array.from(this.jobs.values());

    return {
      pending: jobs.filter((j) => j.status === "pending").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      total: jobs.length,
    };
  }

  /**
   * Get all jobs
   */
  getJobs(status?: JobStatus): Job[] {
    const jobs = Array.from(this.jobs.values());

    if (status) {
      return jobs.filter((j) => j.status === status);
    }

    return jobs;
  }

  /**
   * Set max concurrent jobs
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, max);
  }
}

/**
 * Global job queue
 */
const globalQueue = new JobQueue();

/**
 * Register job handler
 */
export function registerJobHandler<T = any>(
  name: string,
  handler: JobHandler<T>
): void {
  globalQueue.register(name, handler);
}

/**
 * Add job to queue
 */
export async function addJob<T = any>(
  name: string,
  data: T,
  options?: JobOptions
): Promise<string> {
  return globalQueue.add(name, data, options);
}

/**
 * Get job by ID
 */
export function getJob(jobId: string): Job | null {
  return globalQueue.getJob(jobId);
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): JobStatus | null {
  return globalQueue.getStatus(jobId);
}

/**
 * Wait for job completion
 */
export async function waitForJob(
  jobId: string,
  timeoutMs?: number
): Promise<Job> {
  return globalQueue.waitFor(jobId, timeoutMs);
}

/**
 * Cancel job
 */
export function cancelJob(jobId: string): boolean {
  return globalQueue.cancel(jobId);
}

/**
 * Clear completed jobs
 */
export function clearCompletedJobs(): number {
  return globalQueue.clearCompleted();
}

/**
 * Clear failed jobs
 */
export function clearFailedJobs(): number {
  return globalQueue.clearFailed();
}

/**
 * Clear all jobs
 */
export function clearAllJobs(): void {
  globalQueue.clear();
}

/**
 * Get queue statistics
 */
export function getQueueStats(): QueueStats {
  return globalQueue.getStats();
}

/**
 * Get all jobs
 */
export function getAllJobs(status?: JobStatus): Job[] {
  return globalQueue.getJobs(status);
}

/**
 * Set max concurrent jobs
 */
export function setMaxConcurrentJobs(max: number): void {
  globalQueue.setMaxConcurrent(max);
}

/**
 * Jobs helper factory
 */
export const jobs = {
  /**
   * Register handler
   */
  register: registerJobHandler,

  /**
   * Add job
   */
  add: addJob,

  /**
   * Get job
   */
  get: getJob,

  /**
   * Get status
   */
  status: getJobStatus,

  /**
   * Wait for completion
   */
  wait: waitForJob,

  /**
   * Cancel job
   */
  cancel: cancelJob,

  /**
   * Clear completed
   */
  clearCompleted: clearCompletedJobs,

  /**
   * Clear failed
   */
  clearFailed: clearFailedJobs,

  /**
   * Clear all
   */
  clearAll: clearAllJobs,

  /**
   * Get stats
   */
  stats: getQueueStats,

  /**
   * Get all jobs
   */
  getAll: getAllJobs,

  /**
   * Set max concurrent
   */
  setMaxConcurrent: setMaxConcurrentJobs,
};

/**
 * Auto-cleanup completed jobs every 10 minutes
 */
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      const cleared = clearCompletedJobs();
      if (cleared > 0) {
        console.log(`[Jobs] Cleared ${cleared} completed jobs`);
      }
    },
    10 * 60 * 1000
  );
}
