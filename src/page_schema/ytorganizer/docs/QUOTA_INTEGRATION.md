# Quota Checking Integration Guide

This guide explains how to integrate quota checking into the video/channel addition flow to enforce subscription plan limits.

## Overview

The quota checking system ensures users stay within their subscription plan limits:
- **Free Plan**: 10,000 videos
- **Basic Plan**: 50,000 videos
- **Pro Plan**: 150,000 videos
- **Unlimited Plan**: Unlimited videos

The system uses a **soft limit** approach: users can see they're over the limit but are prompted to upgrade rather than being hard-blocked.

---

## Integration Points

### 1. Channel Addition Flow

**File**: `src/page_schema/ytorganizer/functions/saveChannel.hjson`

**Where to Add**: At the beginning of the function body, before fetching channel metadata.

**Code to Add**:

```javascript
// Check quota before adding channel
const quotaCheck = await args.executeNamedServerFunction({
  functionName: "checkQuotaLimit",
  contextData: {
    videosToAdd: 1 // Estimate, will be updated after channel is fetched
  }
});

if (quotaCheck.success && quotaCheck.data.shouldShowUpgradePrompt) {
  // User is over limit - show upgrade prompt
  return {
    success: false,
    requiresUpgrade: true,
    quotaInfo: quotaCheck.data,
    message: quotaCheck.data.upgradeMessage || "You've reached your video quota limit. Please upgrade your plan to add more channels."
  };
}
```

**After Channel is Added** (update quota):

```javascript
// After successfully adding channel with video count
const videoCount = channelMetadata.statistics?.videoCount || 0;

// Update user's video quota
await args.session.run(
  `MATCH (u:User {uuid: $userId})
   SET u.videoQuotaUsed = COALESCE(u.videoQuotaUsed, 0) + $videoCount
   RETURN u`,
  {
    userId: user.P.uuid,
    videoCount: parseInt(videoCount)
  }
);
```

---

### 2. Playlist Addition Flow

**File**: `src/page_schema/ytorganizer/functions/savePlaylist.hjson`

**Where to Add**: At the beginning of the function body.

**Code to Add**:

```javascript
// Check quota before adding playlist
const quotaCheck = await args.executeNamedServerFunction({
  functionName: "checkQuotaLimit",
  contextData: {
    videosToAdd: 1 // Will be updated after playlist is fetched
  }
});

if (quotaCheck.success && quotaCheck.data.shouldShowUpgradePrompt) {
  return {
    success: false,
    requiresUpgrade: true,
    quotaInfo: quotaCheck.data,
    message: quotaCheck.data.upgradeMessage || "You've reached your video quota limit. Please upgrade your plan to add more playlists."
  };
}
```

**After Playlist is Added** (update quota):

```javascript
// After successfully adding playlist with video count
const itemCount = playlistMetadata.contentDetails?.itemCount || 0;

// Update user's video quota
await args.session.run(
  `MATCH (u:User {uuid: $userId})
   SET u.videoQuotaUsed = COALESCE(u.videoQuotaUsed, 0) + $itemCount
   RETURN u`,
  {
    userId: user.P.uuid, itemCount: parseInt(videoCount)
  }
);
```

---

### 3. Frontend - Channel/Playlist Add Forms

**Files**:
- YTO Content pages with add channel/playlist forms
- Any component that allows adding channels or playlists

**Where to Add**: In the form submission handler, check the response for upgrade requirements.

**Code Example**:

```javascript
// In the onClick handler for "Add Channel" button
onClick: async () => {
  try {
    const result = await args.executeNamedServerFunction({
      functionName: "saveChannel",
      contextData: {
        channelUrl: channelUrl,
        ownershipId: selectedOwnership
      }
    });

    if (!result.success) {
      // Check if upgrade is required
      if (result.requiresUpgrade) {
        // Show upgrade modal or redirect to upgrade page
        const shouldUpgrade = confirm(
          result.message + "\n\nWould you like to upgrade now?"
        );

        if (shouldUpgrade) {
          args.navigate("/checkout?plan=basic&cycle=monthly");
        }
        return;
      }

      // Other error handling
      args.showErrorToast(result.message);
      return;
    }

    // Success - channel added
    args.showSuccessToast("Channel added successfully!");
  } catch (error) {
    args.showErrorToast(error.message);
  }
}
```

---

### 4. Add Quota Warning Component to Pages

**Recommended Pages**:
- Content.hjson (main content management page)
- AdminHome.hjson (admin dashboard)

**How to Add**:

Add the QuotaWarning component to the page:

```hjson
{
  id: "quota_warning",
  L: "Attr",
  P: {
    displayOrder: 999, # High display order to render last
    componentName: "QuotaWarning"
  }
}
```

And add corresponding edge:

```hjson
{ id: "e_quota_warning", T: "Attr", S: "page_root", E: "quota_warning" }
```

---

## Quota Update Scenarios

### Scenario 1: User Adds a Channel

1. **Check quota** before adding → If over limit, show upgrade prompt
2. **Fetch channel** from YouTube API
3. **Add channel** to database
4. **Update quota** with actual video count from channel

### Scenario 2: User Adds a Playlist

1. **Check quota** before adding → If over limit, show upgrade prompt
2. **Fetch playlist** from YouTube API
3. **Add playlist** to database
4. **Update quota** with actual video count from playlist

### Scenario 3: Channel/Playlist Auto-Refresh

When channels auto-refresh and new videos are detected:

