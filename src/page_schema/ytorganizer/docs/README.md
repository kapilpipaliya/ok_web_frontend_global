# YouTube Organizer (YTO)

A mobile-first YouTube channel and playlist management system built with accessibility in mind. This system allows users to organize their favorite YouTube channels and playlists with an intuitive interface optimized for mobile usage and screen readers.

## Overview

YouTube Organizer is a comprehensive page schema implementation that provides:

- **Channel Management**: Add, organize, and browse YouTube channels
- **Playlist Management**: Create and manage custom playlists
- **Video Organization**: View videos from channels and playlists
- **OAuth 2.0 Authentication**: Secure per-user YouTube API access with 10,000 units/day quota per user
- **API Usage Monitoring**: Real-time tracking of YouTube API quota consumption with visual indicators
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interfaces
- **Accessibility**: Screen reader friendly with proper ARIA labels and semantic HTML
- **Bottom Navigation**: Easy navigation between main sections
- **Privacy & Terms**: Comprehensive privacy policy and terms of service compliance
- **YouTube Branding**: Full compliance with YouTube's branding guidelines

## Graph Schema

The system uses the following Neo4j graph relationships:

```
(User)-[:UserChannelSetting]->(ChannelSetting)-[:ChannelSettingChannel]->(Channel)
(User)-[:UserPlaylistSetting]->(PlaylistSetting)-[:PlaylistSettingPlaylist]->(Playlist)
(User)-[:UserVideoSetting]->(VideoSetting)-[:VideoSettingVideo]->(Video)
(User)-[:UserLanguageSetting]->(LanguageSetting {language: "en|hi|gu", isDefault: boolean})
(User)-[:UserFeedback]->(Feedback)
(User)-[:UserYouTubeToken]->(YouTubeToken {accessToken, refreshToken, expiresAt, scope})
(User)-[:UserYouTubeAPIUsage]->(YouTubeAPIUsage {date, totalCost, callCount, operations})
(Channel)-[:ChannelPlaylist]->(Playlist)
(Playlist)-[:PlaylistVideo]->(Video)
```

**Note**: Videos are only accessible through playlists. Channels do not have direct relationships to videos. Each channel stores an `uploadsPlaylistId` property that references the playlist containing all channel uploads.

### OAuth 2.0 Authentication

The system uses per-user OAuth 2.0 authentication for YouTube API access:
- Each user authenticates with their own Google account
- Tokens are securely stored and encrypted in the database
- Each user has their own 10,000 units/day API quota
- Tokens are automatically refreshed when expired

### Vertex Types

- **User**: Existing system user vertex (extended with YTO properties)
- **LanguageSetting**: User's language preferences for translations
  - `language`: Language code ('en' for English, 'hi' for Hindi, 'gu' for Gujarati)
  - `isDefault`: Boolean indicating if this is the user's default language
- **ChannelSetting**: User-specific channel preferences and settings
  - `key`: Unique identifier (`channel_setting_${userId}_${channelId}`)
  - `customName`: User's custom name for the channel
  - `notifications`: Boolean for notification preferences
  - `autoDownload`: Boolean for automatic video downloading
  - `priority`: Channel priority level ('low', 'normal', 'high')
  - `createdAt`, `updatedAt`: Timestamps
- **Channel**: YouTube channel information (fetched via API)
  - `key`: Unique identifier (`channel_${youtubeId}`)
  - `youtubeId`: YouTube channel ID
  - `title`, `description`, `thumbnail`: Basic channel metadata
  - `customUrl`: Channel custom URL handle
  - `country`: Channel's country
  - `videoCount`, `viewCount`, `subscriberCount`: Channel statistics
  - `uploadsPlaylistId`: YouTube playlist ID containing all channel uploads
  - `publishedAt`, `createdAt`, `updatedAt`: Timestamps
