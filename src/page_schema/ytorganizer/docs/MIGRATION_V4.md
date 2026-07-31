# Schema Migration Guide: v3.x → v4.0

## Overview

This document outlines the schema migration from version 3.x to 4.0 of the YouTube Organizer (YSaar) system. This is a **major architectural change** that simplifies the database schema and improves performance.

## Migration Status

### ✅ Completed
1. **README Documentation** - Updated with new v4.0 schema
2. **Migration Script** - Created `migrateSchemaV3toV4.hjson` for data migration
3. **Core Query Functions** - Updated 3 critical functions:
   - `getChannelsWithVideoCount`
   - `getPlaylistsWithVideoCount`
   - `getVideosWithDetails`

### 🚧 In Progress
- **Save Functions** - `saveChannel` and `savePlaylist` (partially updated in README examples)

### ⏳ Pending (32 functions remaining)
- Channel operations (8 functions)
- Playlist operations (10 functions)
- Video operations (8 functions)
- Settings management (4 functions)
- Queue operations (already v4.0 compatible)
- Admin functions (2 functions)

## Key Schema Changes

### Old Schema (v3.x)
```cypher
# Indirect ownership through settings
(YouTubeOwnership)-[:YouTubeOwnershipChannelSetting]->(ChannelSetting)-[:ChannelSettingChannel]->(Channel)
(YouTubeOwnership)-[:YouTubeOwnershipPlaylistSetting]->(PlaylistSetting)-[:PlaylistSettingPlaylist]->(Playlist)
(YouTubeOwnership)-[:YouTubeOwnershipVideoSetting]->(VideoSetting)-[:VideoSettingVideo]->(Video)

# Per-ownership playlist membership
(PlaylistSetting)-[:PlaylistSettingVideo]->(Video)
```

### New Schema (v4.0)
```cypher
# Direct ownership
(YouTubeOwnership)-[:YouTubeOwnershipChannel]->(Channel)
(YouTubeOwnership)-[:YouTubeOwnershipPlaylist]->(Playlist)

# Optional settings (end nodes)
(Channel)-[:ChannelChannelSetting]->(ChannelSetting)
(Playlist)-[:PlaylistPlaylistSetting]->(PlaylistSetting)
(Video)-[:VideoVideoSetting]->(VideoSetting)

# Optional per-owner overrides
(YouTubeOwnership)-[:YouTubeOwnershipChannelSetting]->(ChannelSetting)
(YouTubeOwnership)-[:YouTubeOwnershipPlaylistSetting]->(PlaylistSetting)
(YouTubeOwnership)-[:YouTubeOwnershipVideoSetting]->(VideoSetting)

# Global playlist membership
(Playlist)-[:PlaylistVideo]->(Video)
```

## Migration Steps

### Step 1: Run Migration Script (Dry Run)

First, test the migration without making changes:

```javascript
// Execute via server function
const result = await _.executeNamedServerFunction({
  functionName: "migrateSchemaV3toV4",
  contextData: {
    dryRun: true
  }
});

console.log(result.data);
// Shows what would be migrated without making changes
```

### Step 2: Backup Database

**CRITICAL**: Backup your Neo4j database before running the actual migration:

```bash
# Stop Neo4j
neo4j stop

# Backup database
neo4j-admin backup --database=neo4j --to=/path/to/backup

# Start Neo4j
neo4j start
```

### Step 3: Run Actual Migration

```javascript
// Execute migration
const result = await _.executeNamedServerFunction({
  functionName: "migrateSchemaV3toV4",
  contextData: {
    dryRun: false
  }
});

if (result.success) {
  console.log('Migration completed successfully!');
  console.log('Statistics:', result.data);
} else {
  console.error('Migration failed:', result.error);
}
```

### Step 4: Update Remaining Functions

The following 32 functions need to be updated with new Cypher queries:

#### Channel Operations (8 functions)
- [ ] `saveChannel.hjson` - Create direct ownership relationships
- [ ] `updateChannelSetting.hjson` - Create settings on-demand
- [ ] `deleteChannel.hjson` - Update relationship cleanup
- [ ] `checkChannelExists.hjson` - Use direct ownership path
- [ ] `retryChannel.hjson` - Update query patterns
- [ ] `pauseAllChannels.hjson` - Update query patterns
- [ ] `resumePendingChannels.hjson` - Update query patterns
- [ ] `processChannelQueue.hjson` - Update queue processing

#### Playlist Operations (10 functions)
- [ ] `savePlaylist.hjson` - Create direct ownership + global membership
- [ ] `updatePlaylistSetting.hjson` - Create settings on-demand
- [ ] `deletePlaylist.hjson` - Update relationship cleanup
- [ ] `checkPlaylistExists.hjson` - Use direct ownership path
- [ ] `retryPlaylist.hjson` - Update query patterns
- [ ] `createCustomPlaylist.hjson` - Use new schema
- [ ] `addVideosToCustomPlaylist.hjson` - Use global Playlist->Video
- [ ] `getCustomPlaylists.hjson` - Update query patterns
- [ ] `updatePlaylistSortPreference.hjson` - Update settings creation
- [ ] `clearPlaylistUserSetting.hjson` - Update settings deletion