```javascript
// In processChannelQueue or similar background worker
const newVideosCount = newVideos.length;

// Update user's quota
await args.session.run(
  `MATCH (u:User)-[:UserChannel]->(c:Channel {youtubeId: $channelId})
   SET u.videoQuotaUsed = COALESCE(u.videoQuotaUsed, 0) + $newVideosCount
   RETURN u`,
  {
    channelId: channelId,
    newVideosCount: newVideosCount
  }
);
```

### Scenario 4: User Deletes a Channel/Playlist

```javascript
// In deleteChannel or deletePlaylist function
const videoCount = channel.videoCount || 0;

// Decrease quota when deleting
await args.session.run(
  `MATCH (u:User {uuid: $userId})
   SET u.videoQuotaUsed = COALESCE(u.videoQuotaUsed, 0) - $videoCount
   RETURN u`,
  {
    userId: user.P.uuid,
    videoCount: videoCount
  }
);
```

---

## Testing Quota Integration

### Manual Testing Steps

1. **Create test user with low quota**:
   ```cypher
   MATCH (u:User {email: "test@example.com"})
   SET u.currentPlan = "free",
       u.videoQuotaLimit = 100,
       u.videoQuotaUsed = 0
   RETURN u
   ```

2. **Try adding a channel**:
   - Add a small channel (< 100 videos) → Should succeed
   - Add another channel that would exceed 100 → Should show upgrade prompt

3. **Verify quota updates**:
   ```cypher
   MATCH (u:User {email: "test@example.com"})
   RETURN u.videoQuotaUsed, u.videoQuotaLimit
   ```

4. **Test soft limit behavior**:
   - Set `videoQuotaUsed` to 95
   - Try adding channel with 10 videos
   - Should show warning but allow (soft limit)

5. **Test quota warning component**:
   - Set quota to 90% used
   - Navigate to content page
   - Should see warning at bottom right

---

## Database Queries for Quota Management

### Initialize User Quota (for existing users)

```cypher
// Initialize quota for all users who don't have it
MATCH (u:User)
WHERE u.videoQuotaLimit IS NULL
SET u.currentPlan = COALESCE(u.currentPlan, "free"),
    u.videoQuotaLimit = CASE u.currentPlan
      WHEN "basic" THEN 50000
      WHEN "pro" THEN 150000
      WHEN "unlimited" THEN 999999999
      ELSE 10000
    END,
    u.videoQuotaUsed = 0,
    u.subscriptionStatus = COALESCE(u.subscriptionStatus, "none")
RETURN u.email, u.currentPlan, u.videoQuotaLimit
```

### Calculate Current Quota Usage

```cypher
// Calculate actual quota usage from channels and playlists
MATCH (u:User {uuid: $userId})
OPTIONAL MATCH (u)-[:UserChannel]->(c:Channel)
OPTIONAL MATCH (u)-[:UserPlaylist]->(p:Playlist)
WITH u,
     COALESCE(SUM(c.videoCount), 0) as channelVideos,
     COALESCE(SUM(p.videoCount), 0) as playlistVideos
SET u.videoQuotaUsed = channelVideos + playlistVideos
RETURN u.videoQuotaUsed, u.videoQuotaLimit
```

### Get Users Approaching Quota Limit

```cypher
// Find users at 80% or more of their quota
MATCH (u:User)
WHERE u.videoQuotaUsed >= u.videoQuotaLimit * 0.8
  AND u.currentPlan <> "unlimited"
RETURN u.email, u.currentPlan, u.videoQuotaUsed, u.videoQuotaLimit,
       (u.videoQuotaUsed * 100.0 / u.videoQuotaLimit) as percentageUsed
ORDER BY percentageUsed DESC
```

---

## Upgrade Flow Integration

### User Clicks "Upgrade" from Quota Warning

```javascript
// In QuotaWarning component
onClick: () => {
  const currentPlan = args.fns.quotaData()?.currentPlan || "free";
  const suggestedPlan = args.fns.quotaData()?.suggestedPlan || "basic";

  // Navigate to checkout with suggested plan
  args.navigate(`/checkout?plan=${suggestedPlan}&cycle=monthly&from=${currentPlan}`);
}
```

### After Successful Payment

The `verifyPaymentSignature` function automatically:
1. Updates user's `currentPlan`
2. Updates user's `videoQuotaLimit` based on new plan
3. Sets subscription status to "active"

No additional quota code needed in the checkout flow.

---

## Best Practices

1. **Always check quota before expensive operations**
   - Before fetching channel/playlist metadata from YouTube
   - Before processing large batch operations

2. **Update quota immediately after operations**
   - After successfully adding channel/playlist
   - After auto-refresh discovers new videos
   - After deleting content (decrease quota)

3. **Use soft limits**
   - Don't hard-block users
   - Show upgrade prompts instead
   - Allow completing current operation

4. **Provide clear messaging**
   - Show exact numbers (used/limit)
   - Explain what happens when upgrading
   - Provide direct link to upgrade page

5. **Log quota-related errors**
   - Track when users hit limits
   - Monitor quota accuracy
   - Debug quota calculation issues

---

## Future Enhancements

Potential improvements to consider:

1. **Quota Notifications**
   - Email users when approaching 80% quota
   - Email when limit reached
   - Weekly quota usage reports

2. **Quota Analytics**
   - Dashboard showing quota trends
   - Predict when user will hit limit
   - Identify power users for upgrade targeting

3. **Flexible Quota**
   - Allow one-time quota purchases
   - Temporary quota boosts
   - Rollover unused quota

4. **Quota Reset**
   - Monthly quota resets (instead of subscription-based)
   - Quota refresh on plan changes

---

**Last Updated**: 2025-11-09
