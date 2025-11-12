/**
 * Create YouTube Organizer (YTO) Database Indices
 *
 * This file creates all necessary Neo4j indices for the YouTube Organizer feature
 * to optimize query performance for channels, playlists, and videos.
 *
 * Indices are created for:
 * - Entity lookups (youtubeId)
 * - User-specific queries (userUuid)
 * - Sorting fields (createdAt, favouritedAt, publishedAt, duration, etc.)
 * - Ownership tracking (accountEmail, accessToken)
 */

import type { APIEvent } from "@solidjs/start/server";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";

/**
 * Create all YTO indices
 * @param request - Optional request object for subdomain detection
 */
export async function createYTOIndices(
  request?: APIEvent["request"],
): Promise<void> {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const indices = [
      // 1. User entity lookups
      {
        name: "idx_user_uuid",
        label: "User",
        property: "uuid",
        description: "Index for user UUID lookups",
      },

      // 2. YouTube entity lookups by youtubeId
      {
        name: "idx_channel_youtube_id",
        label: "Channel",
        property: "youtubeId",
        description: "Index for channel YouTube ID lookups",
      },
      {
        name: "idx_playlist_youtube_id",
        label: "Playlist",
        property: "youtubeId",
        description: "Index for playlist YouTube ID lookups",
      },
      {
        name: "idx_video_youtube_id",
        label: "Video",
        property: "youtubeId",
        description: "Index for video YouTube ID lookups",
      },

      // 3. User settings lookups
      {
        name: "idx_channel_setting_user_uuid",
        label: "ChannelSetting",
        property: "userUuid",
        description: "Index for user's channel settings",
      },
      {
        name: "idx_playlist_setting_user_uuid",
        label: "PlaylistSetting",
        property: "userUuid",
        description: "Index for user's playlist settings",
      },
      {
        name: "idx_video_setting_user_uuid",
        label: "VideoSetting",
        property: "userUuid",
        description: "Index for user's video settings",
      },

      // 4. Sorting fields on settings (for efficient ORDER BY)
      {
        name: "idx_channel_setting_created_at",
        label: "ChannelSetting",
        property: "createdAt",
        description: "Index for sorting channels by creation date",
      },
      {
        name: "idx_channel_setting_favourited_at",
        label: "ChannelSetting",
        property: "favouritedAt",
        description: "Index for sorting favourited channels",
      },
      {
        name: "idx_playlist_setting_created_at",
        label: "PlaylistSetting",
        property: "createdAt",
        description: "Index for sorting playlists by creation date",
      },
      {
        name: "idx_playlist_setting_favourited_at",
        label: "PlaylistSetting",
        property: "favouritedAt",
        description: "Index for sorting favourited playlists",
      },
      {
        name: "idx_video_setting_created_at",
        label: "VideoSetting",
        property: "createdAt",
        description: "Index for sorting videos by creation date",
      },
      {
        name: "idx_video_setting_favourited_at",
        label: "VideoSetting",
        property: "favouritedAt",
        description: "Index for sorting favourited videos",
      },

      // 5. Video entity sorting fields
      {
        name: "idx_video_published_at",
        label: "Video",
        property: "publishedAt",
        description: "Index for sorting videos by publish date",
      },
      {
        name: "idx_video_duration",
        label: "Video",
        property: "duration",
        description: "Index for sorting videos by duration",
      },

      // 6. Video playlist index for ordering
      {
        name: "idx_video_setting_playlist_index",
        label: "VideoSetting",
        property: "playlistIndex",
        description: "Index for sorting videos by playlist position",
      },

      // 7. YouTube ownership tracking
      {
        name: "idx_youtube_ownership_user_uuid",
        label: "YouTubeOwnership",
        property: "userUuid",
        description: "Index for user's YouTube account ownerships",
      },
      {
        name: "idx_youtube_ownership_account_email",
        label: "YouTubeOwnership",
        property: "accountEmail",
        description: "Index for YouTube account email lookups",
      },

      // 8. Playlist entity sorting fields
      {
        name: "idx_playlist_published_at",
        label: "Playlist",
        property: "publishedAt",
        description: "Index for sorting playlists by publish date",
      },

      // 9. Title sorting fields
      {
        name: "idx_channel_title",
        label: "Channel",
        property: "title",
        description: "Index for sorting channels by title",
      },
      {
        name: "idx_playlist_title",
        label: "Playlist",
        property: "title",
        description: "Index for sorting playlists by title",
      },
      {
        name: "idx_video_title",
        label: "Video",
        property: "title",
        description: "Index for sorting videos by title",
      },

      // 10. Video filtering and searching fields
      {
        name: "idx_video_category_id",
        label: "Video",
        property: "categoryId",
        description: "Index for filtering videos by YouTube category",
      },
      {
        name: "idx_video_definition",
        label: "Video",
        property: "definition",
        description: "Index for filtering videos by quality (hd/sd)",
      },
      {
        name: "idx_video_caption",
        label: "Video",
        property: "caption",
        description: "Index for filtering videos with captions",
      },
      {
        name: "idx_video_dimension",
        label: "Video",
        property: "dimension",
        description: "Index for filtering 2D vs 3D videos",
      },
      {
        name: "idx_video_live_broadcast_content",
        label: "Video",
        property: "liveBroadcastContent",
        description: "Index for filtering live/upcoming/none videos",
      },
    ];

    console.log(
      `[YTO Indices] Creating ${indices.length} indices for YouTube Organizer...`,
    );

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const index of indices) {
      try {
        // Create index if it doesn't exist
        const query = `
          CREATE INDEX ${index.name} IF NOT EXISTS
          FOR (n:${index.label})
          ON (n.${index.property})
        `;

        await dbSession.run(query);
        console.log(
          `[YTO Indices] ✓ Created index: ${index.name} - ${index.description}`,
        );
        successCount++;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("already exists")
        ) {
          console.log(`[YTO Indices] ○ Index already exists: ${index.name}`);
          skipCount++;
        } else {
          console.error(
            `[YTO Indices] ✗ Failed to create index ${index.name}:`,
            error,
          );
          errorCount++;
        }
      }
    }

    console.log(
      `[YTO Indices] Summary: ${successCount} created, ${skipCount} skipped, ${errorCount} failed`,
    );
  } finally {
    await dbSession.close();
  }
}

