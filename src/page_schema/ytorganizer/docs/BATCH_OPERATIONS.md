# YouTube Organizer - Batch Operations & Multi-Channel Management

## Overview

The YouTube Organizer now supports advanced batch operations for managing multiple channels efficiently, with quota-aware processing and priority scheduling.

## New Features

### 1. **Priority System**
Channels and playlists can be assigned priorities to control processing order:
- `high` - Processed first (priority 1)
- `normal` - Standard processing (priority 2, default)
- `low` - Processed last (priority 3)

**Usage:**
```javascript
// Add channel with high priority
await executeServerFunction('saveChannel', {
  url: 'https://www.youtube.com/@channelname',
  priority: 'high'
});

// Add playlist with low priority
await executeServerFunction('savePlaylist', {
  url: 'https://www.youtube.com/playlist?list=PLxxx',
  priority: 'low'
});
```

### 2. **Quota Protection**
Workers automatically stop processing when quota reaches 95%, preventing exhaustion:
- Status changes to `pending_quota`
- Error message: "Daily API quota nearly exhausted. Will resume tomorrow."
- Automatically retries at midnight UTC (see #5)

### 3. **Batch Operations**

#### Pause All Channels
```javascript
await executeServerFunction('pauseAllChannels', {});
// Returns: { channelsPaused, playlistsPaused }
```
- Pauses all queued/processing channels and playlists
- Useful when manually managing quota
- Can be resumed later

#### Resume Pending Channels
```javascript
await executeServerFunction('resumePendingChannels', {});
// Returns: { channelsResumed, playlistsResumed }
```
- Resumes all paused and pending_quota items
- Re-queues with original priority
- Useful for manual quota reset or after pause

### 4. **Channel Dashboard**
```javascript
const result = await executeServerFunction('getUserChannels', {});
// Returns all user's channels with stats
```

**Response Structure:**
```javascript
{
  success: true,
  data: {
    channels: [
      {
        channel: { /* Channel vertex */ },
        channelSetting: { /* ChannelSetting vertex */ },
        stats: {
          totalPlaylists: 15,
          completedPlaylists: 10,
          failedPlaylists: 1,
          pendingPlaylists: 3,
          quotaPendingPlaylists: 1,
          progress: 66
        }
      }
    ],
    totalChannels: 5
  }
}
```

### 5. **Automatic Quota Reset**
Function: `retryPendingQuotaJobs`

This should be scheduled to run at midnight UTC (00:00) using a cron job:
```javascript
// Example cron setup (run daily at midnight UTC)
await executeServerFunction('retryPendingQuotaJobs', {});
```

**What it does:**
- Finds all `pending_quota` channels and playlists
- Re-queues them for processing
- Updates status back to `queued`
- Logs retry count and timestamp

## Status States

### Channel/Playlist Statuses

| Status | Description | User Action |
|--------|-------------|-------------|
| `queued` | Waiting in queue | Can cancel |
| `processing` | Currently fetching from YouTube | Can cancel |
| `pending_quota` | Waiting for quota reset | Can retry manually |
| `paused` | Paused by user | Can resume |
| `completed` | All data fetched | Can refresh |
| `completed_with_errors` | Some playlists/videos failed | Can retry |
| `failed` | Processing failed | Can retry |

## Performance Optimizations

### Removed Delays
- **OLD**: 5-second delay between playlist pages (very slow)
- **NEW**: No artificial delays (up to 100x faster)

### Concurrency Settings
- **Channels**: 2 concurrent (processChannelQueue)
- **Playlists**: 5 concurrent (processPlaylistQueue)

**Adjust if needed:**
```javascript
// In worker configuration
concurrency: 2  // Increase for faster processing, decrease if hitting API limits
```

## Best Practices

### For Users with Many Channels

1. **Use Priorities**
   - Mark important channels as `high`
   - Mark archive channels as `low`

2. **Monitor Quota**
   - Check quota usage before adding bulk channels
   - Use `pauseAllChannels` if approaching limit

3. **Stagger Additions**
   - Don't add 50 channels at once
   - Add 5-10, wait for completion, then add more

### For Administrators

1. **Set Up Cron Job**
   ```bash
   # Crontab entry (run at midnight UTC)
   0 0 * * * curl https://yourapp.com/api/cron/retryPendingQuotaJobs
   ```

2. **Monitor Failed Jobs**
   - BullMQ keeps failed jobs (Dead Letter Queue)
   - Review failures regularly
   - Common causes: OAuth expired, private playlists, API errors

3. **Adjust Worker Concurrency**
   - Monitor YouTube API quota usage
   - If hitting rate limits: reduce concurrency
   - If quota underutilized: increase concurrency

## API Quota Costs

All operations use efficient API calls (1 unit each):

| Operation | Old Cost | New Cost | Savings |
|-----------|----------|----------|---------|
| Channel lookup (@handle) | 100 units | 1 unit | 99% |
| Channel lookup (ID) | 1 unit | 1 unit | 0% |
| Playlist metadata | 1 unit | 1 unit | 0% |
| Playlist items (per 50) | 1 unit | 1 unit | 0% |

**Daily Limit**: 10,000 units per user (per-user OAuth)

## Error Handling

### OAuth Errors
If YouTube authorization expires:
- Status: `failed`
- Error: "YouTube authorization expired or revoked"
- Action: Reconnect YouTube account in settings

### Quota Exhausted
If quota hits 95%:
- Status: `pending_quota`
- Action: Automatically retries at midnight UTC

### Network/API Errors
If YouTube API is down:
- Status: `failed`
- Retry count: Up to 3 attempts with exponential backoff
- Action: Review error in failed jobs queue

## UI Integration Examples

### Display Channel Status
```javascript
const STATUS_CONFIG = {
  queued: { color: 'blue', icon: 'clock', message: 'Waiting in queue' },
  processing: { color: 'yellow', icon: 'spinner', message: 'Fetching data' },
  pending_quota: { color: 'orange', icon: 'pause', message: 'Quota limit reached' },
  paused: { color: 'gray', icon: 'pause', message: 'Paused by user' },
  completed: { color: 'green', icon: 'check', message: 'Completed' },
  failed: { color: 'red', icon: 'error', message: 'Failed' }
};
```

### Progress Bar
```javascript
const progress = channelSetting.P.progress || 0;
const processedPlaylists = channelSetting.P.processedPlaylists || 0;
const totalPlaylists = channelSetting.P.totalPlaylists || 0;

// Show: "Processing: 5/10 playlists (50%)"
```

### Bulk Actions Panel
```jsx
<div>
  <button onClick={() => pauseAllChannels()}>
    Pause All
  </button>
  <button onClick={() => resumePendingChannels()}>
    Resume All
  </button>
  <button onClick={() => retryFailedJobs()}>
    Retry Failed
  </button>
</div>
```

## Troubleshooting

### Channels Stuck in "Processing"
**Cause**: Worker crashed or database connection lost  
**Solution**: Restart workers, mark as failed manually

### High Failure Rate
**Cause**: OAuth expired, private channels, API issues  
**Solution**: Check error messages, reconnect OAuth, verify channel URLs

### Quota Always Exhausted
**Cause**: Too many channels, high concurrency  
**Solution**: Reduce worker concurrency, use priorities, stagger additions

## Migration Notes

### Existing Channels
- Old channels without priority will default to `normal`
- Channels in `queued`/`processing` before update will continue normally
- No data migration required

### Breaking Changes
- None - all changes are backward compatible