- **PlaylistSetting**: User-specific playlist preferences and custom ordering
  - `key`: Unique identifier (`playlist_setting_${userId}_${playlistId}`)
  - `customName`: User's custom name for the playlist
  - `customOrder`: Array of video IDs in user's preferred order
  - `sortBy`: Sort preference ('custom', 'date', 'title', 'index')
  - `displayPreferences`: User's display settings for the playlist (thumbnails, view mode)
  - `lastUpdated`, `createdAt`, `updatedAt`: Timestamps
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
- **VideoSetting**: User-specific video preferences
  - `key`: Unique identifier (`video_setting_${userId}_${videoId}`)
  - `watched`: Boolean indicating if user has watched the video
  - `note`: User's personal notes about the video
  - `isFavourite`: Boolean indicating if video is marked as favorite
  - `customPosition`: User-defined position in custom ordering
  - `addedToPlaylistAt`: When user added this video from a playlist
  - `createdAt`, `updatedAt`: Timestamps
- **Feedback**: User feedback submissions
  - `feedback`: Feedback text (max 1000 characters)
  - `category`: Feedback category ('general', 'bug', 'feature', 'improvement', 'other')
  - `status`: Feedback status (default: 'pending')
  - `createdAt`: Timestamp
- **YouTubeToken**: OAuth 2.0 tokens for YouTube API access
  - `key`: Unique identifier (`youtube_token_${userId}`)
  - `accessToken`: Encrypted OAuth access token
  - `refreshToken`: Encrypted OAuth refresh token
  - `expiresAt`: Token expiration timestamp
  - `scope`: OAuth scope (youtube.readonly)
  - `createdAt`, `updatedAt`: Timestamps
- **YouTubeAPIUsage**: Daily API usage tracking per user
  - `key`: Unique identifier (`api_usage_${userId}_${date}`)
  - `date`: Usage date (YYYY-MM-DD format)
  - `totalCost`: Total API units consumed
  - `callCount`: Number of API calls made
  - `operations`: JSON object tracking operation counts (e.g., {"channels.list": 5, "playlists.list": 10})
  - `createdAt`, `updatedAt`: Timestamps

## Architecture

### Component Structure

All components follow the YTO prefix naming convention:

#### Layout Components
- **YTOLayout**: Main layout with bottom navigation
- **YTOTabBar**: Tab navigation for channel/playlist detail views

#### UI Components
- **YTOFloatingButton**: Basic floating action button component
- **YTOAddChannelButton**: Specialized button with modal for adding YouTube channels
- **YTOAddPlaylistButton**: Specialized button with modal for adding YouTube playlists
- **YTOChannelCard**: Channel display card with thumbnail and info
- **YTOPlaylistCard**: Playlist display card with thumbnail and info
- **YTOVideoCard**: Video display card with thumbnail and metadata
- **YTOYouTubeAttribution**: YouTube branding compliance component with clickable logo
- **YTOButton**: Reusable button component with variants (primary, secondary, danger)
- **YTOPageTitle**: Consistent page title component
- **YTOFeedbackModal**: Modal for collecting user feedback

#### Pages
- **YTOHome**: Dashboard overview of recent activity
- **YTOChannels**: List of user's subscribed channels with add functionality
- **YTOPlaylists**: List of user's playlists with add functionality
- **YTOChannelDetail**: Channel details with videos/playlists tabs
- **YTOPlaylistDetail**: Playlist details with video list
- **YTOSettings**: User settings including YouTube connection, theme, and data management
- **YTOPrivacy**: Privacy policy page with YouTube API Services disclosures
- **YTOTerms**: Terms of Service page with comprehensive legal information

### API Functions

#### YouTube OAuth 2.0 Integration

The system uses per-user OAuth 2.0 authentication for secure YouTube API access:

**OAuth Flow:**
1. User clicks "Connect YouTube Account" in settings
2. Redirected to Google OAuth consent screen
3. User grants read-only access to their YouTube data
4. System receives authorization code and exchanges for tokens
5. Tokens are encrypted and stored in Neo4j database
6. Each API call uses the user's personal OAuth token

**OAuth Endpoints:**
- `/api/auth/youtube/connect` - Initiates OAuth flow
- `/api/auth/youtube/callback` - Handles OAuth callback
- `/api/auth/youtube/disconnect` - Disconnects YouTube account
- `/api/auth/youtube/status` - Checks connection status

