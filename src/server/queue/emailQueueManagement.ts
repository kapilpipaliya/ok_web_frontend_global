/**
 * Email Queue Management Functions
 *
 * Server functions for managing and monitoring the email queue
 */

import { getEmailQueueStats as getQueueStats, cleanEmailQueue as cleanQueue } from './emailQueue';

/**
 * Get email queue statistics
 * Can be called via server functions
 */
export async function getEmailQueueStatistics() {
  "use server"

  try {
    const stats = await getQueueStats();

    if (!stats) {
      return {
        success: false,
        error: 'Failed to get queue statistics'
      };
    }

    return {
      success: true,
      data: stats
    };
  } catch (error: any) {
    console.error('[EmailQueue] Error getting stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Clean old completed and failed email jobs
 * Can be called via server functions
 */
export async function cleanEmailQueueJobs() {
  "use server"

  try {
    const result = await cleanQueue();

    if (!result.success) {
      return {
        success: false,
        error: 'Failed to clean queue'
      };
    }

    return {
      success: true,
      message: 'Email queue cleaned successfully'
    };
  } catch (error: any) {
    console.error('[EmailQueue] Error cleaning queue:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
