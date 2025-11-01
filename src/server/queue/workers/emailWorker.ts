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
 */
export async function startEmailWorker() {
  if (worker) {
    console.log('[EmailWorker] Worker already running');
    return worker;
  }

  console.log('[EmailWorker] Starting email worker...');

  worker = new Worker<EmailJobData>(
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
  worker.on('completed', (job) => {
    console.log(`[EmailWorker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[EmailWorker] Worker error:', err);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`[EmailWorker] Job ${jobId} stalled`);
  });

  console.log('[EmailWorker] Email worker started successfully');

  return worker;
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
