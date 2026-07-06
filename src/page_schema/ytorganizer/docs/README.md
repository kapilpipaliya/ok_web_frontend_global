# YSaar (YTO)

A mobile-first YouTube channel and playlist management system built with accessibility in mind. This system allows users to organize their favorite YouTube channels and playlists with an intuitive interface optimized for mobile usage and screen readers.

## Overview

YSaar is a comprehensive page schema implementation that provides:

### YouTube Features
- **Channel Management**: Add, organize, and browse YouTube channels
- **Playlist Management**: Create and manage custom playlists
- **Video Organization**: View videos from channels and playlists
- **Multi-Ownership Support**: Connect multiple YouTube accounts per user with shared 10,000 units/day quota across all users
- **OAuth 2.0 Authentication**: Secure per-account YouTube API access with encrypted token storage
- **API Usage Monitoring**: Real-time tracking of YouTube API quota consumption with visual indicators

### Unified Features
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interfaces
- **Accessibility**: Screen reader friendly with proper ARIA labels and semantic HTML
- **Bottom Navigation**: Easy navigation between main sections
- **Privacy & Terms**: Comprehensive privacy policy and terms of service compliance

## Graph Schema

The system uses a multi-ownership architecture where each user can connect multiple YouTube accounts. Each YouTube account (ownership) has its own OAuth token and content settings. All users share a single 10,000 units/day API quota pool at the Google Cloud Project level:

### YouTube Schema
```
(User)-[:UserYouTubeOwnership]->(YouTubeOwnership)

########################################
# OWNERSHIP → MAIN ENTITIES (DIRECT)
########################################

(YouTubeOwnership)-[:YouTubeOwnershipChannel]->(Channel)
(YouTubeOwnership)-[:YouTubeOwnershipPlaylist]->(Playlist)
(YouTubeOwnership)-[:YouTubeOwnershipToken]->(YouTubeToken)
(YouTubeOwnership)-[:YouTubeOwnershipVideoQueue]->(VideoQueue)

########################################
# ENTITY RELATIONSHIPS
########################################

(Channel)-[:ChannelPlaylist]->(Playlist)
(Playlist)-[:PlaylistVideo]->(Video)
(VideoQueue)-[:VideoQueueVideo]->(Video)

########################################
# SETTINGS (OPTIONAL END NODES)
# - Attached to main entities
# - Created only when user performs specific actions
# - Used for user preferences and customizations
########################################

(Channel)-[:ChannelChannelSetting]->(ChannelSetting)
(Playlist)-[:PlaylistPlaylistSetting]->(PlaylistSetting)
(Video)-[:VideoVideoSetting]->(VideoSetting)

########################################
# OWNERSHIP → SETTING LINKS
# - Optional per-owner overrides
# - Used for ownership-specific customizations
########################################

(YouTubeOwnership)-[:YouTubeOwnershipChannelSetting]->(ChannelSetting)
(YouTubeOwnership)-[:YouTubeOwnershipPlaylistSetting]->(PlaylistSetting)
(YouTubeOwnership)-[:YouTubeOwnershipVideoSetting]->(VideoSetting)

########################################
# SHARED QUOTA TRACKING
########################################

(Setting {type: 'oauth'})-[:SharedAPIUsage]->(SharedAPIUsage {date, totalCost, callCount, operations, effectiveRemaining, activeReservations})
(Setting {type: 'oauth'})-[:OwnershipAPIUsage]->(OwnershipAPIUsage {ownershipId, date, totalCost, callCount, operations})
```

### Shared Schema
```
(User)-[:UserLanguageSetting]->(LanguageSetting {language: "en|hi|gu", isDefault: boolean})
(User)-[:UserFeedback]->(Feedback)
```

**Key Architecture Principles:**

**YouTube Architecture:**
- **Multi-Ownership**: Users can connect multiple YouTube accounts, each represented by a YouTubeOwnership node
- **Shared Quota**: All users share a single 10,000 units/day API quota pool at the Google Cloud Project level
- **Priority-Based Allocation**: Quota reservations support priority levels for fair resource distribution
- **Direct Ownership**: YouTubeOwnership has direct relationships to main entities (Channel, Playlist) via `YouTubeOwnershipChannel` and `YouTubeOwnershipPlaylist`
- **Ownership Switching**: Users can switch between connected accounts via dropdown selector
- **Videos via Playlists**: Videos are only accessible through playlists. Channels do not have direct relationships to videos. Each channel stores an `uploadsPlaylistId` property that references the playlist containing all channel uploads.
- **Global Playlist Membership**: Video membership in playlists is managed through `(Playlist)-[:PlaylistVideo]->(Video)` relationships, making playlist content global (not per-ownership)
- **Optional Settings**: Settings (ChannelSetting, PlaylistSetting, VideoSetting) are optional end nodes created only when user performs specific actions (add note, favorite, etc.)
- **Settings Architecture**:
  - Settings attach to main entities: `(Channel)-[:ChannelChannelSetting]->(ChannelSetting)`, `(Playlist)-[:PlaylistPlaylistSetting]->(PlaylistSetting)`, `(Video)-[:VideoVideoSetting]->(VideoSetting)`
  - Ownership can link to settings for per-owner overrides: `(YouTubeOwnership)-[:YouTubeOwnershipChannelSetting]->(ChannelSetting)`
  - Settings store user preferences: watched status, notes, favorites, custom names, etc.
- **Setting Sharing**: Settings can be shared across ownerships or be ownership-specific based on the presence of ownership links

### OAuth 2.0 Authentication & Multi-Ownership

#### YouTube OAuth & Multi-Ownership

The system supports connecting multiple YouTube accounts per user, with each account (ownership) having independent OAuth tokens. All users share a single 10,000 units/day API quota pool:

**Multi-Ownership Features:**
- Users can connect multiple YouTube/Google accounts to a single application account
- Each connected account is represented by a YouTubeOwnership node
- Each ownership has its own OAuth 2.0 tokens stored securely
- All ownerships share a 10,000 units/day API quota pool at the Google Cloud Project level
- Usage tracking per ownership for visibility and accountability
- Users can switch between connected accounts via a dropdown selector in the navigation
- Content (channels, playlists, videos) is associated with the specific ownership that added it

**Token Management:**
- Tokens are encrypted using AES-256-GCM and stored in the database
- Each ownership has separate access and refresh tokens
- Tokens are automatically refreshed when expired
- Multiple accounts can be connected without interfering with each other

**Ownership Properties:**
- `key`: Unique identifier for the ownership
- `channelId`: YouTube channel ID of the connected account
- `channelName`: Display name of the YouTube channel
- `customName`: User-defined custom name for the ownership (optional)
- `isPrimary`: Boolean indicating if this is the user's primary account
- `lastSelected`: Timestamp of when this ownership was last used
- `createdAt`, `updatedAt`: Timestamps

### Vertex Types

- **User**: Existing system user vertex (extended with YTO properties)
- **YouTubeOwnership**: Represents a connected YouTube account (NEW in v3.0)
  - `key`: Unique identifier (`youtube_ownership_${userUuid}_${channelId}`)
  - `channelId`: YouTube channel ID of the connected account
  - `channelName`: Display name of the YouTube channel
  - `customName`: User-defined custom name for the ownership (optional)
  - `isPrimary`: Boolean indicating if this is the user's primary account
  - `lastSelected`: Timestamp of when this ownership was last used
  - `createdAt`, `updatedAt`: Timestamps
- **LanguageSetting**: User's language preferences for translations
  - `language`: Language code ('en' for English, 'hi' for Hindi, 'gu' for Gujarati)
  - `isDefault`: Boolean indicating if this is the user's default language
- **ChannelSetting**: Optional user-specific channel preferences (created on-demand)
  - `key`: Unique identifier (`channel_setting_${channelId}_${ownershipId}` or `channel_setting_${channelId}` for global)
  - `customName`: User's custom name for the channel
  - `notifications`: Boolean for notification preferences
  - `autoDownload`: Boolean for automatic video downloading
  - `priority`: Channel priority level ('low', 'normal', 'high')
  - `isFavourite`: Boolean indicating if channel is favorited
  - `status`: Processing status ('pending', 'processing', 'completed', 'failed')
  - `createdAt`, `updatedAt`: Timestamps
  - **Note**: Created only when user performs specific actions (favorite, custom name, etc.)
- **Channel**: YouTube channel information (fetched via API)
  - `key`: Unique identifier (`channel_${youtubeId}`)
  - `youtubeId`: YouTube channel ID
  - `title`, `description`, `thumbnail`: Basic channel metadata
  - `customUrl`: Channel custom URL handle
  - `country`: Channel's country
  - `videoCount`, `viewCount`, `subscriberCount`: Channel statistics
  - `uploadsPlaylistId`: YouTube playlist ID containing all channel uploads
  - `publishedAt`, `createdAt`, `updatedAt`: Timestamps
- **PlaylistSetting**: Optional user-specific playlist preferences (created on-demand)
  - `key`: Unique identifier (`playlist_setting_${playlistId}_${ownershipId}` or `playlist_setting_${playlistId}` for global)
  - `customName`: User's custom name for the playlist
  - `customOrder`: Array of video IDs in user's preferred order
  - `sortBy`: Sort preference ('custom', 'date', 'title', 'index')
  - `displayPreferences`: User's display settings for the playlist (thumbnails, view mode)
  - `isFavourite`: Boolean indicating if playlist is favorited
  - `status`: Processing status ('pending', 'processing', 'completed', 'failed')
  - `lastUpdated`, `createdAt`, `updatedAt`: Timestamps
  - **Note**: Created only when user performs specific actions (favorite, custom name, etc.)
- **Playlist**: YouTube playlist information (fetched via API)
  - `key`: Unique identifier (`playlist_${youtubeId}`)
  - `youtubeId`: YouTube playlist ID
  - `title`, `description`, `thumbnail`: Basic playlist metadata
  - `channelTitle`, `channelId`: Channel information
  - `privacyStatus`, `itemCount`: Playlist status and video count
  - `publishedAt`, `createdAt`, `updatedAt`: Timestamps
- **Video**: YouTube video information (fetched via API)
  - `key`: Unique identifier (`video_${youtubeId}`)
  - `youtubeId`: YouTube video ID
  - `title`, `description`, `thumbnail`: Basic video metadata
  - `channelTitle`, `channelId`: Channel information
  - `publishedAt`, `createdAt`, `updatedAt`: Timestamps
  - `updatedCount`: Number of times video data was refreshed
- **VideoSetting**: Optional ownership-specific video preferences (created on-demand)
  - `key`: Unique identifier (`video_setting_${videoId}_${ownershipId}` or `video_setting_${videoId}` for global)
  - `watched`: Boolean indicating if user has watched the video (applies to all playlists)
  - `note`: User's personal notes about the video (applies to all playlists)
  - `isFavourite`: Boolean indicating if video is marked as favorite (applies to all playlists)
  - `customName`: Custom name for the video (applies to all playlists)
  - `createdAt`, `updatedAt`: Timestamps
  - **Note**: Created only when user performs specific actions (add note, favorite, mark watched, etc.)