**Token Management:**
- Tokens are encrypted using AES-256-GCM encryption
- Refresh tokens are automatically used to obtain new access tokens
- Tokens are stored in `(User)-[:UserYouTubeToken]->(YouTubeToken)` relationship

#### API Usage Monitoring

The system tracks YouTube API quota consumption per user with a 10,000 units/day limit:

**Quota Costs:**
- `search.list`: 100 units (expensive!)
- `channels.list`: 1 unit
- `playlists.list`: 1 unit
- `playlistItems.list`: 1 unit
- `videos.list`: 1 unit

**Usage Tracking:**
- Automatic logging of all API calls with operation type and cost
- Daily quota tracking stored in Neo4j: `(User)-[:UserYouTubeAPIUsage]->(YouTubeAPIUsage)`
- Visual quota display in Settings page with color-coded status:
  - **Good** (green): 0-69% used
  - **Warning** (yellow): 70-89% used
  - **Critical** (red): 90-100% used
- Real-time progress bar and statistics
- Automatic cleanup of records older than 30 days

**API Usage Functions:**
- `logAPIUsage(userUuid, operation, cost, session)` - Log an API call
- `getTodayAPIUsage(userUuid, session)` - Get today's usage statistics
- `getAPIUsageHistory(userUuid, days, session)` - Get historical usage data
- `isApproachingQuotaLimit(userUuid, session, threshold)` - Check if approaching limit

**API Endpoints:**
- `/api/youtube/usage` - Get current user's API usage statistics

#### YouTube Data Integration

The system uses the `googleapis` library dynamically imported in server functions to interact with YouTube Data API v3. All API calls now use per-user OAuth tokens instead of a shared API key.

##### Dynamic Import Pattern
```javascript
// Dynamic import of googleapis library in server functions with OAuth
const { google } = await import('googleapis');

// Get user's OAuth token
const user = await args.getUserFromSession();
const tokenResult = await args.session.run(`
  MATCH (u:User {uuid: $userUuid})-[:UserYouTubeToken]->(token:YouTubeToken)
  RETURN token
