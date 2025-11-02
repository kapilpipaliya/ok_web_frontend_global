/**
 * Email Worker - BullMQ Worker for Processing Email Queue
 *
 * This worker processes emails from the email queue and sends them using the
 * existing email infrastructure (SMTP/Mailgun/etc.)
 */

import { Worker, type Job } from 'bullmq';
import { redisConnection } from '../redisConfig';
import { sendEmailDirect } from '~/lib/playwright/sendEmail';
import type { EmailJobData } from '../emailQueue';

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
  console.log(`[EmailWorker] Processing email job ${job.id} for ${job.data.to}`);

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

    console.log(`[EmailWorker] Successfully sent email to ${job.data.to}`);
    return { success: true, messageId: result?.messageId };
  } catch (error) {
    console.error(`[EmailWorker] Failed to send email to ${job.data.to}:`, error);
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
    console.log('[EmailWorker] Starting email worker...');

    const newWorker = new Worker<EmailJobData>(
      'email',
      processEmailJob,
      {
        connection: redisConnection,
        concurrency: 5, // Process up to 5 emails concurrently
        limiter: {
          max: 10, // Maximum 10 emails
          duration: 1000, // per second (rate limiting)
        },
      }
    );

    // Worker event listeners
    newWorker.on('completed', (job) => {
      console.log(`[EmailWorker] Job ${job.id} completed successfully`);
    });

    newWorker.on('failed', (job, err) => {
      console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
    });

    newWorker.on('error', (err) => {
      console.error('[EmailWorker] Worker error:', err);
    });

    newWorker.on('stalled', (jobId) => {
      console.warn(`[EmailWorker] Job ${jobId} stalled`);
    });

    // Assign to global variable
    global.__emailWorker = newWorker;

    console.log('[EmailWorker] Email worker started successfully');

    return newWorker;
  })();

  return global.__emailWorkerStartPromise;
}

/**
 * Stop the email worker
 */
export async function stopEmailWorker() {
  if (!global.__emailWorker) {
    console.log('[EmailWorker] Worker not running');
    return;
  }

  console.log('[EmailWorker] Stopping email worker...');
  await global.__emailWorker.close();
  global.__emailWorker = undefined;
  global.__emailWorkerStartPromise = undefined; // Reset promise so worker can be restarted
  console.log('[EmailWorker] Email worker stopped');
}

/**
 * Get worker status
 */
export function getEmailWorkerStatus() {
  return {
    running: global.__emailWorker !== undefined,
    isRunning: global.__emailWorker?.isRunning() || false,
    isPaused: global.__emailWorker?.isPaused() || false,
  };
}

/**
 * Pause the worker
 */
export async function pauseEmailWorker() {
  if (!global.__emailWorker) {
    throw new Error('Worker not running');
  }
  await global.__emailWorker.pause();
  console.log('[EmailWorker] Worker paused');
}

/**
 * Resume the worker
 */
export async function resumeEmailWorker() {
  if (!global.__emailWorker) {
    throw new Error('Worker not running');
  }
  await global.__emailWorker.resume();
  console.log('[EmailWorker] Worker resumed');
}