- **Feedback**: User feedback submissions
  - `feedback`: Feedback text (max 1000 characters)
  - `category`: Feedback category ('general', 'bug', 'feature', 'improvement', 'other')
  - `status`: Feedback status (default: 'pending')
  - `createdAt`: Timestamp
- **VideoQueue**: Video player queue entries (per ownership)
  - `key`: Unique identifier (`video_queue_${ownershipId}_${videoId}_${timestamp}`)
  - `position`: Integer order in queue (0, 1, 2, etc.)
  - `addedAt`: Timestamp when video was added to queue
  - `createdAt`, `updatedAt`: Timestamps
- **YouTubeToken**: OAuth 2.0 tokens for YouTube API access
  - `key`: Unique identifier (`youtube_token_${userId}`)
  - `accessToken`: Encrypted OAuth access token
  - `refreshToken`: Encrypted OAuth refresh token
  - `expiresAt`: Token expiration timestamp
  - `scope`: OAuth scope (youtube.readonly)
  - `createdAt`, `updatedAt`: Timestamps
- **SharedAPIUsage**: Daily shared quota tracking across all users (NEW in v3.1)
  - `key`: Unique identifier (`shared_api_usage_${date}`)
  - `date`: Usage date (YYYY-MM-DD format)
  - `totalCost`: Total API units consumed across all users
  - `callCount`: Number of API calls made across all users
  - `operations`: JSON object tracking operation counts across all users
  - `effectiveRemaining`: Available quota after active reservations
  - `activeReservations`: Count of active quota reservations
  - `createdAt`, `updatedAt`: Timestamps
- **OwnershipAPIUsage**: Daily API usage tracking per ownership (NEW in v3.1)
  - `key`: Unique identifier (`ownership_api_usage_${ownershipId}_${date}`)
  - `ownershipId`: YouTube ownership identifier
  - `date`: Usage date (YYYY-MM-DD format)
  - `totalCost`: Total API units consumed by this ownership
  - `callCount`: Number of API calls made by this ownership
  - `operations`: JSON object tracking operation counts for this ownership
  - `createdAt`, `updatedAt`: Timestamps
- **Setting** (type: 'oauth'): Global OAuth configuration (singleton node)
  - `type`: "oauth"
  - `key`: "oauth_Default" (single instance)
  - `quotaLimit`: Daily quota limit (10,000 units)
  - `quotaResetTime`: Time when quota resets (midnight Pacific Time)
  - `alertThresholds`: JSON array of alert thresholds (e.g., [80, 95, 100])
  - `createdAt`, `updatedAt`: Timestamps

## Architecture

### Multi-Ownership Architecture

The application implements a centralized multi-ownership management system through the Layout component:

#### Layout - Central Ownership Manager

**Layout** serves as the main layout wrapper and ownership state manager for the entire application. It provides:

**Ownership State Management:**
- `ownerships` - Array of all connected YouTube accounts for the current user
- `selectedOwnership` - Currently active ownership (account)
- `ownershipsLoading` - Loading state for ownership data

**Key Functions:**
- `fetchOwnerships()` - Retrieves all connected accounts and auto-selects primary or first account
- `selectOwnership(ownership)` - Switches active account, updates lastSelected, refreshes quota
- `getSelectedOwnershipId()` - Helper to get current ownershipId

**Video Queue Management:**
- `videoQueue` - Signal containing array of queued videos (persisted in database)
- `queueLoading` - Loading state for queue operations
- `loadQueueFromDatabase()` - Loads queue from database for current ownership
- `addToQueue(video)` - Adds video to queue with database persistence
- `removeFromQueue(index)` - Removes video from queue with database persistence
- `clearQueue()` - Clears entire queue with database persistence
- `reorderQueue(fromIndex, toIndex)` - Reorders videos in queue with database persistence
- `playNext()` - Plays next video from queue and updates database
- Queue persists across page reloads and browser restarts
- Each ownership has an independent queue
- Videos can be reordered using move up/down buttons in the Queue Modal

**Ownership Selector UI:**
- Dropdown in left navigation showing all connected YouTube accounts
- Displays customName or channelName for each account
- Persists selection in sessionStorage
- Reloads page when switched to refresh all data
- Shows which account's quota is currently displayed

**executeYTOFunction Wrapper:**
All child pages/components access server functions through the `executeYTOFunction` wrapper provided by Layout. This wrapper automatically injects both `impersonatedUserUuid` (for admin) and `ownershipId` (for multi-ownership) into every server function call:

```javascript
const executeYTOFunction = async (functionName, contextData = {}) => {
  const impersonatedUserUuid = getImpersonatedUserUuid();
  const ownershipId = getSelectedOwnershipId();

  return await args.executeNamedServerFunction({
    functionName,
    contextData: {
      ...contextData,
      ...(impersonatedUserUuid ? { impersonatedUserUuid } : {}),
      ...(ownershipId ? { ownershipId } : {})
    }
  });
};
```

**Benefits:**
- **Zero Page Updates Required**: All child pages automatically work with multi-ownership without code changes
- **Centralized Logic**: Ownership management in one place (Layout)
- **Admin Support**: Seamlessly works with user impersonation for admin features
- **Type Safety**: Consistent API across all pages

**Usage in Pages:**
```javascript
// In any YTO page component - ownershipId is automatically included
const result = await args.fns.executeYTOFunction('getChannels', {
  // Only pass page-specific data, ownershipId auto-injected
});
```

### Component Structure

All components follow the YTO prefix naming convention:

#### Layout Components
- **Layout**: Main layout with bottom navigation and multi-ownership state management
- **AdminLayout**: Admin section layout with navigation sidebar
- **YTOTabBar**: Tab navigation for channel/playlist detail views

#### UI Components

**YouTube Components:**
- **YTOFloatingButton**: Basic floating action button component
- **YTOAddChannelButton**: Specialized button with modal for adding YouTube channels
- **YTOAddPlaylistButton**: Specialized button with modal for adding YouTube playlists
- **YTOChannelCard**: Channel display card with thumbnail and info
- **YTOPlaylistCard**: Playlist display card with thumbnail and info
- **YTOVideoCard**: Video display card with thumbnail and metadata
- **Card**: Display Youtube Item
- **YouTubeAttribution**: YouTube branding compliance component with clickable logo

**Shared Components:**
- **Button**: Reusable button component with variants (primary, secondary, danger)
- **PageTitle**: Consistent page title component
- **FeedbackModal**: Modal for collecting user feedback
- **VirtualList**: High-performance virtual scrolling component for rendering large lists

#### Pages

**YouTube Pages:**
- **Home**: Dashboard overview of recent activity
- **YTOChannels**: List of user's subscribed channels with add functionality
- **YTOPlaylists**: List of user's playlists with add functionality
- **YTOChannelDetail**: Channel details with videos/playlists tabs
- **YTOPlaylistDetail**: Playlist details with video list
- **AdminHome**: Admin dashboard with quick links to admin features
- **QuotaMonitor**: Admin page for monitoring shared API quota (real-time usage, breakdown by ownership, alerts)

**Settings Pages:**
- **Settings**: User settings including YouTube connection, theme, and data management

**Legal Pages:**
- **Privacy**: Privacy policy page with YouTube API Services disclosures
- **Terms**: Terms of Service page with comprehensive legal information

### API Functions

#### YouTube OAuth 2.0 Integration

The system uses per-ownership OAuth 2.0 authentication for secure YouTube API access with multi-account support:

**OAuth Flow:**
1. User clicks "Connect YouTube Account" in settings
2. Redirected to Google OAuth consent screen
3. User grants read-only access to their YouTube data
4. System receives authorization code and exchanges for tokens
5. System creates a YouTubeOwnership node with channel info from the connected account
6. Tokens are encrypted and stored in `(YouTubeOwnership)-[:YouTubeOwnershipToken]->(YouTubeToken)` relationship
7. Each ownership maintains independent OAuth tokens
8. All ownerships share the same 10,000 units/day API quota pool
9. Users can connect multiple accounts and switch between them

**OAuth Endpoints:**
- `/api/auth/youtube/connect` - Initiates OAuth flow for new account connection
- `/api/auth/youtube/callback` - Handles OAuth callback and creates ownership
- `/api/auth/youtube/disconnect` - Disconnects specific YouTube account/ownership
- `/api/auth/youtube/status` - Checks connection status for current user
- `/api/auth/youtube/ownerships` - Gets all connected accounts for user

**Token Management:**
- Tokens are encrypted using AES-256-GCM encryption
- Each ownership has separate access and refresh tokens
- Refresh tokens are automatically used to obtain new access tokens
- Tokens are stored in `(YouTubeOwnership)-[:YouTubeOwnershipToken]->(YouTubeToken)` relationship
- Multiple ownerships don't interfere with each other's tokens

#### API Usage Monitoring

The system tracks YouTube API quota consumption with a shared 10,000 units/day limit across all users at the Google Cloud Project level:

**Quota Costs:**
- `search.list`: 100 units (expensive!)
- `channels.list`: 1 unit
- `playlists.list`: 1 unit
- `playlistItems.list`: 1 unit
- `videos.list`: 1 unit

**Shared Quota Architecture:**
- **Single Quota Pool**: All users share 10,000 units/day at the Google Cloud Project level
- **Priority-Based Reservations**: Operations can reserve quota with priority levels (1-10, default: 5)
- **Per-Ownership Tracking**: Individual usage tracked by ownership for visibility and accountability
- **Automatic Logging**: All API calls logged with operation type, cost, and ownership
- **Quota Reservations**: Reserve quota before operations to prevent race conditions
- **Expiry Management**: Reservations auto-expire after 5 minutes, quota auto-released
- Daily quota tracking stored in Neo4j: `(Setting {type: 'oauth'})-[:SharedAPIUsage]->(SharedAPIUsage)` (global) and `(Setting {type: 'oauth'})-[:OwnershipAPIUsage]->(OwnershipAPIUsage)` (per ownership)

**Visual Indicators:**
- Color-coded status in admin quota monitor:
  - **Good** (green): 0-79% used
  - **Warning** (yellow): 80-94% used
  - **Critical** (red): 95-100% used
- Real-time progress bar showing shared quota consumption
- Usage breakdown by ownership showing top consumers
- Quota reset countdown timer (resets at midnight Pacific Time)
- Active reservations display

**Shared Quota Functions:**
- `logSharedAPIUsage(session, operation, cost, ownershipId)` - Log API call to shared quota pool
- `getTodaySharedAPIUsage(session)` - Get today's shared quota statistics across all users
- `getSharedAPIUsageByOwnership(session)` - Get usage breakdown by ownership
- `reserveQuota(session, cost, priority, ownershipId)` - Reserve quota before API call
- `releaseQuota(session, reservationId)` - Release unused reserved quota
- `cleanupExpiredReservations(session)` - Cleanup expired quota reservations
- `DAILY_QUOTA_LIMIT` - Constant: 10,000 units/day
- `RESERVATION_EXPIRY_MS` - Constant: 5 minutes (300,000ms)

