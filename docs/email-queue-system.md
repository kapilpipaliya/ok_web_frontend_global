# Email Queue System

This document describes the BullMQ-based email queue system that handles asynchronous email sending in the platform.

## Overview

The email queue system uses BullMQ and Redis to queue and process emails asynchronously. This provides several benefits:

- **Reliability**: Failed emails are automatically retried with exponential backoff
- **Performance**: Email sending doesn't block the main application flow
- **Scalability**: Multiple workers can process emails concurrently
- **Monitoring**: Queue statistics and job tracking
- **Rate Limiting**: Prevents overwhelming email providers

## Architecture

### Components

1. **Email Queue** (`src/server/queue/emailQueue.ts`)
   - Queue configuration and utilities
   - Functions to add emails to the queue
   - Queue statistics and cleanup

2. **Email Worker** (`src/server/queue/workers/emailWorker.ts`)
   - TypeScript-based BullMQ worker that processes queued emails
   - Automatically started by the worker initialization system
   - Handles up to 5 concurrent emails with rate limiting (10 emails/second)
   - Functions: `startEmailWorker()`, `stopEmailWorker()`, `getEmailWorkerStatus()`

3. **Email Queue Management** (`src/server/queue/emailQueueManagement.ts`)
   - Server functions for monitoring and managing the queue
   - `getEmailQueueStatistics()` - Get queue stats
   - `cleanEmailQueueJobs()` - Clean old jobs

4. **Send Functions** (`src/lib/playwright/sendEmail.ts`)
   - `sendEmail()` - Queues email for asynchronous sending (use this in your code)
   - `sendEmailDirect()` - Sends email immediately (used internally by worker)

### Data Flow

```
Application Code
     ↓
sendEmail() - Queues email in Redis
     ↓
BullMQ Email Queue
     ↓
Email Worker (processEmailQueue)
     ↓
sendEmailDirect() - Actually sends the email
     ↓
Email Provider (SMTP/Mailgun/etc.)
```

## Quick Start

1. **Install and start Redis**:
   ```bash
   brew install redis && brew services start redis  # macOS
   # or
   sudo apt-get install redis-server && sudo systemctl start redis  # Linux
   ```

2. **Configure environment** (optional - defaults work for local Redis):
   ```bash
   echo "REDIS_HOST=localhost" >> .env
   echo "REDIS_PORT=6379" >> .env
   ```

3. **Start your application**:
   ```bash
   npm run dev
   ```

That's it! The email worker automatically starts when the server starts. You'll see log messages confirming worker initialization.

## Prerequisites

### Redis Setup

The email queue requires Redis to be running. Install and start Redis:

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

### Environment Variables

Add Redis configuration to your `.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional, leave empty if no password
```

## Automatic Worker Initialization

**All workers start automatically when the application starts.** The email worker and any other BullMQ workers are initialized in `src/middleware.ts` during server startup. You don't need to manually start workers - they will be ready to process jobs as soon as the server starts.

Workers can be monitored and managed through:
- The Worker Management UI at `/admin/GlobalSettings` → Worker Management
- Server functions: `getWorkerStatus()`, `startWorker()`, `stopWorker()`
- Direct worker module functions

## Usage

### Sending Emails

All existing code automatically uses the queue system. The `sendEmail()` function signature remains the same:

```typescript
import { sendEmail } from "~/lib/playwright/sendEmail";

await sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  content: "<html><body>Welcome to our platform!</body></html>",
  subDomain: "myapp",
  attachmentName: "welcome.pdf",  // Optional
  attachmentPath: "/path/to/file.pdf"  // Optional
});
```

### Queue Management Functions

Server functions are available for queue management:

#### 1. Get Queue Statistics

```typescript
import { getEmailQueueStatistics } from "~/server/queue/emailQueueManagement";

const result = await getEmailQueueStatistics();

// Returns:
// {
//   success: true,
//   data: {
//     waiting: 5,    // Emails waiting to be processed
//     active: 2,     // Emails currently being sent
//     completed: 100, // Successfully sent emails
//     failed: 3,     // Failed emails
//     delayed: 0,    // Delayed/scheduled emails
//     total: 110     // Total jobs
//   }
// }
```

