# Progress Polling Guide for YSaar

## Overview

The YSaar uses background workers to process channels and playlists. Since processing can take several minutes to hours (depending on channel size), real-time progress updates require polling.

## Recommended Polling Strategy

### Frontend Implementation

```javascript
// Poll interval: 5 seconds for active processing, 30 seconds for idle
const ACTIVE_POLL_INTERVAL = 5000;   // 5 seconds
const IDLE_POLL_INTERVAL = 30000;     // 30 seconds

// Example polling implementation
let pollInterval = null;
let currentInterval = IDLE_POLL_INTERVAL;

const startPolling = async () => {
  const poll = async () => {
    try {
      // Call getAllProcessingStatus to get current status
      const result = await _.executeNamedServerFunction({
        functionName: "getAllProcessingStatus",
        contextData: {}
      });

      if (result.success && result.data) {
        const { channels, playlists, hasActiveProcessing } = result.data;

        // Update UI with progress
        updateProgressUI(channels, playlists);

        // Adjust polling interval based on activity
        const newInterval = hasActiveProcessing
          ? ACTIVE_POLL_INTERVAL
          : IDLE_POLL_INTERVAL;

        // Restart polling if interval changed
        if (newInterval !== currentInterval) {
          currentInterval = newInterval;
          stopPolling();
          startPolling();
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  // Initial poll
  await poll();

  // Set up interval
  pollInterval = setInterval(poll, currentInterval);
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
};

// Start polling when user opens the page
startPolling();

// Clean up when component unmounts
onCleanup(() => {
  stopPolling();
});
```

### Progress Data Structure

**getAllProcessingStatus** returns:

```javascript
{
  success: true,
  data: {
    channels: [
      {
        channel: {
          id: "...",
          L: ["Channel"],
          P: {
            youtubeId: "UC123...",
            title: "Channel Name",
            thumbnail: "https://...",
            // ... other channel properties
          }
        },
        channelSetting: {
          id: "...",
          L: ["ChannelSetting"],
          P: {
            status: "processing",      // 'queued' | 'processing' | 'completed' | 'failed' | 'completed_with_errors'
            progress: 45,              // 0-100
            totalPlaylists: 20,
            processedPlaylists: 9,
            totalVideos: 0,
            processedVideos: 0,
            error: null,               // Error message if failed
            queuedAt: "2025-01-01T...",
            updatedAt: "2025-01-01T..."
          }
        }
      }
    ],
    playlists: [
      {
        playlist: {
          id: "...",
          L: ["Playlist"],
          P: {
            youtubeId: "PL123...",
            title: "Playlist Name",
            thumbnail: "https://...",
            itemCount: 100
          }
        },
        playlistSetting: {
          id: "...",
          L: ["PlaylistSetting"],
          P: {
            status: "processing",
            progress: 67,
            totalVideos: 100,
            processedVideos: 67,
            error: null,
            queuedAt: "2025-01-01T...",
            updatedAt: "2025-01-01T..."
          }
        }
      }
    ],
    hasActiveProcessing: true
  }
}
```

### UI Display Examples

#### Progress Bar Component

```javascript
const ProgressBar = (props) => {
  const status = props.setting.P.status;
  const progress = props.setting.P.progress || 0;

  const statusColors = {
    queued: 'blue',
    processing: 'orange',
    completed: 'green',
    failed: 'red',
    completed_with_errors: 'yellow'
  };

  const statusText = {
    queued: 'Queued',
    processing: `Processing... ${progress}%`,
    completed: 'Completed',
    failed: 'Failed',
    completed_with_errors: 'Completed with errors'
  };

  return (
    <div>
      <div class="progress-bar" style={`width: ${progress}%; background: ${statusColors[status]};`} />
      <div class="status-text">{statusText[status]}</div>
      {props.setting.P.error && (
        <div class="error-message">{props.setting.P.error}</div>
      )}
    </div>
  );
};
```

#### Channel Processing Card

```javascript
const ChannelProcessingCard = (props) => {
  const { channel, channelSetting } = props.data;

  return (
    <div class="channel-card">
      <img src={channel.P.thumbnail} alt={channel.P.title} />
      <h3>{channel.P.title}</h3>

      <ProgressBar setting={channelSetting} />

      <div class="stats">
        <div>Playlists: {channelSetting.P.processedPlaylists}/{channelSetting.P.totalPlaylists}</div>
        <div>Videos: {channelSetting.P.processedVideos}/{channelSetting.P.totalVideos}</div>
      </div>

      {channelSetting.P.status === 'failed' && (
        <button onClick={() => retryChannel(channel.P.youtubeId)}>
          Retry
        </button>
      )}
    </div>
  );
};
```

## Worker Health Monitoring

Use `getWorkerHealth` to monitor worker status:

```javascript
const checkWorkerHealth = async () => {
  const result = await _.executeNamedServerFunction({
    functionName: "getWorkerHealth",
    contextData: {}
  });

  if (result.success && result.data.healthy) {
    const { queues, summary } = result.data;

    console.log('Workers are healthy');
    console.log(`Active jobs: ${summary.totalActive}`);
    console.log(`Waiting jobs: ${summary.totalWaiting}`);
    console.log(`Failed jobs: ${summary.totalFailed}`);
  } else {
    console.error('Workers are unhealthy:', result.data.error);
    // Show warning to user that background processing is unavailable
  }
};
```

## Retry Failed Jobs

When jobs fail, users can manually retry them:

```javascript
// Retry a failed channel
const retryChannel = async (channelId) => {
  const result = await _.executeNamedServerFunction({
    functionName: "retryChannel",
    contextData: { channelId }
  });

  if (result.success) {
    _.showSuccessToast(result.message);
    // Restart polling to show new status
    startPolling();
  } else {
    _.showErrorToast(result.message);
  }
};

// Retry a failed playlist
const retryPlaylist = async (playlistId) => {
  const result = await _.executeNamedServerFunction({
    functionName: "retryPlaylist",
    contextData: { playlistId }
  });

  if (result.success) {
    _.showSuccessToast(result.message);
    startPolling();
  } else {
    _.showErrorToast(result.message);
  }
};
```

## Best Practices

1. **Adaptive Polling**: Use faster intervals (5s) during active processing, slower (30s) when idle
2. **Cleanup**: Always clear intervals when components unmount
3. **Error Handling**: Handle network errors gracefully and don't stop polling
4. **User Feedback**: Show clear status messages and progress indicators
5. **Retry Option**: Provide retry buttons for failed jobs
6. **Worker Health**: Periodically check worker health (every 60s) to warn users if workers are down

## Performance Considerations

- Polling `getAllProcessingStatus` is lightweight - it only queries channels/playlists with status 'queued' or 'processing'
- Once all jobs are completed, the query returns empty arrays
- Consider using visibility API to pause polling when tab is not visible:

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPolling();
  } else {
    startPolling();
  }
});
```

## Future Enhancements

Consider implementing real-time updates using:
- **WebSockets**: Bi-directional communication for instant updates
- **Server-Sent Events (SSE)**: One-way server-to-client updates
- **Push Notifications**: Notify users when processing completes

For now, polling provides a simple and reliable solution.