**Admin Monitoring:**
- **QuotaMonitor**: Admin page at `/yto/admin/quota-monitor` for real-time monitoring
- **Background Workers**: BullMQ worker monitors quota levels every 5 minutes
- **Email Alerts**: Automatic alerts at 80%, 95%, and 100% thresholds
- **Usage Analytics**: Historical trends and per-ownership breakdowns

#### YouTube Data Integration

The system uses the `googleapis` library dynamically imported in server functions to interact with YouTube Data API v3. All API calls use per-ownership OAuth tokens with multi-account support.

##### Dynamic Import Pattern
```javascript
// Dynamic import of googleapis library in server functions with OAuth
const { google } = await import('googleapis');

// Get user and ownership from context
const user = await args.getUserFromSession();
const { ownershipId } = args.contextData;

if (!ownershipId) {
  throw new Error('YouTube Ownership ID is required. Please select a YouTube account.');
}

// Verify ownership belongs to user and get OAuth token
const tokenResult = await args.session.run(`
  MATCH (u:User {uuid: $userUuid})-[:UserYouTubeOwnership]->(o:YouTubeOwnership {key: $ownershipId})
  MATCH (o)-[:YouTubeOwnershipToken]->(token:YouTubeToken)
  RETURN token, o
`, { userUuid: user.P.uuid, ownershipId });

if (tokenResult.records.length === 0) {
  throw new Error('YouTube ownership not found or access denied');
}

const token = tokenResult.records[0].get('token');
const ownership = tokenResult.records[0].get('o');

// Decrypt and use OAuth token
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);
oauth2Client.setCredentials({
  access_token: decryptToken(token.P.accessToken),
  refresh_token: decryptToken(token.P.refreshToken)
});

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
});

// Log API usage for this ownership after each call
await logAPIUsage(ownershipId, 'channels.list', 1, args.session);
```

##### Functions

- **saveChannel**: Save YouTube channel with all playlists (Recommended)
  - Uses real YouTube Data API v3 with googleapis library
  - Extracts channel ID from various YouTube URL formats (/@handle, /channel/ID, /c/custom, /user/username)
  - Fetches complete channel metadata, statistics, and branding settings
  - Fetches ALL channel playlists with unlimited pagination
  - Stores `uploadsPlaylistId` in Channel node for accessing all channel videos
  - Creates comprehensive database structure with proper relationships
  - Implements user authentication with `args.getUserFromSession()`
  - Reuses existing `savePlaylist` function for each channel playlist
  - Videos are accessible through playlists (no direct Channel->Video relationships)
  - Creates user-specific ChannelSetting for channel preferences
  - Comprehensive error handling for YouTube API issues
  - Support for custom channel names and user preferences

- **savePlaylist**: Save YouTube playlist with user-specific settings (Recommended)
  - Uses real YouTube Data API v3 with googleapis library
  - Extracts playlist ID from various YouTube URL formats
  - Fetches complete playlist metadata and all videos with pagination
  - Creates user-specific playlist and video settings
  - Implements proper database structure: (User)-[:UserPlaylistSetting]->(PlaylistSetting)-[:PlaylistSettingPlaylist]->(Playlist)
  - Handles playlist-video relationships: (Playlist)-[:PlaylistVideo]->(Video)
  - Uses `args.getUserFromSession()` for user authentication
  - Comprehensive error handling for YouTube API issues
  - Support for custom playlist names and user preferences


##### Server Function Implementation
Server functions have access to:
- `args.session`: Neo4j database session for queries
- `args.context`: Evaluation context with current data
- `args.contextData`: Data passed from the component
- `args.graph`: Graph interface for database operations
- Node.js environment for dynamic imports

### Theme

- **Theme**: Custom theme optimized for video content with high contrast for accessibility

## Mobile-First Design Principles

### Navigation
- Bottom navigation bar for primary app sections
- Large touch targets (minimum 44px)
- Swipe gestures for tab navigation
- Floating action buttons for primary actions

### Layout
- Single-column layouts for mobile
- Card-based design for easy scanning
- Proper spacing between interactive elements
- Responsive typography scaling

### Performance
- Lazy loading for video thumbnails
- Efficient state management with SolidJS stores
- Optimized API calls with caching

## Accessibility Features

### Screen Reader Support
- Semantic HTML structure
- Comprehensive ARIA labels
- Descriptive alt text for all images
- Proper heading hierarchy

### Visual Accessibility
- High contrast color scheme
- Large, readable fonts
- Clear focus indicators
- Consistent iconography

### Motor Accessibility
- Large touch targets
- Voice-over navigation support
- Keyboard navigation
- Gesture alternatives

## State Management

The system uses `args.createStore` for reactive state management:

```javascript
// Example store usage in component props:
const [store, setStore] = args.createStore({
  channels: [],
  playlists: [],
  videos: [],
  loading: false,
  currentTab: 'videos',
  currentLanguage: 'en',
  error: null
});

// Update store reactively
setStore('loading', true);
setStore('channels', [...newChannels]);
setStore('currentLanguage', 'hi'); // Switch to Hindi
```

### State Categories
- **Navigation State**: Current page and navigation history
- **User Preferences**: Channel/playlist display settings  
- **Language State**: Current language and available translations
- **API Data**: Cached YouTube API responses
- **UI State**: Modal visibility, loading states, tabs, etc.

## Internationalization (i18n)

### Language Support
The system supports multiple languages through the graph schema:
- **English (en)**: Default language
- **Hindi (hi)**: Hindi translations
- **Gujarati (gu)**: Gujarati translations

### Translation Implementation
```javascript
// Example translation function in component props:
const getTranslation = (key, language = store.currentLanguage) => {
  const translations = {
    en: {
      home: 'Home',
      channels: 'Channels', 
      playlists: 'Playlists',
      add_channel: 'Add Channel',
      add_playlist: 'Add Playlist'
    },
    hi: {
      home: 'होम',
      channels: 'चैनल',
      playlists: 'प्लेलिस्ट',
      add_channel: 'चैनल जोड़ें',
      add_playlist: 'प्लेलिस्ट जोड़ें'
    },
    gu: {
      home: 'ઘર',
      channels: 'ચેનલ્સ',
      playlists: 'પ્લેલિસ્ટ',
      add_channel: 'ચેનલ ઉમેરો',
      add_playlist: 'પ્લેલિસ્ટ ઉમેરો'
    }
  };
  return translations[language]?.[key] || translations.en[key] || key;
};
```

### Language Setting Management
Users can set their preferred language through LanguageSetting vertex:
- One default language per user (`isDefault: true`)
- Multiple language preferences supported
- Language preference persists across sessions

## File Structure

```
/src/page_schema/ytorganizer/
├── components/
│   ├── layouts/
│   │   ├── Layout.hjson              # Main layout with multi-ownership state and queue management
│   │   ├── AdminLayout.hjson         # Admin section layout with navigation
│   │   └── YTOTabBar.hjson              # Tab navigation component
│   ├── buttons/
│   │   ├── YTOFloatingButton.hjson      # Basic floating action button
│   │   ├── YTOAddChannelButton.hjson    # Channel add button with modal
│   │   ├── YTOAddPlaylistButton.hjson   # Playlist add button with modal
│   │   └── Button.hjson              # Reusable button component
│   ├── cards/
│   │   ├── YTOChannelCard.hjson         # YouTube channel display card
│   │   ├── YTOPlaylistCard.hjson        # YouTube playlist display card
│   │   ├── YTOVideoCard.hjson           # YouTube video display card
│   │   ├── Card.hjson                # Generic card component
│   ├── ui/
│   │   ├── YouTubeAttribution.hjson  # YouTube branding compliance
│   │   ├── PageTitle.hjson           # Page title component
│   │   ├── FeedbackModal.hjson       # User feedback modal
│   │   ├── VirtualList.hjson         # High-performance virtual scrolling component
│   │   ├── ProcessingStatus.hjson    # Processing status indicator
│   │   ├── LoadingSpinner.hjson      # Loading spinner component
│   │   └── ... (other UI components)
├── pages/
│   ├── main/
│   │   ├── Home.hjson                # Dashboard/home page
│   ├── youtube/
│   │   ├── YTOChannels.hjson            # YouTube channels list page
│   │   ├── YTOPlaylists.hjson           # YouTube playlists list page
│   │   ├── YTOChannelDetail.hjson       # YouTube channel detail with tabs
│   │   └── YTOPlaylistDetail.hjson      # YouTube playlist detail with videos
│   ├── settings/
│   │   ├── Settings.hjson            # User settings and YouTube connection
│   ├── legal/
│   │   ├── Privacy.hjson             # Privacy policy page
│   │   └── Terms.hjson               # Terms of Service page
│   └── admin/
│       ├── AdminHome.hjson           # Admin: Dashboard with quick links
│       ├── QuotaMonitor.hjson        # Admin: Shared quota monitoring
│       ├── WorkerHealth.hjson        # Admin: Queue/worker health monitoring
│       ├── WorkerLogs.hjson          # Admin: Worker logs viewer
│       ├── AdminUsers.hjson          # Admin: User management
│       └── APIKeyManagement.hjson    # Admin: API key management
├── themes/
│   └── Theme.hjson               # Custom theme for video content
├── functions/
│   ├── youtube/
│   │   ├── savePlaylist.hjson           # Save YouTube playlist
│   │   ├── saveChannel.hjson            # Save YouTube channel
│   │   ├── getChannelsWithVideoCount.hjson  # Get channels with video counts
│   │   ├── getPlaylistsWithVideoCount.hjson # Get playlists with video counts
│   │   ├── getYouTubeOwnerships.hjson   # Get all connected YouTube accounts
│   │   ├── updateOwnershipLastSelected.hjson # Track ownership selection
│   │   ├── queue/
│   │   │   ├── loadVideoQueue.hjson     # Load queue from database
│   │   │   ├── saveVideoQueue.hjson     # Save entire queue to database
│   │   │   ├── addVideoToQueue.hjson    # Add video to queue
│   │   │   ├── removeVideoFromQueue.hjson # Remove video from queue
│   │   │   ├── clearVideoQueue.hjson    # Clear entire queue
│   │   │   └── reorderVideoQueue.hjson  # Reorder video positions in queue
│   │   └── ... (60+ YouTube functions) # All updated for shared quota architecture
│   └── admin/
│       ├── getSharedQuotaStatus.hjson   # Get shared quota status
│       ├── monitorQuotaLevels.hjson     # Monitor quota levels
│       └── sendQuotaAlertEmail.hjson    # Send quota alerts
└── docs/
    └── README.md                    # This documentation

/src/lib/youtube/
├── youtubeOAuth.ts                  # YouTube OAuth 2.0 token management
└── apiUsageTracking.ts              # YouTube API quota tracking functions

/src/lib/auth/
└── tokenEncryption.ts               # Token encryption/decryption utilities

/src/routes/api/
├── auth/youtube/
│   ├── connect.ts                   # Initiate YouTube OAuth flow
│   ├── callback.ts                  # YouTube OAuth callback handler
│   ├── disconnect.ts                # Disconnect YouTube account
│   └── status.ts                    # Check YouTube connection status
└── youtube/
    └── usage.ts                     # Get YouTube API usage statistics
```

