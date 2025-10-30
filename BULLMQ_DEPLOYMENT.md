# BullMQ Background Processing - Deployment Guide

## Overview

This application uses **BullMQ** with Redis for robust background job processing. All YouTube channel and playlist processing is handled asynchronously through job queues.

### Architecture

```
User Request → saveChannel/savePlaylist → BullMQ Queue → Worker → processChannel/processPlaylist
```

**Components:**
- **Queues**: `yto:channel-processing` and `yto:playlist-processing`
- **Workers**: Process jobs from queues with concurrency control
- **Jobs**: Channel and playlist processing tasks
- **Redis**: Job queue storage and coordination

## Prerequisites

### 1. Redis Installation

BullMQ requires Redis 5.0 or higher.

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
sudo systemctl status redis-server
```

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Docker:
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

#### Verify Redis:
```bash
redis-cli ping
# Should return: PONG
```

### 2. Environment Configuration

Add Redis configuration to your `.env` file:

```bash
# Redis Settings (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=            # Leave empty if no password
```

## Deployment Steps

### Step 1: Install Dependencies

BullMQ is already included in `package.json`. Ensure all dependencies are installed:

```bash
npm install
```

### Step 2: Start Redis

Ensure Redis is running:

```bash
# Check Redis status
redis-cli ping

# If not running, start it
sudo systemctl start redis-server  # Linux
brew services start redis          # macOS
```

### Step 3: Start the Worker Process

The worker can be started from Global settings UI

## Monitoring

### Redis CLI

Check queue status:

```bash
# List all keys
redis-cli KEYS "bull:yto:*"

# Get queue length
redis-cli LLEN "bull:yto:channel-processing:wait"
redis-cli LLEN "bull:yto:playlist-processing:wait"

# Monitor Redis commands in real-time
redis-cli MONITOR
```

### BullMQ Dashboard (Optional)

Install and run BullMQ Dashboard for web-based monitoring:

```bash
# Install globally
npm install -g bull-board

# Or add to your project
npm install @bull-board/api @bull-board/express
```


## Troubleshooting

### Worker Not Starting

**Symptom**: Worker process exits immediately or logs errors

**Solutions**:
```bash
# Check Redis connection
redis-cli ping

# Check environment variables
echo $REDIS_HOST
echo $REDIS_PORT

# Check worker logs
pm2 logs yto-worker
# or
sudo journalctl -u yto-worker -n 50
```

### Jobs Not Processing

**Symptom**: Jobs remain in "pending" status

**Solutions**:

1. **Check worker is running**:
```bash
pm2 status
# or
sudo systemctl status yto-worker
```

2. **Check Redis connection**:
```bash
redis-cli
> CLIENT LIST
# Look for connected clients
```

3. **Check queue status**:
```bash
redis-cli LLEN "bull:yto:channel-processing:wait"
redis-cli LLEN "bull:yto:channel-processing:active"
redis-cli LLEN "bull:yto:channel-processing:failed"
```

4. **Manual job processing** (debugging):
```typescript
// In Node.js console or test script
import { channelQueue } from '~/server/queue/queues';

const job = await channelQueue.getJob('jobId');
console.log(await job.getState());
console.log(job.failedReason);
```

### High Memory Usage

**Symptom**: Redis or worker consuming too much memory

**Solutions**:

1. **Reduce job retention**:
```typescript
// In redisConfig.ts
removeOnComplete: {
  age: 3600 * 24,  // Reduce to 1 day
  count: 100,      // Reduce to 100 jobs
}
```

2. **Configure Redis maxmemory**:
```bash
# Edit /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
```

### Jobs Failing with YouTube API Errors

**Symptom**: Jobs fail with quota or API errors

**Solutions**:

1. **Reduce concurrency**:
```typescript
// In workers.ts
concurrency: 1,  // Process one at a time
limiter: {
  max: 5,        // Reduce to 5 jobs per minute
  duration: 60000,
}
```

2. **Check YouTube API quota** in Google Cloud Console

3. **Manual retry**:
```cypher
// Reset failed items to pending
MATCH (n)
WHERE n.processingStatus = 'failed'
SET n.processingStatus = 'pending'
RETURN count(n)
```

### Duplicate Job Processing

**Symptom**: Same channel/playlist processed multiple times

**Cause**: Job IDs ensure deduplication, but database status might be stale

**Solution**: Jobs use unique IDs (`channel_${channelId}_${userId}`) to prevent duplicates. If duplicates occur:

```typescript
// Check for duplicate jobs
import { channelQueue } from '~/server/queue/queues';

