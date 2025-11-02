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

let worker: Worker<EmailJobData> | null = null;
let startPromise: Promise<Worker<EmailJobData>> | null = null;

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
 * Uses Promise-based singleton to prevent race conditions
 */
export async function startEmailWorker() {
  // If already starting or started, wait for/return the same promise
  if (startPromise) {
    return startPromise;
  }

  // Create the start promise
  startPromise = (async () => {
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

    // Assign to module-level variable
    worker = newWorker;

    console.log('[EmailWorker] Email worker started successfully');

    return newWorker;
  })();

  return startPromise;
}

/**
 * Stop the email worker
 */
export async function stopEmailWorker() {
  if (!worker) {
    console.log('[EmailWorker] Worker not running');
    return;
  }

  console.log('[EmailWorker] Stopping email worker...');
  await worker.close();
  worker = null;
  startPromise = null; // Reset promise so worker can be restarted
  console.log('[EmailWorker] Email worker stopped');
}

/**
 * Get worker status
 */
export function getEmailWorkerStatus() {
  return {
    running: worker !== null,
    isRunning: worker?.isRunning() || false,
    isPaused: worker?.isPaused() || false,
  };
}

/**
 * Pause the worker
 */
export async function pauseEmailWorker() {
  if (!worker) {
    throw new Error('Worker not running');
  }
  await worker.pause();
  console.log('[EmailWorker] Worker paused');
}

/**
 * Resume the worker
 */
export async function resumeEmailWorker() {
  if (!worker) {
    throw new Error('Worker not running');
  }
  await worker.resume();
  console.log('[EmailWorker] Worker resumed');
}