## Usage Patterns

### Adding a Channel
1. Navigate to Channels page
2. Tap floating button
3. Enter YouTube channel URL or ID and optional custom name
4. Component calls `args.executeNamedServerFunction` with `saveChannel` function
5. Server function authenticates user with `args.getUserFromSession()`
6. Extracts channel ID from URL using multiple URL pattern support
7. Fetches complete channel data from YouTube Data API v3
8. Fetches ALL channel playlists with unlimited pagination
9. Creates/updates Channel vertex with YouTube metadata, statistics, and `uploadsPlaylistId`
10. Creates user-specific ChannelSetting with custom preferences
11. Processes all channel playlists using existing savePlaylist function
12. Establishes comprehensive relationships following the database schema
13. Videos are accessible through playlists (including the uploads playlist referenced by `uploadsPlaylistId`)

### Adding a Playlist
1. Navigate to Playlists page
2. Tap floating button
3. Enter YouTube playlist URL or ID and optional custom name
4. Component calls `args.executeNamedServerFunction` with `savePlaylist` function
5. Server function authenticates user with `args.getUserFromSession()`
6. Extracts playlist ID from URL using multiple URL pattern support
7. Fetches complete playlist data from YouTube Data API v3 with pagination
8. Creates/updates Playlist vertex with YouTube metadata
9. Creates user-specific PlaylistSetting with custom preferences
10. Creates/updates Video vertices for all playlist videos
11. Creates user-specific VideoSetting for each video with watch status and notes
12. Establishes proper relationships following the database schema

### Browsing Content
1. Use bottom navigation to switch between sections
2. Tap cards to view details
3. Use tabs in detail views to switch between content types
4. Swipe or tap for navigation within lists

### Video Management
1. **Playlist Membership**: Videos belong to playlists globally via `(Playlist)-[:PlaylistVideo]->(Video)` relationships. All ownerships see the same videos in a playlist.
2. **Global Settings**: Video settings (watched status, notes, favorites) are created on-demand when user performs actions:
   - Stored via `(Video)-[:VideoVideoSetting]->(VideoSetting)` and `(YouTubeOwnership)-[:YouTubeOwnershipVideoSetting]->(VideoSetting)`
   - Settings are optional and created only when needed (add note, mark watched, favorite, etc.)
   - Can be shared across ownerships or ownership-specific based on links
3. **Custom Video Ordering**: In playlist view, drag and drop videos to reorder. Custom order is saved to optional PlaylistSetting vertex
4. **Sort Modes**: Switch between 'custom', 'date', 'title', 'index' (original YouTube order). Custom order persists across sessions for each ownership

### Video Queue Management
1. **Add to Queue**: Click the queue button on any video to add it to your playback queue
2. **Queue Persistence**: Queue is automatically saved to database and persists across sessions
3. **Per-Ownership Queues**: Each YouTube account has its own independent queue
4. **Queue Operations**:
   - **View Queue**: Click queue button in video player to see all queued videos
   - **Play from Queue**: Click "Play now" in queue modal to jump to any video
   - **Remove from Queue**: Click remove button to remove specific videos
   - **Reorder Queue**: Use move up/down arrow buttons to change video order in queue
   - **Clear Queue**: Use "Clear All" button to empty entire queue
   - **Auto-play**: Videos automatically play next when current video ends
5. **Queue Loading**: Queue is loaded from database when:
   - Page loads or refreshes
   - User switches between YouTube accounts
   - User logs in

## Component Architecture

### Add Button Components
The system uses specialized add button components that encapsulate both the floating action button and the modal form:

#### YTOAddChannelButton
- **Purpose**: Handles adding new YouTube channels with complete data fetching
- **Features**: Floating button + modal with channel-specific form
- **Styling**: Uses primary theme color
- **Server Function**: Calls `saveChannel` function for comprehensive channel processing
- **Form Fields**:
  - YouTube Channel URL (required) - supports multiple formats
  - Custom Name (optional)
- **Functionality**:
  - Fetches ALL channel videos and playlists
  - Creates user-specific settings for all content
  - Handles loading states and error messages
  - Provides success feedback with channel statistics
- **Usage**:
  ```javascript
  <YTOAddChannelButton onSubmit={handleChannelSubmit} />
  ```

#### YTOAddPlaylistButton
- **Purpose**: Handles adding new YouTube playlists
- **Features**: Floating button + modal with playlist-specific form
- **Styling**: Uses success theme color (green)
- **Form Fields**:
  - YouTube Playlist URL (required)
  - Custom Name (optional)
- **Usage**:
  ```javascript
  <YTOAddPlaylistButton onSubmit={handlePlaylistSubmit} />
  ```

#### Component Benefits
- **Single Responsibility**: Each component handles one specific add action
- **Encapsulation**: Button and modal logic contained within component
- **Reusability**: Can be used across different pages
- **Consistency**: Standardized form behavior and validation
- **Maintainability**: Changes to add functionality isolated to specific components

### VirtualList Component

The **VirtualList** component provides high-performance virtual scrolling for rendering large lists efficiently. It only renders items that are visible in the viewport plus an overscan buffer, dramatically improving performance for lists with thousands of items.

**Features:**
- **Virtual Scrolling**: Only renders visible items + overscan
- **Fixed Item Heights**: Optimized for consistent item sizes
- **Scroll Management**: Automatic scroll position tracking
- **Flexible Rendering**: Child components define item rendering
- **Customizable**: Configurable item height, overscan, and container styling

**Component Variants:**
- `items`: Array of items to render (default: `[]`)
- `itemHeight`: Height of each item in pixels (default: `90`)
- `overscan`: Number of items to render outside viewport (default: `5`)
- `onScroll`: Custom scroll event handler (optional)
- `containerClass`: CSS class for container element (optional)

**Usage Pattern:**

The VirtualList component uses a child-based rendering pattern where you define Attr components as children to specify how items should be rendered:

```hjson
{
  vertexes: [
    {
      id: "list_container",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "VirtualList",
        props: '''
// Filtered items from parent context
const filteredItems = args.fns.filteredItems();

return {
  items: filteredItems,
  itemHeight: 90,
  overscan: 5,
  containerClass: "my-custom-list"
};
'''
      }
    },
    {
      id: "item_renderer",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "Html",
        slotName: "children",
        props: '''
// VirtualList provides item context with {item, virtualItem, index}
const itemContext = args.contextData.item;
const itemData = itemContext.item;

// Access your item data (e.g., channel, playlist, video)
const channel = itemData.channel;
const channelSetting = itemData.channelSetting;

return {
  as: "div",
  onClick: () => handleItemClick(itemData)
};
''',
        css: '''
return `._id {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${args.theme.var.color.border};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${args.theme.var.color.background_light_100};
  }
}`;
'''
      }
    },
    {
      id: "item_thumbnail",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "Html",
        props: '''
const itemContext = args.contextData.item;
const itemData = itemContext.item;
const channel = itemData.channel;

return {
  as: "img",
  src: channel?.P?.thumbnailHigh || channel?.P?.thumbnailMedium || "",
  alt: channel?.P?.title || "Channel thumbnail"
};
''',
        css: '''
return `._id {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}`;
'''
      }
    },
    {
      id: "item_info",
      L: "Attr",
      P: {
        displayOrder: 2,
        componentName: "Html",
        props: '''
const itemContext = args.contextData.item;
const itemData = itemContext.item;
const channel = itemData.channel;
const channelSetting = itemData.channelSetting;

const title = channelSetting?.P?.customName || channel?.P?.title || "Unknown";
const subtitle = `${channel?.P?.videoCount || 0} videos`;

return {
  as: "div"
};
'''
      }
    },
    {
      id: "item_title",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "Html",
        props: '''
const itemContext = args.contextData.item;
const itemData = itemContext.item;
const channel = itemData.channel;
const channelSetting = itemData.channelSetting;

const title = channelSetting?.P?.customName || channel?.P?.title || "Unknown";

return {
  as: "div",
  text: title
};
''',
        css: '''
return `._id {
  font-size: 1rem;
  font-weight: 500;
  color: ${args.theme.var.color.text};
  margin-bottom: 0.25rem;
}`;
'''
      }
    },
    {
      id: "item_subtitle",
      L: "Attr",
      P: {
        displayOrder: 2,
        componentName: "Html",
        props: '''
const itemContext = args.contextData.item;
const itemData = itemContext.item;
const channel = itemData.channel;

const subtitle = `${channel?.P?.videoCount || 0} videos`;

return {
  as: "div",
  text: subtitle
};
''',
        css: '''
return `._id {
  font-size: 0.875rem;
  color: ${args.theme.var.color.text_light_500};
}`;
'''
      }
    }
  ],
  edges: [
    { id: "e1", T: "Attr", S: "list_container", E: "item_renderer" },
    { id: "e2", T: "Attr", S: "item_renderer", E: "item_thumbnail" },
    { id: "e3", T: "Attr", S: "item_renderer", E: "item_info" },
    { id: "e4", T: "Attr", S: "item_info", E: "item_title" },
    { id: "e5", T: "Attr", S: "item_info", E: "item_subtitle" }
  ]
}
```

**How It Works:**

1. **VirtualList** component manages:
   - Scroll position tracking via `scrollTop` signal
   - Visible range calculation based on viewport size and item height
   - Virtual items array containing only visible items with their positions
   - Total container height calculation

2. **Context Data** provided to children via `args.contextData.item`:
   - `item`: The actual data item from the array
   - `virtualItem`: Object with `{ index, start, size }` for positioning
   - `index`: The item's index in the array

3. **Child Components** define rendering:
   - Use `slotName: "children"` to render inside VirtualList's Slot
   - Access item data via `args.contextData.item.item`
   - Access positioning info via `args.contextData.item.virtualItem`
   - Define custom layout and styling

**Performance Benefits:**
- Renders only ~10-20 items for a viewport showing 6-8 items (with overscan of 5)
- Handles lists of 1000+ items without performance degradation
- Smooth scrolling experience even on mobile devices
- Minimal memory footprint compared to rendering all items

**Advanced Usage:**

Custom scroll handler:
```javascript
props: '''
return {
  items: myItems,
  itemHeight: 100,
  onScroll: (e) => {
    // Custom scroll logic
    const scrollPercentage = (e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight)) * 100;
    if (scrollPercentage > 80) {
      // Load more items when nearing bottom
      loadMoreItems();
    }
  }
};
'''
```

Dynamic item height (use function):
```javascript
props: '''
return {
  items: myItems,
  itemHeight: () => {
    // Return dynamic height based on state
    return args.fns.isCompactMode() ? 60 : 90;
  }
};
'''
```

**File Location:**
`/src/page_schema/ytorganizer/components/ui/VirtualList.hjson`