/**
 * Drop all YTO indices (for testing/cleanup)
 * @param request - Optional request object for subdomain detection
 */
export async function dropYTOIndices(
  request?: APIEvent["request"],
): Promise<void> {
  const { dbSession } = await getDBSessionForSubdomain(request);

  try {
    const indexNames = [
      "idx_user_uuid",
      "idx_channel_youtube_id",
      "idx_playlist_youtube_id",
      "idx_video_youtube_id",
      "idx_channel_setting_user_uuid",
      "idx_playlist_setting_user_uuid",
      "idx_video_setting_user_uuid",
      "idx_channel_setting_created_at",
      "idx_channel_setting_favourited_at",
      "idx_playlist_setting_created_at",
      "idx_playlist_setting_favourited_at",
      "idx_video_setting_created_at",
      "idx_video_setting_favourited_at",
      "idx_video_published_at",
      "idx_video_duration",
      "idx_video_setting_playlist_index",
      "idx_youtube_ownership_user_uuid",
      "idx_youtube_ownership_account_email",
      "idx_playlist_published_at",
      "idx_channel_title",
      "idx_playlist_title",
      "idx_video_title",
      "idx_video_category_id",
      "idx_video_definition",
      "idx_video_caption",
      "idx_video_dimension",
      "idx_video_live_broadcast_content",
    ];

    console.log(
      `[YTO Indices] Dropping ${indexNames.length} indices for YouTube Organizer...`,
    );

    let successCount = 0;
    let errorCount = 0;

    for (const indexName of indexNames) {
      try {
        await dbSession.run(`DROP INDEX ${indexName} IF EXISTS`);
        console.log(`[YTO Indices] ✓ Dropped index: ${indexName}`);
        successCount++;
      } catch (error) {
        console.error(
          `[YTO Indices] ✗ Failed to drop index ${indexName}:`,
          error,
        );
        errorCount++;
      }
    }

    console.log(
      `[YTO Indices] Drop summary: ${successCount} dropped, ${errorCount} failed`,
    );
  } finally {
    await dbSession.close();
  }
}