`, { userUuid: user.P.uuid });

const token = tokenResult.records[0]?.get('token');
if (!token) {
  throw new Error('YouTube account not connected');
}

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

// Log API usage after each call
await logAPIUsage(user.P.uuid, 'channels.list', 1, args.session);
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
  - Creates VideoSetting for each video: (User)-[:UserVideoSetting]->(VideoSetting)-[:VideoSettingVideo]->(Video)
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

- **YTOTheme**: Custom theme optimized for video content with high contrast for accessibility

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
│   ├── YTOLayout.hjson              # Main layout with bottom nav
│   ├── YTOFloatingButton.hjson      # Basic floating action button
│   ├── YTOAddChannelButton.hjson    # Channel add button with modal
│   ├── YTOAddPlaylistButton.hjson   # Playlist add button with modal
│   ├── YTOChannelCard.hjson         # Channel display card
│   ├── YTOPlaylistCard.hjson        # Playlist display card
│   ├── YTOVideoCard.hjson           # Video display card
│   ├── YTOTabBar.hjson              # Tab navigation component
│   ├── YTOYouTubeAttribution.hjson  # YouTube branding compliance
│   ├── YTOButton.hjson              # Reusable button component
│   ├── YTOPageTitle.hjson           # Page title component
│   └── YTOFeedbackModal.hjson       # User feedback modal
├── pages/
│   ├── YTOHome.hjson                # Dashboard/home page
│   ├── YTOChannels.hjson            # Channels list page
│   ├── YTOPlaylists.hjson           # Playlists list page
│   ├── YTOChannelDetail.hjson       # Channel detail with tabs
│   ├── YTOPlaylistDetail.hjson      # Playlist detail with videos
│   ├── YTOSettings.hjson            # User settings and YouTube connection
│   ├── YTOPrivacy.hjson             # Privacy policy page
│   └── YTOTerms.hjson               # Terms of Service page
├── themes/
│   └── YTOTheme.hjson               # Custom theme for video content
├── functions/
│   ├── savePlaylist.hjson           # Save YouTube playlist with user settings
│   ├── saveChannel.hjson            # Save YouTube channel with all playlists and videos
│   ├── getAPIUsageStats.hjson       # Get user's API usage statistics
│   ├── getChannelsWithVideoCount.hjson  # Get channels with video counts
│   ├── getPlaylistsWithVideoCount.hjson # Get playlists with video counts
│   ├── clearAllUserData.hjson       # Clear all user's YTO data
│   ├── deleteAccount.hjson          # Delete user account
│   └── saveFeedback.hjson           # Save user feedback
└── docs/
    └── README.md                    # This documentation

/src/lib/youtube/
├── youtubeOAuth.ts                  # OAuth 2.0 token management
└── apiUsageTracking.ts              # API quota tracking functions

/src/lib/auth/
└── tokenEncryption.ts               # Token encryption/decryption utilities

/src/routes/api/
├── auth/youtube/
│   ├── connect.ts                   # Initiate OAuth flow
│   ├── callback.ts                  # OAuth callback handler
│   ├── disconnect.ts                # Disconnect YouTube account
│   └── status.ts                    # Check connection status
└── youtube/
    └── usage.ts                     # Get API usage statistics
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

### Custom Video Ordering
1. In playlist view, drag and drop videos to reorder
2. Custom order is saved to PlaylistSetting vertex
3. Switch between sort modes: 'custom', 'date', 'title', 'index' (original YouTube order)
4. Custom order persists across sessions for each user

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

### API Integration
- Cache API responses to minimize requests
- Handle API rate limits gracefully
- Provide offline fallbacks where possible
- Implement proper error handling
- Use dynamic imports for external libraries in server functions
- **Use contextData for data passing**: Pass data to server functions via `args.executeNamedServerFunction` contextData parameter

#### Component Integration Examples
```javascript
// In YTOAddChannelButton - calling saveChannel server function:
const result = await args.executeNamedServerFunction({
  functionName: "saveChannel",
  contextData: { url: channelUrl, name: customName }
});

// In YTOAddPlaylistButton - calling savePlaylist server function:
const result = await args.executeNamedServerFunction({
  functionName: "savePlaylist",
  contextData: { url: playlistUrl, name: customName }
});