## Development Guidelines

### Component Development
- Use YTO prefix for all components
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Optimize for mobile viewport

#### Icon Guidelines
- **Use Carbon Icons only**: All icons must use Carbon Design System icons
- **Icon format**: Use `carbon:icon-name` format (e.g., `carbon:api-1`, `carbon:play`, `carbon:add`)
- **Consistent sizing**: Use standard sizes (16px, 20px, 24px, 32px)
- **Semantic icons**: Choose icons that clearly represent their function
- **Examples**:
  - Add button: `carbon:add`
  - Play video: `carbon:play`
  - Home: `carbon:home`
  - Settings: `carbon:settings`
  - Search: `carbon:search`
  - Menu: `carbon:menu`

### Security Guidelines

#### Ownership Verification Rule (CRITICAL)

**Never access resources globally - always verify ownership first.**

This is the most important security principle in the YTO codebase. Every database query that accesses channels, playlists, or videos MUST verify ownership before accessing the resource.

**Why This Matters:**
- Prevents users from accessing resources they don't own
- Stops potential data leaks across different YouTube accounts
- Ensures multi-ownership isolation
- Protects against unauthorized modifications

**Pattern to Follow:**

❌ **WRONG - Global Access:**
```javascript
// BAD: Accessing playlist without ownership verification
const result = await args.session.run(`
  MATCH (p:Playlist {youtubeId: $playlistId})
  RETURN p
`, { playlistId });
```

✅ **CORRECT - Ownership-Verified Access:**
```javascript
// GOOD: Always verify ownership first
const result = await args.session.run(`
  MATCH (o:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipPlaylist]->(p:Playlist {youtubeId: $playlistId})
  RETURN p
`, { ownershipId, playlistId });
```

**Apply to All Resources:**

- **Channels**: `MATCH (o:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipChannel]->(c:Channel {youtubeId: $channelId})`
- **Playlists**: `MATCH (o:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipPlaylist]->(p:Playlist {youtubeId: $playlistId})`
- **Videos**: Verify through playlist ownership when accessing videos in a playlist context
- **Settings**: Always match through ownership relationships

**Defensive Programming:**
- Verify ownership in EVERY query, even if already checked earlier in the function
- Never assume a resource exists or is accessible
- Always use the provided `ownershipId` parameter
- Throw clear error messages when ownership verification fails

**Example from Real Function:**
```javascript
// In deletePlaylist.hjson - even when checking active jobs, verify ownership
const playlistResult = await args.session.run(`
  MATCH (o:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipPlaylist]->(p:Playlist {youtubeId: $playlistId})
  RETURN p.title as title
`, { ownershipId, playlistId });
```

#### Duplicate Resources Per Ownership (CRITICAL)

**Each ownership has its own instances of playlists, videos, and channels - no global sharing.**

To ensure complete data isolation between different YouTube accounts, the system creates duplicate resource instances (Playlist, Video, and Channel vertices) for each ownership, even when they have the same `youtubeId`.

**Status: ✅ All Global Access Patterns Fixed (2025-01-XX)**

A comprehensive audit was conducted across the entire ytorganizer codebase. All global access patterns have been eliminated. The following files were fixed:
1. `addVideosToCustomPlaylist.hjson` - Video ownership verification
2. `createCustomPlaylist.hjson` - Atomic playlist creation with ownership
3. `processPlaylistQueue.hjson` - Video MERGE, VideoSetting, and PlaylistSetting relationships
4. `addVideoToPlaylist.hjson` - Playlist and video ownership verification
5. `savePlaylist.hjson` - Playlist and channel ownership-specific creation
6. `saveChannel.hjson` - Channel ownership-specific creation
7. `getChannelContents.hjson` - Channel ownership verification
8. `deleteVideo.hjson` - Fixed relationship deletion timing and ownership-scoped orphan check using elementId
9. `deletePlaylist.hjson` - Fixed global playlist search using elementId to track specific instances
10. `deleteChannel.hjson` - Fixed global channel search using elementId to track specific instances
11. `getQueueJobs.hjson` - Fixed global channel/playlist lookups, now uses composite keys with ownership verification
12. `retryPlaylist.hjson` - Fixed global channel/playlist access when finding channel for retry
13. `getPlaylistsWithVideoCount.hjson` - Added defensive channel ownership verification

**Why This Matters:**
- Complete data isolation between different YouTube accounts
- Prevents cross-ownership data access vulnerabilities (security-critical)
- Allows ownership-specific metadata and settings
- Ensures ownership deletion doesn't affect other ownerships' data
- No possibility of accidentally accessing another user's resources

**The Golden Rule:**

> **NEVER access channels, playlists, or videos globally. ALWAYS verify ownership first.**

**Creating Ownership-Specific Resources:**

❌ **WRONG - Global Resource Access:**
```javascript
// BAD: Accesses global video - SECURITY VULNERABILITY
MATCH (v:Video {youtubeId: $videoId})
RETURN v

// BAD: Creates global playlist - can be accessed by any ownership
MERGE (p:Playlist {youtubeId: $playlistId})
ON CREATE SET p.title = $title

// BAD: Global channel access
MATCH (c:Channel {youtubeId: $channelId})
RETURN c
```

✅ **CORRECT - Ownership-First Access:**
```javascript
// GOOD: Verifies video ownership before access
MATCH (o:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipVideo]->(v:Video {youtubeId: $videoId})
RETURN v

// GOOD: Creates ownership-specific playlist instance
MATCH (o:YouTubeOwnership {key: $ownershipId})
MERGE (o)-[:YouTubeOwnershipPlaylist]->(p:Playlist {youtubeId: $playlistId})
ON CREATE SET
  p.key = $key,
  p.title = $title,
  p.createdAt = datetime()

// GOOD: Verifies channel ownership
MATCH (o:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipChannel]->(c:Channel {youtubeId: $channelId})
RETURN c
```

**Ownership-Specific Resource Patterns:**

All resources must use ownership-scoped MERGE/MATCH:

- **Videos**: `MERGE (o)-[:YouTubeOwnershipVideo]->(v:Video {youtubeId: $videoId})`
  - Key format: `video_${videoId}_${ownershipId}`
- **Playlists**: `MERGE (o)-[:YouTubeOwnershipPlaylist]->(p:Playlist {youtubeId: $playlistId})`
  - Key format: `playlist_${playlistId}_${ownershipId}`
- **Channels**: `MERGE (o)-[:YouTubeOwnershipChannel]->(c:Channel {youtubeId: $channelId})`
  - Key format: `channel_${channelId}_${ownershipId}`

**Key Points:**
- The `MERGE` on the relationship ensures ownership-scoped lookup
- Multiple ownerships can have separate instances with the same `youtubeId`
- Each instance stores its own metadata (title, description, etc.)
- Deleting an ownership only removes its resource instances, not others
- **Resource keys must include ownershipId** to ensure uniqueness

**Complete Examples:**

```javascript
// Example 1: Creating ownership-specific playlist (savePlaylist.hjson)
MATCH (o:YouTubeOwnership {key: $ownershipId})
MERGE (o)-[:YouTubeOwnershipPlaylist]->(p:Playlist {youtubeId: $playlistId})
ON CREATE SET
  p.key = $key,  // playlist_${playlistId}_${ownershipId}
  p.youtubeId = $playlistId,
  p.createdAt = datetime()
SET
  p.title = $title,
  p.description = $description,
  p.updatedAt = datetime()
RETURN p
```

```javascript
// Example 2: Creating ownership-specific video (processPlaylistQueue.hjson)
MATCH (o:YouTubeOwnership {key: $ownershipId})
MERGE (o)-[:YouTubeOwnershipVideo]->(v:Video {youtubeId: $videoId})
ON CREATE SET
  v.key = $key,  // video_${videoId}_${ownershipId}
  v.createdAt = datetime()
SET
  v.title = $title,
  v.description = $description,
  v.channelId = $channelId,
  v.duration = $duration,
  v.updatedAt = datetime()
```

```javascript
// Example 3: Creating ownership-specific channel (saveChannel.hjson)
MATCH (o:YouTubeOwnership {key: $ownershipId})
MERGE (o)-[:YouTubeOwnershipChannel]->(c:Channel {youtubeId: $channelId})
ON CREATE SET
  c.key = $key,  // channel_${channelId}_${ownershipId}
  c.youtubeId = $channelId,
  c.createdAt = datetime()
SET
  c.title = $title,
  c.description = $description,
  c.subscriberCount = $subscriberCount,
  c.updatedAt = datetime()
```

```javascript
// Example 4: Accessing with ownership verification (addVideoToPlaylist.hjson)
// Both playlist AND video must be verified
MATCH (o:YouTubeOwnership {key: $ownershipId})-[:YouTubeOwnershipPlaylist]->(p:Playlist {youtubeId: $playlistId})
MATCH (o)-[:YouTubeOwnershipVideo]->(v:Video {youtubeId: $videoId})
CREATE (p)-[r:PlaylistVideo {
  position: $position,
  addedAt: datetime()
}]->(v)
```

```javascript
// Example 5: Deleting ownership-specific resources (deleteChannel.hjson, deletePlaylist.hjson, deleteVideo.hjson)
// CRITICAL: Use elementId to track specific instances, avoid global searches

// Step 1: Delete ownership relationship and collect specific node IDs
MATCH (o:YouTubeOwnership {key: $ownershipId})-[ownershipRel:YouTubeOwnershipChannel]->(c:Channel)
WHERE c.youtubeId IN $channelIds

// Collect channel info BEFORE deletion
WITH o, c, ownershipRel, elementId(c) as channelNodeId

// Delete optional ChannelSetting
OPTIONAL MATCH (c)-[:ChannelChannelSetting]->(cs:ChannelSetting)<-[:YouTubeOwnershipChannelSetting]-(o)
DETACH DELETE cs, ownershipRel

// Return the specific channel instance IDs
RETURN collect(DISTINCT channelNodeId) as channelIds

// Step 2: Delete ONLY specific orphaned instances (no global search)
MATCH (c:Channel)
WHERE elementId(c) IN $channelNodeIds  // Use collected IDs, not youtubeId!

// Check if THIS instance is orphaned
OPTIONAL MATCH (anyO:YouTubeOwnership)-[:YouTubeOwnershipChannel]->(c)
WITH c, count(anyO) as ownershipCount
WHERE ownershipCount = 0

DETACH DELETE c
```