#### 2. Clean Old Jobs

```typescript
import { cleanEmailQueueJobs } from "~/server/queue/emailQueueManagement";

const result = await cleanEmailQueueJobs();

// Removes:
// - Completed jobs older than 7 days
// - Failed jobs older than 30 days

// Returns:
// {
//   success: true,
//   message: 'Email queue cleaned successfully'
// }
```

#### 3. Email Worker Management

**The email worker starts automatically when the server starts.** It initializes in the middleware during server startup and begins processing queued emails immediately.

You can monitor and manage the worker through the worker management system:

```typescript
// Worker is auto-started by initWorkers()
import { getWorkerStatus } from "~/server/queue/initWorkers";

// Get status of all workers including email worker
const status = await getWorkerStatus();
console.log(status);
// {
//   initialized: true,
//   enabled: true,
//   totalWorkers: 1,
//   activeWorkers: 1,
//   workers: [
//     {
//       key: 'emailWorker',
//       description: 'BullMQ worker that processes email queue and sends emails',
//       active: true,
//       type: 'typescript'
//     }
//   ]
// }

// Start/stop email worker specifically
import { startWorker, stopWorker } from "~/server/queue/initWorkers";

await startWorker('emailWorker');
await stopWorker('emailWorker');

// Or use the worker module directly
import {
  startEmailWorker,
  stopEmailWorker,
  getEmailWorkerStatus,
  pauseEmailWorker,
  resumeEmailWorker
} from "~/server/queue/workers/emailWorker";

await startEmailWorker();
const status = getEmailWorkerStatus();
await pauseEmailWorker();
await resumeEmailWorker();
await stopEmailWorker();
```

## Configuration

### Worker Settings

Edit `src/server/queue/workers/emailWorker.ts` to adjust:

- **Concurrency**: Number of emails processed simultaneously (default: 5)
- **Rate Limit**: Maximum emails per second (default: 10/second)

```typescript
worker = new Worker<EmailJobData>(
  'email',
  processEmailJob,
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 emails concurrently
    limiter: {
      max: 10,      // Maximum 10 emails
      duration: 1000 // per second
    }
  }
);
```

### Retry Settings

Edit `src/server/queue/emailQueue.ts` to adjust retry behavior:

```typescript
defaultJobOptions: {
  attempts: 5,         // Retry failed emails up to 5 times
  backoff: {
    type: 'exponential',
    delay: 10000,      // Start with 10 second delay, doubles each retry
  }
}
```

### Cleanup Settings

Edit `src/server/queue/emailQueue.ts` to adjust job retention:

```typescript
removeOnComplete: {
  age: 3600 * 24 * 7,  // Keep completed jobs for 7 days
  count: 1000,         // Keep max 1000 completed jobs
},
removeOnFail: {
  age: 3600 * 24 * 30, // Keep failed jobs for 30 days
}
```

## Monitoring

### Queue Statistics

Monitor queue health using the `getEmailQueueStats` function. Consider setting up:

1. **Dashboard**: Display queue stats in admin panel
2. **Alerts**: Notify when failed jobs exceed threshold
3. **Logs**: Worker logs all email processing with `[EmailWorker]` prefix

### Logs

The worker logs include:

```
[EmailWorker] Starting email worker...
[EmailWorker] Email worker started successfully
[EmailWorker] Processing email job 123 for user@example.com
[EmailWorker] Successfully sent email to user@example.com
[EmailWorker] Job 123 completed successfully
```

Failed emails show:

```
[EmailWorker] Failed to send email to user@example.com: <error>
[EmailWorker] Job 123 failed: <error>
```

## Troubleshooting

### Redis Connection Issues

**Error: `ECONNREFUSED`**
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

**Error: `NOAUTH Authentication required`**
- Add `REDIS_PASSWORD` to `.env`

### Worker Not Starting

**Note:** Workers should start automatically when the server starts. If they don't:

**Check server logs:**
Look for these log messages when the server starts:
```
[Middleware] Initializing workers on server startup...
[Workers] Starting email worker...
[EmailWorker] Email worker started successfully
```

