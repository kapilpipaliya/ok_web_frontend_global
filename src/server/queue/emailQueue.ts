/**
 * Email Queue Configuration
 *
 * This module provides a BullMQ queue for asynchronous email sending.
 */

import { Queue } from 'bullmq';
import { redisConnection, defaultJobOptions } from './redisConfig';

export interface EmailJobData {
  to: string;
  subject: string;
  content: string;
  subDomain: string;
  attachmentName?: string;
  attachmentPath?: string;
  from?: string;
}

/**
 * Email queue instance
 */
export const emailQueue = new Queue<EmailJobData>('email', {
  connection: redisConnection,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: 5, // Emails are important, retry more times
    backoff: {
      type: 'exponential',
      delay: 10000, // Start with 10 second delay
    },
  },
});

/**
 * Add an email to the queue
 */
export async function queueEmail(emailData: EmailJobData, priority?: number) {
  try {
    const job = await emailQueue.add('send-email', emailData, {
      priority: priority || 1, // Lower number = higher priority
    });

    console.log(`[EmailQueue] Email queued for ${emailData.to} with job ID: ${job.id}`);
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error('[EmailQueue] Failed to queue email:', error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
export async function getEmailQueueStats() {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      emailQueue.getWaitingCount(),
      emailQueue.getActiveCount(),
      emailQueue.getCompletedCount(),
      emailQueue.getFailedCount(),
      emailQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  } catch (error) {
    console.error('[EmailQueue] Failed to get queue stats:', error);
    return null;
  }
}

/**
 * Clean up old completed and failed jobs
 */
export async function cleanEmailQueue() {
  try {
    await emailQueue.clean(3600 * 24 * 7, 1000, 'completed'); // Remove completed jobs older than 7 days
    await emailQueue.clean(3600 * 24 * 30, 100, 'failed'); // Remove failed jobs older than 30 days
    console.log('[EmailQueue] Queue cleaned successfully');
    return { success: true };
  } catch (error) {
    console.error('[EmailQueue] Failed to clean queue:', error);
    return { success: false, error };
  }
}