```javascript
// Example 6: Batch fetching with ownership verification (getQueueJobs.hjson)
// CRITICAL: When fetching multiple resources, must verify ownership for each
// Jobs store both youtubeId AND ownershipId - must match both!

// Step 1: Collect ownership-specific requests
const channelRequests = [];  // Array of {ownershipId, channelId}
for (const job of jobs) {
  if (job.data.channelId && job.data.ownershipId) {
    channelRequests.push({
      ownershipId: job.data.ownershipId,
      channelId: job.data.channelId
    });
  }
}

// Step 2: Batch fetch with ownership verification using UNWIND
const channelResult = await args.session.run(
  `UNWIND $channelRequests AS req
   MATCH (o:YouTubeOwnership {key: req.ownershipId})-[:YouTubeOwnershipChannel]->(c:Channel {youtubeId: req.channelId})
   RETURN req.ownershipId as ownershipId, c`,
  { channelRequests }
);

// Step 3: Store in map with composite key "ownershipId:channelId"
const channelNameMap = {};
for (const record of channelResult.records) {
  const ownershipId = record.get('ownershipId');
  const channel = args.convertNodeToJson(record.get('c'));
  const key = `${ownershipId}:${channel.P.youtubeId}`;
  channelNameMap[key] = channel.P.title;
}

// Step 4: Lookup using composite key
const channelKey = `${job.data.ownershipId}:${job.data.channelId}`;
const channelName = channelNameMap[channelKey] || null;
```

**Verification Checklist:**

Before deploying any new function, verify:
- ✅ No `MATCH (v:Video {youtubeId:` patterns (must include ownership)
- ✅ No `MATCH (p:Playlist {youtubeId:` patterns (must include ownership)
- ✅ No `MATCH (c:Channel {youtubeId:` patterns (must include ownership)
- ✅ No `MERGE (v:Video {youtubeId:` patterns (must use relationship MERGE)
- ✅ No `MERGE (p:Playlist {youtubeId:` patterns (must use relationship MERGE)
- ✅ No `MERGE (c:Channel {youtubeId:` patterns (must use relationship MERGE)
- ✅ All resource keys include `${ownershipId}` suffix
- ✅ All queries start with `MATCH (o:YouTubeOwnership {key: $ownershipId})`

### API Integration
- Cache API responses to minimize requests
- Handle API rate limits gracefully
- Provide offline fallbacks where possible
- Implement proper error handling
- Use dynamic imports for external libraries in server functions
- **Use contextData for data passing**: Pass data to server functions via `args.executeNamedServerFunction` contextData parameter

#### Component Integration Examples
```javascript
// RECOMMENDED: Use executeYTOFunction wrapper (automatically includes ownershipId)
// In YTOAddChannelButton - calling saveChannel server function:
const result = await args.fns.executeYTOFunction('saveChannel', {
  url: channelUrl,
  name: customName
  // ownershipId automatically injected by wrapper
});

// In YTOAddPlaylistButton - calling savePlaylist server function:
const result = await args.fns.executeYTOFunction('savePlaylist', {
  url: playlistUrl,
  name: customName
  // ownershipId automatically injected by wrapper
});

// ALTERNATIVE: Direct call (must manually include ownershipId)
const result = await args.executeNamedServerFunction({
  functionName: "saveChannel",
  contextData: {
    url: channelUrl,
    name: customName,
    ownershipId: selectedOwnershipId  // Must include manually
  }
});

// Navigate to page with query parameters:
args.navigate('/channel-detail', {
  search: '?channelId=UCxyz123'
});
```

#### Server Function Access Pattern
```javascript
// In server functions - accessing contextData with ownership validation:
try {
  // Extract data from contextData
  const { url, name, ownershipId } = args.contextData;

  // Validate ownershipId is provided
  if (!ownershipId) {
    throw new Error("YouTube Ownership ID is required. Please select a YouTube account.");
  }

  // Authenticate user
  const user = await args.getUserFromSession();
  if (!user) {
    throw new Error("User session not found. Please log in and try again.");
  }

  // Verify ownership belongs to user
  const ownershipCheck = await args.session.run(`
    MATCH (u:User {uuid: $userUuid})-[:UserYouTubeOwnership]->(o:YouTubeOwnership {key: $ownershipId})
    RETURN o
  `, {
    userUuid: user.P.uuid,
    ownershipId
  });

  if (ownershipCheck.records.length === 0) {
    throw new Error("YouTube ownership not found or access denied");
  }

  const ownership = args.convertNodeToJson(ownershipCheck.records[0].get('o'));

  // Perform operation with validated ownership
  const result = await args.session.run(`
    MATCH (o:YouTubeOwnership {key: $ownershipId})
    // ... your query here
    RETURN result
  `, { ownershipId });

  return {
    success: true,
    message: "Operation completed successfully",
    data: {
      ownershipId: ownership.P.key,
      channelName: ownership.P.channelName
    }
  };

} catch (error) {
  console.error("Error in server function:", error);

  return {
    success: false,
    message: error.message || "Operation failed",
    error: {
      type: error.name || "ServerError",
      details: error.message
    }
  };
}
```


#### saveChannel Function Implementation (Recommended)

The `saveChannel` function provides a complete user-centric channel management solution. Videos are accessible through playlists only:

```javascript
// saveChannel.hjson function body:
const YOUTUBE_API_KEY = 'AIzaSyC_CClo37bSKqLUFNKEsDaZgYzTxEQfuds';

/**
 * Extract channel ID or identifier from various YouTube URL formats
 * Supports: /channel/ID, /@handle, /c/custom, /user/username
 */
const extractChannelId = (url) => {
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,  // Channel ID format
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,          // Handle format
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,        // Custom URL format
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/      // User format
  ];
  // Pattern matching logic...
};

/**
 * Fetch complete channel data from YouTube Data API v3
 * Includes: channel info and all playlists
 */
const fetchChannelData = async (channelIdentifier) => {
  const { google } = await import('googleapis');
  const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

  // Resolve channel identifier to actual channel ID
  let channelId = channelIdentifier;
  if (channelIdentifier.startsWith('@') || !channelIdentifier.startsWith('UC')) {
    // Search for channel by handle or custom URL
    const searchResponse = await youtube.search.list({
      part: ['snippet'], q: channelIdentifier, type: ['channel'], maxResults: 1
    });
    channelId = searchResponse.data.items[0].snippet.channelId;
  }

  // Fetch channel details with comprehensive information
  const channelResponse = await youtube.channels.list({
    part: ['snippet', 'contentDetails', 'statistics', 'brandingSettings'],
    id: [channelId]
  });

  const channel = channelResponse.data.items[0];

  // Fetch ALL channel playlists with pagination (no limit)
  let allPlaylists = [];
  let nextPageToken = null;
  do {
    const playlistsResponse = await youtube.playlists.list({
      part: ['snippet', 'contentDetails', 'status'],
      channelId: channelId, maxResults: 50, pageToken: nextPageToken
    });
    allPlaylists = allPlaylists.concat(playlistsResponse.data.items || []);
    nextPageToken = playlistsResponse.data.nextPageToken;
  } while (nextPageToken);

  // Add the special "uploads playlist" (contains ALL channel videos)
  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  if (uploadsPlaylistId) {
    const uploadsPlaylist = {
      id: uploadsPlaylistId,
      snippet: {
        title: 'All Uploads',
        description: 'All videos uploaded by this channel',
        channelId: channelId,
        channelTitle: channel.snippet.title,
        thumbnails: channel.snippet.thumbnails,
        publishedAt: channel.snippet.publishedAt
      },
      status: { privacyStatus: 'public' },
      contentDetails: { itemCount: channel.statistics?.videoCount || 0 }
    };
    allPlaylists.unshift(uploadsPlaylist);
  }

  return { channel, playlists: allPlaylists };
};

try {
  const { url, name } = args.contextData;

  // Authenticate user
  const user = await args.getUserFromSession();
  if (!user) throw new Error("User session not found");

  // Extract and validate channel identifier
  const channelIdentifier = extractChannelId(url);
  if (!channelIdentifier) throw new Error("Invalid YouTube channel URL");

  // Fetch complete channel data
  const channelData = await fetchChannelData(channelIdentifier);

  // STEP 1: Create or update the main Channel vertex
  await args.session.run(\`
    MERGE (c:Channel {youtubeId: $channelId})
    ON CREATE SET c.key = $key, c.createdAt = datetime()
    SET c.title = $title, c.description = $description,
        c.thumbnail = $thumbnail, c.customUrl = $customUrl,
        c.country = $country, c.videoCount = $videoCount,
        c.viewCount = $viewCount, c.subscriberCount = $subscriberCount,
        c.uploadsPlaylistId = $uploadsPlaylistId,
        c.publishedAt = datetime($publishedAt), c.updatedAt = datetime()
  \`, { /* channel properties including uploadsPlaylistId */ });

  // STEP 2: Create ownership -> channel relationship
  await args.session.run(\`
    MATCH (o:YouTubeOwnership {key: $ownershipId})
    MATCH (c:Channel {youtubeId: $channelId})
    MERGE (o)-[:YouTubeOwnershipChannel]->(c)
  \`, { ownershipId, channelId });

  // STEP 3: Create optional ChannelSetting if customName provided
  if (customName) {
    await args.session.run(\`
      MATCH (o:YouTubeOwnership {key: $ownershipId})
      MATCH (c:Channel {youtubeId: $channelId})
      MERGE (c)-[:ChannelChannelSetting]->(cs:ChannelSetting {key: $channelSettingKey})
      ON CREATE SET cs.createdAt = datetime()
      MERGE (o)-[:YouTubeOwnershipChannelSetting]->(cs)
      SET cs.customName = $customName, cs.updatedAt = datetime()
    \`, { ownershipId, channelId, channelSettingKey, customName });
  }

  // STEP 4: Process all channel playlists using existing savePlaylist function
  for (const playlist of channelData.playlists) {
    const playlistUrl = \`https://www.youtube.com/playlist?list=\${playlist.id}\`;
    const result = await args.executeNamedServerFunction({
      functionName: "savePlaylist",
      contextData: { url: playlistUrl, name: null }
    });

    // Create Channel -> Playlist relationship
    await args.session.run(\`
      MATCH (c:Channel {youtubeId: $channelId})
      MATCH (p:Playlist {youtubeId: $playlistId})
      MERGE (c)-[:ChannelPlaylist]->(p)
    \`, { channelId, playlistId: playlist.id });
  }

  return {
    success: true,
    message: \`Channel "\${channelData.channel.snippet.title}" added to your collection!\`,
    data: {
      channelId, title: channelData.channel.snippet.title, customName: name,
      totalPlaylists: channelData.playlists.length,
      uploadsPlaylistId: channelData.channel.contentDetails?.relatedPlaylists?.uploads,
      subscriberCount: channelData.channel.statistics?.subscriberCount,
      videoCount: channelData.channel.statistics?.videoCount,
      userId: user.id, userSpecific: true
    }
  };

} catch (error) {
  // Comprehensive error handling for YouTube API issues
  let userMessage = "Failed to save channel. Please try again.";
  if (error.message.includes("Channel not found")) {
    userMessage = "Channel not found. Please check the URL and make sure the channel exists.";
  } else if (error.code === 403) {
    userMessage = "Access denied. The channel may be private or restricted.";
  } else if (error.message.includes("quota")) {
    userMessage = "YouTube API quota exceeded. Please try again later.";
  }
  return { success: false, message: userMessage, error: { /* error details */ } };
}
```