#### Video Operations (8 functions)
- [ ] `fetchVideoDetails.hjson` - Update query patterns
- [ ] `addVideoToPlaylist.hjson` - Use global Playlist->Video
- [ ] `deleteVideo.hjson` - Update relationship cleanup
- [ ] `updateVideoSetting.hjson` - Create settings on-demand
- [ ] `toggleFavourite.hjson` - Create VideoSetting on-demand
- [ ] `saveNote.hjson` - Create VideoSetting on-demand
- [ ] Video watched status functions - Update to create settings on-demand
- [ ] Video custom name functions - Update to create settings on-demand

#### Settings Management (4 functions)
- [ ] Create ChannelSetting when user adds custom name/favorites
- [ ] Create PlaylistSetting when user adds custom name/order
- [ ] Create VideoSetting when user adds note/favorite/watched
- [ ] Update all setting getters to handle optional settings

#### Queue Operations
- ✅ Already compatible with v4.0 (uses direct ownership)

#### Admin Functions (2 functions)
- [ ] `getAllYTOUsers.hjson` - Update for new schema
- [ ] `getUserYTODetails.hjson` - Update for new schema
- [ ] `clearAllUserData.hjson` - Update cleanup logic

### Step 5: Frontend Verification

Most frontend components should work without changes since they consume vertex data directly. However, verify:

1. **Components handle null settings**: Since settings are now optional, components must check for null
2. **Display logic**: Update any UI that assumes settings always exist
3. **Forms**: Update forms that create settings to use new relationships

### Step 6: Testing

1. **Test migration script**:
   - Run dry run and verify counts
   - Run actual migration
   - Verify all relationships migrated correctly

2. **Test each updated function**:
   - Channel operations (add, delete, update)
   - Playlist operations (add, delete, update)
   - Video operations (add note, favorite, watched)
   - Settings creation (verify created only when needed)

3. **Integration testing**:
   - Full user workflow from adding channel to managing videos
   - Multi-ownership scenarios
   - Settings override scenarios

## Function Update Pattern

### Before (v3.x)
```javascript
// Old pattern - settings always exist
MATCH (o)-[:YouTubeOwnershipChannelSetting]->(cs:ChannelSetting)-[:ChannelSettingChannel]->(c:Channel)
WHERE c.youtubeId = $channelId
SET cs.customName = $customName
RETURN c, cs
```

### After (v4.0)
```javascript
// New pattern - direct ownership + optional settings
MATCH (o:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipChannel]->(c:Channel)
WHERE c.youtubeId = $channelId

// Create setting only if custom name provided
CALL apoc.do.when(
  $customName IS NOT NULL,
  '
    MERGE (c)-[:ChannelChannelSetting]->(cs:ChannelSetting {key: $settingKey})
    ON CREATE SET cs.createdAt = datetime()
    MERGE (o)-[:YouTubeOwnershipChannelSetting]->(cs)
    SET cs.customName = $customName, cs.updatedAt = datetime()
    RETURN cs
  ',
  'RETURN null as cs',
  {c: c, o: o, customName: $customName, settingKey: $settingKey}
) YIELD value

OPTIONAL MATCH (c)-[:ChannelChannelSetting]->(cs:ChannelSetting)<-[:YouTubeOwnershipChannelSetting]-(o)
RETURN c, cs
```

## Rollback Plan

If migration fails:

1. **Stop application**
2. **Restore database backup**:
   ```bash
   neo4j stop
   neo4j-admin restore --from=/path/to/backup --database=neo4j --force
   neo4j start
   ```
3. **Revert code changes** to v3.x functions
4. **Restart application**

## Benefits of v4.0

1. **Performance**: Fewer relationship hops in queries
2. **Storage**: Settings only created when needed
3. **Simplicity**: More intuitive schema structure
4. **Flexibility**: Settings can be shared or ownership-specific
5. **Global playlists**: Playlist content visible across all ownerships

## Breaking Changes

⚠️ **Important**: This is a breaking change. After migration:

1. Old v3.x functions will NOT work
2. All 35+ server functions MUST be updated
3. Frontend components may need null checks for settings
4. No backward compatibility with v3.x schema

## Support

If you encounter issues during migration:

1. Check migration script logs for errors
2. Verify database backup is available
3. Test with dry run before actual migration
4. Update functions incrementally and test each one

## Next Steps

1. ✅ Complete the migration script (DONE)
2. ✅ Update README documentation (DONE)
3. ✅ Update core query functions (DONE)
4. 🚧 Update save functions (IN PROGRESS)
5. ⏳ Update remaining 32 functions (PENDING)
6. ⏳ Test migration on development database
7. ⏳ Run migration on production database
8. ⏳ Verify all functionality works

---

**Last Updated**: 2025-11-30
**Migration Status**: In Progress - 4/35 functions updated
**Estimated Completion**: Update remaining functions systematically