**Check worker status:**
```typescript
import { getWorkerStatus } from "~/server/queue/initWorkers";
const status = await getWorkerStatus();
console.log(status);

// Or check email worker specifically
import { getEmailWorkerStatus } from "~/server/queue/workers/emailWorker";
const emailStatus = getEmailWorkerStatus();
console.log(emailStatus);
```

**Manual worker start:**
```typescript
import { startWorker } from "~/server/queue/initWorkers";
await startWorker("emailWorker");

// Or use the worker module directly
import { startEmailWorker } from "~/server/queue/workers/emailWorker";
await startEmailWorker();
```

### Emails Not Being Sent

1. **Check queue stats** - Are jobs being added to the queue?
   ```typescript
   import { getEmailQueueStatistics } from "~/server/queue/emailQueueManagement";
   const stats = await getEmailQueueStatistics();
   console.log(stats);
   ```
2. **Check worker logs** - Is the worker processing jobs?
3. **Check email settings** - Verify SMTP/email provider configuration
4. **Check failed jobs** - Use `getEmailQueueStatistics` to see if jobs are failing

### High Failed Job Count

1. **Check email provider credentials** - Verify SMTP settings
2. **Check rate limits** - Provider may be rejecting emails
3. **Review error logs** - Worker logs show specific errors
4. **Clean failed jobs** - Use `cleanEmailQueueJobs` after fixing issues
   ```typescript
   import { cleanEmailQueueJobs } from "~/server/queue/emailQueueManagement";
   await cleanEmailQueueJobs();
   ```

## Migration Notes

### Existing Code

No changes needed! All existing `sendEmail()` calls automatically use the queue system.

### Direct Sending

If you need to send emails without queueing (not recommended), use:

```typescript
import { sendEmailDirect } from "~/lib/playwright/sendEmail";

// Only use this if you have a specific reason to bypass the queue
await sendEmailDirect(emailOptions);
```

## Best Practices

1. **Workers auto-start** - All workers automatically start when the server starts; no manual initialization needed
2. **Always use `sendEmail()`** - Don't call `sendEmailDirect()` unless absolutely necessary
3. **Monitor queue stats** - Set up regular monitoring of queue health using `getEmailQueueStatistics()`
4. **Clean old jobs** - Run `cleanEmailQueueJobs()` periodically (e.g., daily cron)
5. **Configure rate limits** - Adjust based on your email provider's limits in `emailWorker.ts`
6. **Handle failures gracefully** - Emails may fail; don't assume immediate delivery
7. **Log important emails** - The system saves all emails to the database for auditing
8. **Use TypeScript workers** - All workers are now TypeScript files for better type safety and IDE support
9. **Check server logs** - Worker initialization and email processing are logged with clear prefixes

## Advanced Features

### Priority Emails

Send high-priority emails (e.g., password resets) with higher priority:

```typescript
import { queueEmail } from "~/server/queue/emailQueue";

await queueEmail(emailData, 1); // Lower number = higher priority (default: 1)
await queueEmail(emailData, 10); // Lower priority for newsletters
```

### Delayed Emails

Schedule emails for future delivery:

```typescript
await emailQueue.add('send-email', emailData, {
  delay: 60000 // Send after 60 seconds (in milliseconds)
});
```

### Bulk Emails

For sending many emails (e.g., newsletters), consider:

1. Adjusting rate limits to match your provider
2. Using priority levels to not block transactional emails
3. Monitoring queue size to avoid overwhelming Redis

## Security Considerations

1. **Sensitive Data**: Email content is stored in Redis temporarily
2. **Redis Security**: Secure Redis with password and firewall rules
3. **Email Logs**: Database stores all sent emails for auditing
4. **Attachment Paths**: Ensure attachment paths are validated and secure

## Performance Tips

1. **Redis Memory**: Monitor Redis memory usage for large queues
2. **Worker Scaling**: Increase concurrency for higher throughput
3. **Database Sessions**: Worker properly manages Neo4j sessions
4. **Rate Limiting**: Balance between speed and provider limits

## Support

For issues or questions:
1. Check worker logs for errors
2. Verify Redis connectivity
3. Test with `getEmailQueueStats` function
4. Review email provider logs