**Key Database Structure Features:**
- **Complete Channel Coverage**: Fetches ALL playlists from the channel
- **User Authentication**: Uses `args.getUserFromSession()` for secure user identification
- **Comprehensive Relationships**:
  - `(YouTubeOwnership)-[:YouTubeOwnershipChannel]->(Channel)` - Direct ownership
  - `(Channel)-[:ChannelChannelSetting]->(ChannelSetting)` - Optional settings
  - `(YouTubeOwnership)-[:YouTubeOwnershipChannelSetting]->(ChannelSetting)` - Ownership-specific settings
  - `(Channel)-[:ChannelPlaylist]->(Playlist)` for all channel playlists
  - Videos accessible through playlists only (no direct Channel->Video relationships)
- **Uploads Playlist ID**: Stores `uploadsPlaylistId` in Channel node for accessing all channel videos
- **Optional Settings**: ChannelSetting created only when user provides custom name or preferences
- **URL Format Support**: Handles /@handle, /channel/ID, /c/custom, /user/username formats
- **Unlimited Pagination**: Fetches ALL content without artificial limits
- **Reuses Existing Functions**: Leverages savePlaylist function for playlist processing
- **Data Separation**: Global YouTube data separate from user preferences
- **Error Handling**: Comprehensive YouTube API error management

**Component Integration:**
```javascript
// In YTOAddChannelButton component:
const result = await args.executeNamedServerFunction({
  functionName: "saveChannel",
  contextData: { url: channelUrl, name: customName }
});
```

#### savePlaylist Function Implementation (Recommended)

The `savePlaylist` function provides a complete user-centric playlist management solution with proper database structure:

```javascript
// savePlaylist.hjson function body:
const YOUTUBE_API_KEY = 'AIzaSyC_CClo37bSKqLUFNKEsDaZgYzTxEQfuds';

// Extract playlist ID from various URL formats
const extractPlaylistId = (url) => {
  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]+)/,  // ?list=ID or &list=ID
    /playlist\?list=([a-zA-Z0-9_-]+)/ // Direct playlist URL
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

try {
  const { url, name } = args.contextData;

  // Authenticate user
  const user = await args.getUserFromSession();
  if (!user) {
    throw new Error("User session not found. Please log in and try again.");
  }

  // Extract and validate playlist ID
  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    throw new Error("Invalid YouTube playlist URL. Please provide a valid playlist URL.");
  }

  // Fetch from YouTube API
  const { google } = await import('googleapis');
  const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

  // Get playlist details
  const playlistResponse = await youtube.playlists.list({
    part: ['snippet', 'contentDetails', 'status'],
    id: [playlistId]
  });

  // Fetch all videos with pagination
  let allVideos = [];
  let nextPageToken = null;
  do {
    const itemsResponse = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: playlistId,
      maxResults: 50,
      pageToken: nextPageToken
    });
    allVideos = allVideos.concat(itemsResponse.data.items || []);
    nextPageToken = itemsResponse.data.nextPageToken;
  } while (nextPageToken);

  // Create/update Playlist vertex (global YouTube data)
  await args.session.run(\`
    MERGE (p:Playlist {youtubeId: $playlistId})
    ON CREATE SET p.key = $key, p.createdAt = datetime()
    SET p.title = $title, p.description = $description,
        p.thumbnail = $thumbnail, p.channelTitle = $channelTitle,
        p.channelId = $channelId, p.privacyStatus = $privacyStatus,
        p.itemCount = $itemCount, p.updatedAt = datetime()
  \`, {
    playlistId,
    key: \`playlist_\${playlistId}\`,
    title: playlistData.snippet.title,
    description: playlistData.snippet.description,
    thumbnail: playlistData.snippet.thumbnails?.high?.url,
    channelTitle: playlistData.snippet.channelTitle,
    channelId: playlistData.snippet.channelId,
    privacyStatus: playlistData.status?.privacyStatus,
    itemCount: playlistData.contentDetails?.itemCount
  });

  // Create ownership -> playlist relationship
  await args.session.run(\`
    MATCH (o:YouTubeOwnership {key: $ownershipId})
    MATCH (p:Playlist {youtubeId: $playlistId})
    MERGE (o)-[:YouTubeOwnershipPlaylist]->(p)
  \`, { ownershipId, playlistId });

  // Create optional PlaylistSetting if customName or preferences provided
  if (customName || customOrder) {
    await args.session.run(\`
      MATCH (o:YouTubeOwnership {key: $ownershipId})
      MATCH (p:Playlist {youtubeId: $playlistId})
      MERGE (p)-[:PlaylistPlaylistSetting]->(ps:PlaylistSetting {key: $playlistSettingKey})
      ON CREATE SET ps.createdAt = datetime()
      MERGE (o)-[:YouTubeOwnershipPlaylistSetting]->(ps)
      SET ps.customName = $customName, ps.customOrder = $customOrder,
          ps.sortBy = 'index', ps.displayPreferences = {
            showThumbnails: true, viewMode: 'list'
          }, ps.updatedAt = datetime()
    \`, {
      ownershipId,
      playlistId,
      playlistSettingKey: \`playlist_setting_\${playlistId}_\${ownershipId}\`,
      customName,
      customOrder: allVideos.map(v => v.contentDetails.videoId)
    });
  }

  // Process each video
  for (const video of allVideos) {
    // Create/update Video vertex (global YouTube data)
    await args.session.run(\`
      MERGE (v:Video {youtubeId: $videoId})
      ON CREATE SET v.key = $key, v.createdAt = datetime()
      SET v.title = $title, v.description = $description,
          v.thumbnail = $thumbnail, v.channelTitle = $channelTitle,
          v.channelId = $channelId, v.updatedAt = datetime()
    \`, {
      videoId: video.contentDetails.videoId,
      key: \`video_\${video.contentDetails.videoId}\`,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails?.high?.url,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId
    });

    // Create Playlist -> Video relationship (global playlist membership with position)
    await args.session.run(\`
      MATCH (p:Playlist {youtubeId: $playlistId})
      MATCH (v:Video {youtubeId: $videoId})
      MERGE (p)-[r:PlaylistVideo]->(v)
      ON CREATE SET r.createdAt = datetime(), r.position = $position, r.playlistIndex = $position
      SET r.updatedAt = datetime()
    \`, {
      playlistId,
      videoId: video.contentDetails.videoId,
      position: video.snippet.position
    });

    // NOTE: VideoSetting is NOT created here - it's created on-demand when user performs actions
    // (e.g., add note, mark favorite, mark watched)
  }

  return {
    success: true,
    message: \`Playlist "\${playlistData.snippet.title}" added to your collection!\`,
    data: {
      playlistId,
      title: playlistData.snippet.title,
      customName: name,
      totalVideos: allVideos.length,
      userId: user.id,
      userSpecific: true
    }
  };

} catch (error) {
  // Comprehensive error handling for YouTube API issues
  let userMessage = "Failed to save playlist. Please try again.";
  if (error.message.includes("Playlist not found")) {
    userMessage = "Playlist not found. Please check the URL and make sure the playlist is public.";
  } else if (error.code === 403) {
    userMessage = "Access denied. The playlist may be private or restricted.";
  } else if (error.message.includes("quota")) {
    userMessage = "YouTube API quota exceeded. Please try again later.";
  }

  return {
    success: false,
    message: userMessage,
    error: {
      type: "YouTubeAPIError",
      details: error.message,
      code: error.code
    }
  };
}
```

**Key Database Structure Features:**
- **User Authentication**: Uses `args.getUserFromSession()` for secure user identification
- **Proper Relationships**:
  - `(YouTubeOwnership)-[:YouTubeOwnershipPlaylist]->(Playlist)` - Direct ownership
  - `(Playlist)-[:PlaylistPlaylistSetting]->(PlaylistSetting)` - Optional settings
  - `(YouTubeOwnership)-[:YouTubeOwnershipPlaylistSetting]->(PlaylistSetting)` - Ownership-specific settings
- **Global Playlist Membership**: Uses `(Playlist)-[:PlaylistVideo]->(Video)` relationships with position stored on edge
- **On-Demand Settings**: PlaylistSetting created only when user provides custom name or preferences
- **On-Demand Video Settings**: VideoSetting NOT created during playlist save - created later when user performs actions (add note, favorite, mark watched)
- **Data Separation**: Global YouTube data separate from user preferences
- **Global Videos**: All videos in a playlist are visible across all ownerships (no per-ownership video membership)

**Component Integration:**
```javascript
// In YTOAddPlaylistButton component:
const result = await args.executeNamedServerFunction({
  functionName: "savePlaylist",
  contextData: { url: playlistUrl, name: customName }
});
```

#### Helper Functions for Data Retrieval

The system provides reusable helper functions for fetching channels and playlists with video counts:

**getChannelsWithVideoCount** - Fetches channels with user-specific video counts:
```javascript
// Basic usage - get all user's channels
const result = await args.executeNamedServerFunction({
  functionName: "getChannelsWithVideoCount",
  contextData: {
    userUuid: user.P.uuid
  }
});

// Filter by specific channel IDs
const result = await args.executeNamedServerFunction({
  functionName: "getChannelsWithVideoCount",
  contextData: {
    userUuid: user.P.uuid,
    channelIds: ['UCxxxxx', 'UCyyyyy']
  }
});

// Filter by status
const result = await args.executeNamedServerFunction({
  functionName: "getChannelsWithVideoCount",
  contextData: {
    userUuid: user.P.uuid,
    statusFilter: ['queued', 'processing']
  }
});

// Custom ordering
const result = await args.executeNamedServerFunction({
  functionName: "getChannelsWithVideoCount",
  contextData: {
    userUuid: user.P.uuid,
    orderBy: 'c.subscriberCount',  // Order by subscriber count
    orderDirection: 'DESC'
  }
});
```

**Available orderBy fields for channels:**
- `cs.createdAt`, `cs.updatedAt` - Channel setting timestamps
- `c.title`, `c.publishedAt` - Channel metadata
- `c.videoCount`, `c.subscriberCount`, `c.viewCount` - Channel statistics
- `videoCount` - User-specific video count

**getPlaylistsWithVideoCount** - Fetches playlists with user-specific video counts:
```javascript
// Basic usage - get all user's playlists
const result = await args.executeNamedServerFunction({
  functionName: "getPlaylistsWithVideoCount",
  contextData: {
    userUuid: user.P.uuid
  }
});

// Filter by specific playlist IDs
const result = await args.executeNamedServerFunction({
  functionName: "getPlaylistsWithVideoCount",
  contextData: {
    userUuid: user.P.uuid,
    playlistIds: ['PLxxxxx', 'PLyyyyy']
  }
});

// Filter by status with custom ordering
const result = await args.executeNamedServerFunction({
  functionName: "getPlaylistsWithVideoCount",
  contextData: {
    userUuid: user.P.uuid,
    statusFilter: ['completed'],
    orderBy: 'videoCount',  // Order by video count
    orderDirection: 'DESC'
  }
});
```

