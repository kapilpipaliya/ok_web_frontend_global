/**
 * Email Worker - BullMQ Worker for Processing Email Queue
 *
 * This worker processes emails from the email queue and sends them using the
 * existing email infrastructure (SMTP/Mailgun/etc.)
 */

import { Worker, type Job } from "bullmq";
import { redisConnection } from "../redisConfig";
import { sendEmailDirect } from "~/lib/playwright/sendEmail";
import type { EmailJobData } from "../emailQueue";
import { logger } from "~/lib/logger";

/**
 * Email worker state stored globally to share across module instances
 * (Vinxi dev mode creates multiple module instances in separate contexts)
 */
declare global {
  var __emailWorker: Worker<EmailJobData> | undefined;
  var __emailWorkerStartPromise: Promise<Worker<EmailJobData>> | undefined;
}

// Initialize global state
if (!global.__emailWorker) {
  global.__emailWorker = undefined;
}
if (!global.__emailWorkerStartPromise) {
  global.__emailWorkerStartPromise = undefined;
}

/**
 * Process a single email job
 */
async function processEmailJob(job: Job<EmailJobData>) {
  const startTime = Date.now();

  logger.logJob({
    jobId: job.id?.toString(),
    jobName: "email",
    queueName: "email",
    attemptsMade: job.attemptsMade,
    status: "started",
  });

  try {
    // Send the email using the direct send function (bypasses queue)
    const result = await sendEmailDirect({
      to: job.data.to,
      subject: job.data.subject,
      content: job.data.content,
      subDomain: job.data.subDomain,
      attachmentName: job.data.attachmentName,
      attachmentPath: job.data.attachmentPath,
    });

    const duration = Date.now() - startTime;

    logger.logJob({
      jobId: job.id?.toString(),
      jobName: "email",
      queueName: "email",
      attemptsMade: job.attemptsMade,
      duration,
      status: "completed",
    });

    return { success: true, messageId: result?.messageId };
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.logJob({
      jobId: job.id?.toString(),
      jobName: "email",
      queueName: "email",
      attemptsMade: job.attemptsMade,
      duration,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error; // Let BullMQ handle retries
  }
}

/**
 * Start the email worker
 * Uses global Promise-based singleton to prevent race conditions
 * across multiple module instances
 */
export async function startEmailWorker() {
  // If already starting or started, wait for/return the same promise
  if (global.__emailWorkerStartPromise) {
    return global.__emailWorkerStartPromise;
  }

  // Create the start promise
  global.__emailWorkerStartPromise = (async () => {
    logger.info("Starting email worker...");

    const newWorker = new Worker<EmailJobData>("email", processEmailJob, {
      connection: redisConnection,
      concurrency: 5, // Process up to 5 emails concurrently
      limiter: {
        max: 10, // Maximum 10 emails
        duration: 1000, // per second (rate limiting)
      },
    });

    // Worker event listeners
    newWorker.on("completed", (job) => {
      logger.debug(
        {
          type: "worker_event",
          event: "completed",
          jobId: job.id?.toString(),
          queueName: "email",
        },
        `Email worker job ${job.id} completed`,
      );
    });

    newWorker.on("failed", (job, err) => {
      logger.error(
        {
          type: "worker_event",
          event: "failed",
          jobId: job?.id?.toString(),
          queueName: "email",
          error: err.message,
        },
        `Email worker job ${job?.id} failed`,
      );
    });

    newWorker.on("error", (err) => {
      logger.error(
        {
          type: "worker_error",
          queueName: "email",
          error: err instanceof Error ? err.message : "Unknown error",
        },
        "Email worker error",
      );
    });

    newWorker.on("stalled", (jobId) => {
      logger.warn(
        {
          type: "worker_event",
          event: "stalled",
          jobId,
          queueName: "email",
        },
        `Email worker job ${jobId} stalled`,
      );
    });

    // Assign to global variable
    global.__emailWorker = newWorker;

    logger.info("Email worker started successfully");

    return newWorker;
  })();

  return global.__emailWorkerStartPromise;
}

/**
 * Stop the email worker
 */
export async function stopEmailWorker() {
  if (!global.__emailWorker) {
    logger.debug("Email worker not running");
    return;
  }

  logger.info("Stopping email worker...");
  await global.__emailWorker.close();
  global.__emailWorker = undefined;
  global.__emailWorkerStartPromise = undefined; // Reset promise so worker can be restarted
  logger.info("Email worker stopped");
}

/**
 * Get worker status
 */
export function getEmailWorkerStatus() {
  return {
    running: global.__emailWorker !== undefined,
    isRunning: global.__emailWorker?.isRunning(),
    isPaused: global.__emailWorker?.isPaused(),
  };
}

/**
 * Pause the worker
 */
export async function pauseEmailWorker() {
  if (!global.__emailWorker) {
    throw new Error("Worker not running");
  }
  await global.__emailWorker.pause();
  logger.info("Email worker paused");
}

/**
 * Resume the worker
 */
export async function resumeEmailWorker() {
  if (!global.__emailWorker) {
    throw new Error("Worker not running");
  }
  await global.__emailWorker.resume();
  logger.info("Email worker resumed");
}