const jobs = await channelQueue.getJobs(['waiting', 'active']);
console.log(jobs.map(j => ({ id: j.id, data: j.data })));
```

## Scaling

### Single Server

Current configuration handles:
- **Channels**: 2 concurrent × 10 per minute = ~1200 channels/hour
- **Playlists**: 3 concurrent × 15 per minute = ~2700 playlists/hour

### Multiple Workers

Run multiple worker processes for higher throughput:

```bash
# Start 3 worker instances
pm2 start scripts/start-worker.ts --name yto-worker-1 -i 1
pm2 start scripts/start-worker.ts --name yto-worker-2 -i 1
pm2 start scripts/start-worker.ts --name yto-worker-3 -i 1
```

BullMQ automatically coordinates job distribution across workers.

### Multiple Servers

For distributed deployment:

1. **Shared Redis**: All servers must connect to the same Redis instance
2. **Redis Cluster**: For high availability:
```typescript
// In redisConfig.ts
import { Cluster } from 'ioredis';

export const redisConnection = new Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 },
]);
```

## Security

### Redis Authentication

Set a strong password:

```bash
# Edit /etc/redis/redis.conf
requirepass YourStrongRedisPassword

# Restart Redis
sudo systemctl restart redis-server
```

Update `.env`:
```bash
REDIS_PASSWORD=YourStrongRedisPassword
```

### Redis Network Security

Bind Redis to localhost only:

```bash
# Edit /etc/redis/redis.conf
bind 127.0.0.1 ::1

# Or for specific IPs
bind 192.168.1.100 127.0.0.1
```

### Firewall

If using remote Redis:

```bash
# Allow only your application server
sudo ufw allow from 192.168.1.100 to any port 6379
```

## Backup and Recovery

### Redis Persistence

Redis automatically persists data using RDB and AOF:

```bash
# Edit /etc/redis/redis.conf

# RDB snapshots
save 900 1      # After 900 sec if at least 1 key changed
save 300 10     # After 300 sec if at least 10 keys changed
save 60 10000   # After 60 sec if at least 10000 keys changed

# AOF (Append Only File)
appendonly yes
appendfsync everysec
```

### Backup Jobs

Jobs are also tracked in Neo4j via `processingStatus` fields, providing redundancy.

### Recovery

If Redis fails:

1. **Jobs in queue are lost** (acceptable - they'll be recreated on next user action)
2. **Database state preserved** via `processingStatus` fields
3. **Manual recovery** (if needed):

```cypher
// Find items that were processing when Redis failed
MATCH (n)
WHERE n.processingStatus = 'processing'
  AND n.processingStartedAt < datetime() - duration({hours: 1})
SET n.processingStatus = 'pending'
RETURN count(n) as recovered
```

## Performance Tuning

### Optimize for Throughput

```typescript
// Increase concurrency
concurrency: 5,

// Increase rate limits (watch YouTube API quota)
limiter: {
  max: 30,
  duration: 60000,
}
```

### Optimize for Memory

```typescript
// Reduce job retention
removeOnComplete: true,  // Remove immediately
removeOnFail: {
  age: 3600 * 24,  // 1 day only
}
```

### Optimize for Reliability

```typescript
// Increase retries
attempts: 5,

// Longer backoff
backoff: {
  type: 'exponential',
  delay: 10000,  // 10 seconds
}
```

## Production Checklist

- [ ] Redis installed and running
- [ ] Redis password configured
- [ ] Redis persistence enabled (RDB + AOF)
- [ ] Environment variables set in `.env`
- [ ] Worker process configured with PM2/systemd
- [ ] Worker starts on system boot
- [ ] Monitoring set up (logs, Redis CLI, database queries)
- [ ] Alert system for failed jobs (optional)
- [ ] Backup strategy for Redis (optional)
- [ ] Firewall rules configured
- [ ] YouTube API quota limits understood
- [ ] Tested with real channels and playlists

## Summary

This BullMQ integration provides:

✅ **Reliable job processing** with automatic retries
✅ **Scalability** via concurrency and distributed workers
✅ **Rate limiting** to respect YouTube API quotas
✅ **Monitoring** through Redis CLI and database queries
✅ **Fault tolerance** with Redis persistence
✅ **Deduplication** via unique job IDs
✅ **Graceful shutdown** with signal handling

Deploy with confidence!