**Available orderBy fields for playlists:**
- `ps.createdAt`, `ps.updatedAt`, `ps.lastUpdated` - Playlist setting timestamps
- `p.title`, `p.publishedAt` - Playlist metadata
- `p.itemCount` - Playlist item count
- `videoCount` - User-specific video count

**Return Format:**
Both functions return data in vertex format:
```javascript
{
  success: true,
  data: [
    {
      channel: Vertex,           // Channel vertex
      channelSetting: Vertex     // ChannelSetting vertex with videoCount in P
    }
    // or for playlists:
    {
      playlist: Vertex,          // Playlist vertex
      playlistSetting: Vertex,   // PlaylistSetting vertex with videoCount in P
      channel: Vertex | null     // Parent channel if exists
    }
  ]
}
```

### State Management
- Use reactive stores for UI state
- Implement optimistic updates
- Cache user preferences
- Handle concurrent updates

### Performance
- Lazy load images and content
- Implement virtual scrolling for long lists
- Optimize bundle size
- Use proper loading states

## API Configuration

### YouTube OAuth 2.0 Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/youtube/callback`
   - Scopes: `https://www.googleapis.com/auth/youtube.readonly`
5. Configure environment variables:
   ```bash
   TOKEN_ENCRYPTION_KEY=your_32_byte_encryption_key
   ```

### YouTube Branding Compliance

The system complies with YouTube's branding guidelines:

**Requirements:**
- Display "Powered by YouTube API Services" attribution
- YouTube logo must link to youtube.com
- Proper attribution on pages using YouTube data
- Links to YouTube ToS and Google Privacy Policy

**Implementation:**
- `YouTubeAttribution` component on Privacy and Terms pages
- Clickable YouTube logo linking to YouTube.com
- Required disclosures in Privacy Policy
- Terms of Service with YouTube API Services section

### Legal Pages

**Privacy Policy (Privacy):**
- YouTube API Services disclosures
- Data collection and usage policies
- Third-party service integrations
- User rights and data control
- Links to YouTube ToS and Google Privacy Policy

**Terms of Service (Terms):**
- Service description and features
- YouTube API Services usage terms
- User responsibilities and acceptable use
- Intellectual property rights
- Account termination policies
- Disclaimers and limitations
- Contact information

Both pages include:
- YouTube branding compliance footer
- Navigation links to related policies
- Mobile-responsive design
- Accessible formatting

## Dependencies

The system dynamically imports and uses the following npm packages in server functions:
- `googleapis`: Google's official Node.js client library for accessing Google APIs (YouTube)

### Installation (if not already installed)
```bash
npm install googleapis --force
```

## Future Enhancements

### Core Features
- Offline functionality with service workers
- Push notifications for new videos
- Advanced filtering and search
- Video playback integration
- Export/import functionality
- Social sharing features
- Watch history tracking
- Collaborative playlists
- Video recommendations

### OAuth & API Enhancements
- OAuth scope expansion for additional YouTube features
- API quota optimization and caching strategies
- Batch API operations to reduce quota usage
- Background sync for channel/playlist updates
- Quota alerts via email/notifications
- Admin dashboard for quota monitoring across all users
- API usage analytics and reporting

### Security & Compliance
- Regular security audits of token storage
- Compliance monitoring for YouTube ToS changes
- Automated branding guidelines verification
- GDPR compliance features
- Data export/portability tools

This documentation serves as the foundation for implementing the YSaar system and should be referenced for all development decisions and future enhancements.

## Recent Updates

### Version 4.0 - Simplified Schema Architecture (Current)
- 🚧 **Direct Ownership Relationships**: Changed from `(YouTubeOwnership)-[:YouTubeOwnershipChannelSetting]->(ChannelSetting)-[:ChannelSettingChannel]->(Channel)` to `(YouTubeOwnership)-[:YouTubeOwnershipChannel]->(Channel)`
- 🚧 **Optional Settings**: Settings (ChannelSetting, PlaylistSetting, VideoSetting) are now optional end nodes created only when user performs specific actions
- 🚧 **Settings Architecture**:
  - `(Channel)-[:ChannelChannelSetting]->(ChannelSetting)` - Settings attach to main entities
  - `(YouTubeOwnership)-[:YouTubeOwnershipChannelSetting]->(ChannelSetting)` - Ownership can link for per-owner overrides
- 🚧 **Global Playlist Membership**: Changed from per-ownership `(PlaylistSetting)-[:PlaylistSettingVideo]->(Video)` to global `(Playlist)-[:PlaylistVideo]->(Video)`
- 🚧 **Video Settings On-Demand**: VideoSetting nodes created only when user adds notes, favorites, or marks watched (not during playlist/channel save)
- 🚧 **Simplified Queries**: Cleaner query patterns with direct ownership relationships
- 🚧 **Migration Required**: Existing data requires migration from v3.x to v4.0 schema
- 🚧 **Breaking Changes**: All server functions updated for new relationship patterns
- 🚧 **Key Benefits**:
  - Reduced database complexity (fewer intermediate nodes)
  - Improved query performance (fewer relationship hops)
  - More intuitive schema structure
  - Settings created only when needed (storage optimization)
  - Global playlist content visibility across ownerships

### Version 3.3 - Video Queue Persistence
- ✅ **Database-Backed Queue**: Video player queue now persists in database
- ✅ **VideoQueue Vertex**: New graph node for storing queue entries
- ✅ **Per-Ownership Queues**: Each YouTube account has independent queue
- ✅ **Queue Functions**: Six server functions for queue management
  - `loadVideoQueue` - Load queue from database
  - `saveVideoQueue` - Save entire queue (bulk operation)
  - `addVideoToQueue` - Add single video with duplicate checking
  - `removeVideoFromQueue` - Remove video and reorder positions
  - `clearVideoQueue` - Clear entire queue
  - `reorderVideoQueue` - Change video position in queue with automatic reordering
- ✅ **Queue Reordering UI**: Move up/down buttons in Queue Modal for easy reordering
- ✅ **Optimistic Updates**: Instant UI feedback with database sync
- ✅ **Auto-Reload**: Queue loads on page refresh and ownership switch
- ✅ **Error Handling**: Rollback on database errors with toast notifications
- ✅ **Session Persistence**: Queue survives browser restarts

### Version 3.2 - Corrected Schema Architecture (DEPRECATED in v4.0)
- ✅ **Per-Ownership Playlist Membership**: Changed from global `(Playlist)-[:PlaylistVideo]->(Video)` to per-ownership `(PlaylistSetting)-[:PlaylistSettingVideo]->(Video)` (Reverted in v4.0)
- ✅ **Global Video Setting**: VideoSetting remain at ownership level for global properties (watched, notes, favourites)
- ✅ **Independent Playlist Management**: Videos can be removed from individual playlists without affecting other playlists
- ✅ **Position on Relationship**: Video position/playlistIndex stored on `PlaylistSettingVideo` relationship edge (Changed to `PlaylistVideo` in v4.0)
- ✅ **Simplified Frontend**: No `playlistId` required for video settings operations (notes, favourites, watched status)
- ✅ **Updated Delete Operations**: Enhanced deleteVideo, deletePlaylist functions with proper orphan cleanup
- ✅ **Updated Query Functions**: Modified getVideosWithDetails, getChannelsWithVideoCount, getPlaylistsWithVideoCount for new schema
- ✅ **Updated Helper Functions**: Modified addVideoToPlaylist, saveNote, toggleFavourite, updateVideoSetting
- ✅ **Better UX**: Marking video as "watched" or adding notes applies globally across all playlists
- ⚠️ **Note**: This version was superseded by v4.0 which simplified the schema further

### Version 3.1 - Shared Quota Architecture
- ✅ **Shared Quota Pool**: Changed from per-ownership to shared 10,000 units/day across all users
- ✅ **Priority-Based Reservations**: Quota reservation system with priority levels (1-10)
- ✅ **Real-Time Quota Monitoring**: Admin dashboard for monitoring shared quota consumption
- ✅ **Per-Ownership Tracking**: Individual usage tracked by ownership for accountability
- ✅ **Background Monitoring**: BullMQ worker monitors quota levels every 5 minutes
- ✅ **Email Alerts**: Automatic alerts at 80%, 95%, and 100% quota thresholds
- ✅ **QuotaMonitor Page**: Admin page at `/yto/admin/quota-monitor` with live stats
- ✅ **Updated API Functions**: Migrated from per-user to shared quota functions
- ✅ **Quota Reservation System**: Reserve/release quota to prevent race conditions
- ✅ **Usage Breakdown**: View quota consumption by ownership in admin panel
- ✅ **Auto-Expiry**: Reservations auto-expire after 5 minutes with quota auto-release
- ✅ **Shared Functions in Args**: Added to executeNamedServerFunctionCore args object

### Version 3.0 - Multi-Ownership Support
- ✅ **Multi-Account Support**: Users can connect multiple YouTube accounts to one application account
- ✅ **YouTubeOwnership Node**: New graph structure for managing multiple accounts per user
- ✅ **Ownership Selector**: Dropdown UI to switch between connected YouTube accounts
- ✅ **Centralized Architecture**: Layout manages ownership state globally
- ✅ **executeYTOFunction Wrapper**: Automatically injects ownershipId into all server function calls
- ✅ **Updated All Server Functions**: Refactored 69+ backend functions for ownership-based relationships
- ✅ **Per-Ownership Setting**: Each account maintains separate channel, playlist, and video preferences
- ✅ **Session Persistence**: Selected ownership persists across page reloads
- ✅ **Zero Page Updates**: All frontend pages automatically compatible through wrapper architecture
- ✅ **Graph Schema Migration**: From User→Setting to User→YouTubeOwnership→Setting relationships
- ✅ **Token Isolation**: Each ownership has independent OAuth tokens

### Version 2.0 - OAuth & API Usage Monitoring
- ✅ Implemented per-user OAuth 2.0 authentication
- ✅ Added API usage tracking and monitoring
- ✅ Created comprehensive Privacy Policy page
- ✅ Created Terms of Service page
- ✅ Implemented YouTube branding compliance
- ✅ Added visual quota usage display in Settings
- ✅ Encrypted token storage with AES-256-GCM
- ✅ Automatic token refresh functionality
- ✅ User feedback system

### Version 1.0 - Initial Release
- ✅ Channel and playlist management
- ✅ Video organization
- ✅ Mobile-first design
- ✅ Bottom navigation
- ✅ Multi-language support (en, hi, gu)
- ✅ Accessibility features

TODO:
TODO: In chrome extension remove open in YSaar button, Instead of bottom it should be next to channel, playlist and video. When user add video he have to select/create a playlist first and it will be added to that playlist.
TODO: Even if the video is playing on parent Tab show playing on playlist.
TODO: Make sure adding/editing Note for channel,playlist and video is working properly in youtube page (modify chrome extension).







Letter tasks (future):
Tell Sonet what should I do if I want global channel multiple users can see? & implement it.
Save just openExtension url when URL changes it just redirect to Home API & add a proper URL. Note is working properly.
On Home page user can add Testimonial section, users eye happy & cut directly.
Add change icons, make users be full screen satisfied.