// Navigate to page with query parameters:
args.navigate('/channel-detail', {
  search: '?channelId=UCxyz123'
});
```

#### Server Function Access Pattern
```javascript
// In server functions - accessing contextData and session:
try {
  // Extract data from contextData
  const { url, name } = args.contextData;

  // Authenticate user
  const user = await args.getUserFromSession();
  if (!user) {
    throw new Error("User session not found");
  }

  // Access database session
  const result = await args.session.run(
    `MATCH (u:User) WHERE elementId(u) = $userId RETURN u`,
    { userId: user.id }
  );

  return {
    success: true,
    message: "Operation completed successfully",
    data: { userId: user.id }
  };

} catch (error) {
  return {
    success: false,
    message: "Operation failed",
    error: error.message
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

  // STEP 2: Create user-specific ChannelSetting
  await args.session.run(\`
    MATCH (u:User {uuid: $userUuid})
    MATCH (c:Channel {youtubeId: $channelId})
    MERGE (u)-[:UserChannelSetting]->(cs:ChannelSetting)-[:ChannelSettingChannel]->(c)
    ON CREATE SET cs.key = $channelSettingKey, cs.createdAt = datetime()
    SET cs.customName = $customName, cs.notifications = true,
        cs.autoDownload = false, cs.priority = 'normal', cs.updatedAt = datetime()
  \`, { /* channel setting properties */ });

  // STEP 3: Process all channel playlists using existing savePlaylist function
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
  - `(User)-[:UserChannelSetting]->(ChannelSetting)-[:ChannelSettingChannel]->(Channel)`
  - `(Channel)-[:ChannelPlaylist]->(Playlist)` for all channel playlists
  - Videos accessible through playlists only (no direct Channel->Video relationships)
- **Uploads Playlist ID**: Stores `uploadsPlaylistId` in Channel node for accessing all channel videos
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

  // Create user-specific PlaylistSetting
  await args.session.run(\`
    MATCH (u:User) WHERE elementId(u) = $userId
    MATCH (p:Playlist {youtubeId: $playlistId})
    MERGE (u)-[:UserPlaylistSetting]->(ps:PlaylistSetting)-[:PlaylistSettingPlaylist]->(p)
    ON CREATE SET ps.key = $playlistSettingKey, ps.createdAt = datetime()
    SET ps.customName = $customName, ps.customOrder = $customOrder,
        ps.sortBy = 'index', ps.displayPreferences = {
          showThumbnails: true, viewMode: 'list'
        }, ps.updatedAt = datetime()
  \`, {
    userId: user.id,
    playlistId,
    playlistSettingKey: \`playlist_setting_\${user.id}_\${playlistId}\`,
    customName: name,
    customOrder: allVideos.map(v => v.contentDetails.videoId)
  });

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

    // Create Playlist -> Video relationship (no properties on edge)
    await args.session.run(\`
      MATCH (p:Playlist {youtubeId: $playlistId})
      MATCH (v:Video {youtubeId: $videoId})
      MERGE (p)-[:PlaylistVideo]->(v)
    \`, { playlistId, videoId: video.contentDetails.videoId });

    // Create user-specific VideoSetting
    await args.session.run(\`
      MATCH (u:User) WHERE elementId(u) = $userId
      MATCH (v:Video {youtubeId: $videoId})
      MERGE (u)-[:UserVideoSetting]->(vs:VideoSetting)-[:VideoSettingVideo]->(v)
      ON CREATE SET vs.key = $videoSettingKey, vs.createdAt = datetime()
      SET vs.watched = false, vs.notes = null,
          vs.customPosition = $position, vs.playlistIndex = $position,
          vs.addedToPlaylistAt = datetime(), vs.updatedAt = datetime()
    \`, {
      userId: user.id,
      videoId: video.contentDetails.videoId,
      videoSettingKey: \`video_setting_\${user.id}_\${video.contentDetails.videoId}\`,
      position: video.snippet.position
    });
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
- **Proper Relationships**: Follows (User)-[:UserPlaylistSetting]->(PlaylistSetting)-[:PlaylistSettingPlaylist]->(Playlist)
- **Video Settings**: Creates (User)-[:UserVideoSetting]->(VideoSetting)-[:VideoSettingVideo]->(Video)
- **Clean Edges**: No data stored on relationships, all settings in dedicated vertices
- **User Privacy**: Each user has independent playlist and video settings
- **Data Separation**: Global YouTube data separate from user preferences

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
      channelSetting: Vertex     // ChannelSetting vertex with userVideoCount in P
    }
    // or for playlists:
    {
      playlist: Vertex,          // Playlist vertex
      playlistSetting: Vertex,   // PlaylistSetting vertex with userVideoCount in P
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
   YOUTUBE_CLIENT_ID=your_client_id
   YOUTUBE_CLIENT_SECRET=your_client_secret
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
- `YTOYouTubeAttribution` component on Privacy and Terms pages
- Clickable YouTube logo linking to YouTube.com
- Required disclosures in Privacy Policy
- Terms of Service with YouTube API Services section

### Legal Pages

**Privacy Policy (YTOPrivacy):**
- YouTube API Services disclosures
- Data collection and usage policies
- Third-party service integrations
- User rights and data control
- Links to YouTube ToS and Google Privacy Policy

**Terms of Service (YTOTerms):**
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

The system dynamically imports the following npm packages in server functions:
- `googleapis`: Google's official Node.js client library for accessing Google APIs

### Installation (if not already installed)
```bash
npm install googleapis
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

This documentation serves as the foundation for implementing the YouTube Organizer system and should be referenced for all development decisions and future enhancements.

## Recent Updates

### Version 2.0 - OAuth & API Usage Monitoring (Current)
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