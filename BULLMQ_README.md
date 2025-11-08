# BullMQ Background Processing

## Overview

The YSaar now uses **BullMQ** with Redis for robust, scalable background job processing. This ensures reliable handling of channels and playlists, even with thousands of videos.

## Quick Start

### 1. Prerequisites

Install and start Redis:

```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Verify
redis-cli ping  # Should return: PONG
```

### 2. Configuration

Add to your `.env` file:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Start Application (Workers Start Automatically)

```bash
npm run dev    # Development
npm run start  # Production
```

That's it! **Workers start automatically** within the application process. No separate worker process needed!

### Optional: Disable Workers

If you want to run workers separately, add to `.env`:

```bash
ENABLE_WORKERS=false
```

Then run workers separately:

```bash
# Development
npm run worker

# Production (PM2)
npm run worker:pm2
```

## How It Works

1. **User adds channel/playlist** → Job queued to Redis
2. **Worker picks up job** → Processes in background
3. **Database updated** → Status tracked in Neo4j
4. **UI shows progress** → Real-time status badges

## Architecture

```
┌─────────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│  saveChannel│────▶│  BullMQ  │────▶│ Worker  │────▶│ Database │
│ savePlaylist│     │  Queue   │     │ Process │     │  Neo4j   │
└─────────────┘     └──────────┘     └─────────┘     └──────────┘
                         │
                         ▼
                    ┌──────────┐
                    │  Redis   │
                    └──────────┘
```

## Features

✅ **Automatic retries** - Jobs retry up to 3 times with exponential backoff
✅ **Concurrency control** - Process multiple jobs simultaneously
✅ **Rate limiting** - Respects YouTube API quotas
✅ **Horizontal scaling** - Run multiple workers
✅ **Fault tolerant** - Jobs persist across restarts
✅ **Job deduplication** - Same channel/playlist won't be queued twice
✅ **Progress tracking** - Real-time status updates in UI

## Monitoring

### Check Worker Status

Workers log to the main application output:

```bash
# Development
# Workers log to console alongside app logs

# Production
# Workers log to same output as main app
pm2 logs      # If using PM2 for main app
```

### Check Queue Status
```bash
redis-cli LLEN "bull:yto:channel-processing:wait"
redis-cli LLEN "bull:yto:playlist-processing:wait"
```

### Check Processing Status
```cypher
MATCH (c:Channel)
RETURN c.processingStatus as status, count(*) as count
```

## Troubleshooting

### Worker Not Processing Jobs

1. Check workers are enabled: `echo $ENABLE_WORKERS` (should not be "false")
2. Check Redis is running: `redis-cli ping`
3. Check application logs for worker status
4. Restart application to reinitialize workers

### High Failure Rate

1. Check YouTube API quota in Google Cloud Console
2. View errors:
   ```cypher
   MATCH (c:Channel {processingStatus: 'failed'})
   RETURN c.title, c.lastError LIMIT 10
   ```
3. Reduce concurrency in `/src/server/queue/workers.ts`

### Jobs Stuck in Queue

1. Check queue depth: `redis-cli LLEN "bull:yto:channel-processing:wait"`
2. Check active jobs: `redis-cli LLEN "bull:yto:channel-processing:active"`
3. Restart worker: `pm2 restart yto-worker`

## Configuration

### Adjust Concurrency

Edit `/src/server/queue/workers.ts`:

```typescript
concurrency: 2  // Number of jobs to process simultaneously
```

### Adjust Rate Limits

```typescript
limiter: {
  max: 10,       // Max jobs
  duration: 60000 // Per duration (ms)
}
```

### Adjust Retries

Edit `/src/server/queue/redisConfig.ts`:

```typescript
attempts: 3,     // Number of retry attempts
backoff: {
  type: 'exponential',
  delay: 5000    // Initial delay (ms)
}
```

## Documentation

- **[Quick Reference](/BULLMQ_QUICK_REFERENCE.md)** - Common commands and quick lookup
- **[In-Process Workers](/IN_PROCESS_WORKERS.md)** - How workers run in the same process
- **[Deployment Guide](/BULLMQ_DEPLOYMENT.md)** - Complete production deployment guide
- **[Integration Summary](/BULLMQ_INTEGRATION_SUMMARY.md)** - Technical details and migration notes

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run worker` | Start worker in development mode |
| `npm run worker:pm2` | Start worker with PM2 |
| `npm run worker:pm2:logs` | View worker logs |
| `npm run worker:pm2:restart` | Restart worker |
| `npm run worker:pm2:stop` | Stop worker |

## Production Deployment

**Simple Deployment (Default):**

1. Install Redis and configure password
2. Set environment variables in `.env`
3. Start application normally: `npm run start`
4. Workers start automatically within the application process!

**Advanced: Separate Worker Process (Optional):**

If you need to scale workers independently:

1. Set `ENABLE_WORKERS=false` in main app's `.env`
2. Start main app: `npm run start`
3. Start separate worker: `npm run worker:pm2`
4. Configure PM2 to start on boot: `pm2 startup && pm2 save`

See [BULLMQ_DEPLOYMENT.md](/BULLMQ_DEPLOYMENT.md) for detailed instructions.

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section above
2. Review [BULLMQ_DEPLOYMENT.md](/BULLMQ_DEPLOYMENT.md)
3. Check worker logs: `pm2 logs yto-worker`
4. Verify Redis status: `redis-cli ping`

## Migration Notes

This BullMQ integration is **backward-compatible**:
- Existing channels/playlists continue to work
- New items automatically use BullMQ
- Old cron-based worker can be safely disabled

No database migration required!
