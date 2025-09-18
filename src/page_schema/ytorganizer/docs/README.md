# YouTube Organizer (YTO)

A mobile-first YouTube channel and playlist management system built with accessibility in mind. This system allows users to organize their favorite YouTube channels and playlists with an intuitive interface optimized for mobile usage and screen readers.

## Overview

YouTube Organizer is a comprehensive page schema implementation that provides:

- **Channel Management**: Add, organize, and browse YouTube channels
- **Playlist Management**: Create and manage custom playlists 
- **Video Organization**: View videos from channels and playlists
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interfaces
- **Accessibility**: Screen reader friendly with proper ARIA labels and semantic HTML
- **Bottom Navigation**: Easy navigation between main sections

## Graph Schema

The system uses the following Neo4j graph relationships:

```
(User)-[:UserChannelSetting]->(ChannelSetting)-[:ChannelSettingChannel]->(Channel)
(User)-[:UserPlaylist]->(PlaylistSetting)-[:PlaylistSettingPlaylist]->(Playlist)
(User)-[:UserVideoSetting]->(VideoSetting)-[:VideoSettingVideo]->(Video)
(User)-[:UserLanguageSetting]->(LanguageSetting {language: "en|hi|gu", isDefault: boolean})
(Channel)-[:ChannelVideo]->(Video)
(Channel)-[:ChannelPlaylist]->(Playlist)
(Playlist)-[:PlaylistVideo]->(Video)
```

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
  - `notes`: User's personal notes about the video
  - `customPosition`: User-defined position in custom ordering
  - `playlistIndex`: Original position in YouTube playlist (when from playlist)
  - `channelPosition`: Original position in YouTube channel uploads (when from channel)
  - `addedToPlaylistAt`: When user added this video from a playlist
  - `addedToChannelAt`: When user added this video from a channel
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

#### Pages
- **YTOHome**: Dashboard overview of recent activity
- **YTOChannels**: List of user's subscribed channels with add functionality
- **YTOPlaylists**: List of user's playlists with add functionality
- **YTOChannelDetail**: Channel details with videos/playlists tabs
- **YTOPlaylistDetail**: Playlist details with video list

### API Functions

#### YouTube Data Integration

The system uses the `googleapis` library dynamically imported in server functions to interact with YouTube Data API v3. The functions are executed server-side with full database access.

##### Dynamic Import Pattern
```javascript
// Dynamic import of googleapis library in server functions
const YOUTUBE_API_KEY = 'AIzaSyC_CClo37bSKqLUFNKEsDaZgYzTxEQfuds';
const { google } = await import('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY
});
```

##### Functions

- **saveChannel**: Save YouTube channel with all playlists and videos (Recommended)
  - Uses real YouTube Data API v3 with googleapis library
  - Extracts channel ID from various YouTube URL formats (/@handle, /channel/ID, /c/custom, /user/username)
  - Fetches complete channel metadata, statistics, and branding settings
  - Fetches ALL channel playlists with unlimited pagination
  - Fetches ALL channel videos from uploads playlist with unlimited pagination
  - Creates comprehensive database structure with proper relationships
  - Implements user authentication with `args.getUserFromSession()`
  - Reuses existing `savePlaylist` function for each channel playlist
  - Creates direct Channel->Video relationships for all channel videos
  - Creates user-specific ChannelSetting and VideoSetting for all content
  - Comprehensive error handling for YouTube API issues
  - Support for custom channel names and user preferences

- **savePlaylist**: Save YouTube playlist with user-specific settings (Recommended)
  - Uses real YouTube Data API v3 with googleapis library
  - Extracts playlist ID from various YouTube URL formats
  - Fetches complete playlist metadata and all videos with pagination
  - Creates user-specific playlist and video settings
  - Implements proper database structure: (User)-[:UserPlaylist]->(PlaylistSetting)-[:PlaylistSettingPlaylist]->(Playlist)
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
│   └── YTOTabBar.hjson              # Tab navigation component
├── pages/
│   ├── YTOHome.hjson                # Dashboard/home page
│   ├── YTOChannels.hjson            # Channels list page
│   ├── YTOPlaylists.hjson           # Playlists list page
│   ├── YTOChannelDetail.hjson       # Channel detail with tabs
│   └── YTOPlaylistDetail.hjson      # Playlist detail with videos
├── themes/
│   └── YTOTheme.hjson               # Custom theme for video content
├── functions/
│   ├── savePlaylist.hjson           # Save YouTube playlist with user settings
│   └── saveChannel.hjson            # Save YouTube channel with all playlists and videos
└── docs/
    └── README.md                    # This documentation
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
8. Fetches ALL channel playlists and videos with unlimited pagination
9. Creates/updates Channel vertex with YouTube metadata and statistics
10. Creates user-specific ChannelSetting with custom preferences
11. Creates/updates Video vertices for all channel videos
12. Creates user-specific VideoSetting for each video with watch status
13. Processes all channel playlists using existing savePlaylist function
14. Establishes comprehensive relationships following the database schema

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

The `saveChannel` function provides a complete user-centric channel management solution with comprehensive data fetching:

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
 * Includes: channel info, all playlists, and all videos
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

  // Fetch ALL channel videos from uploads playlist (no limit)
  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  let allVideos = [];
  if (uploadsPlaylistId) {
    nextPageToken = null;
    do {
      const videosResponse = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: uploadsPlaylistId, maxResults: 50, pageToken: nextPageToken
      });
      allVideos = allVideos.concat(videosResponse.data.items || []);
      nextPageToken = videosResponse.data.nextPageToken;
    } while (nextPageToken);
  }

  return { channel, playlists: allPlaylists, videos: allVideos };
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
        c.publishedAt = datetime($publishedAt), c.updatedAt = datetime()
  \`, { /* channel properties */ });

  // STEP 2: Create user-specific ChannelSetting
  await args.session.run(\`
    MATCH (u:User) WHERE elementId(u) = $userId
    MATCH (c:Channel {youtubeId: $channelId})
    MERGE (u)-[:UserChannelSetting]->(cs:ChannelSetting)-[:ChannelSettingChannel]->(c)
    ON CREATE SET cs.key = $channelSettingKey, cs.createdAt = datetime()
    SET cs.customName = $customName, cs.notifications = true,
        cs.autoDownload = false, cs.priority = 'normal', cs.updatedAt = datetime()
  \`, { /* channel setting properties */ });

  // STEP 3: Process ALL channel videos first
  for (const video of channelData.videos) {
    // Create/update Video vertex
    await args.session.run(\`
      MERGE (v:Video {youtubeId: $videoId})
      ON CREATE SET v.key = $key, v.createdAt = datetime()
      SET v.title = $title, v.description = $description,
          v.thumbnail = $thumbnail, v.channelTitle = $channelTitle,
          v.channelId = $channelId, v.publishedAt = datetime($publishedAt),
          v.updatedAt = datetime()
    \`, { /* video properties */ });

    // Create Channel -> Video relationship
    await args.session.run(\`
      MATCH (c:Channel {youtubeId: $channelId})
      MATCH (v:Video {youtubeId: $videoId})
      MERGE (c)-[:ChannelVideo]->(v)
    \`, { channelId, videoId: video.id });

    // Create user-specific VideoSetting
    await args.session.run(\`
      MATCH (u:User) WHERE elementId(u) = $userId
      MATCH (v:Video {youtubeId: $videoId})
      MERGE (u)-[:UserVideoSetting]->(vs:VideoSetting)-[:VideoSettingVideo]->(v)
      ON CREATE SET vs.key = $videoSettingKey, vs.createdAt = datetime()
      SET vs.watched = false, vs.notes = null, vs.customPosition = $position,
          vs.channelPosition = $channelPosition, vs.addedToChannelAt = datetime(),
          vs.updatedAt = datetime()
    \`, { /* video setting properties */ });
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
      totalPlaylists: channelData.playlists.length, totalVideos: channelData.videos.length,
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
- **Complete Channel Coverage**: Fetches ALL videos and playlists from the channel
- **User Authentication**: Uses `args.getUserFromSession()` for secure user identification
- **Comprehensive Relationships**:
  - `(User)-[:UserChannelSetting]->(ChannelSetting)-[:ChannelSettingChannel]->(Channel)`
  - `(Channel)-[:ChannelVideo]->(Video)` for all channel videos
  - `(Channel)-[:ChannelPlaylist]->(Playlist)` for all channel playlists
  - `(User)-[:UserVideoSetting]->(VideoSetting)-[:VideoSettingVideo]->(Video)` for all videos
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
    MERGE (u)-[:UserPlaylist]->(ps:PlaylistSetting)-[:PlaylistSettingPlaylist]->(p)
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
- **Proper Relationships**: Follows (User)-[:UserPlaylist]->(PlaylistSetting)-[:PlaylistSettingPlaylist]->(Playlist)
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

### YouTube API Key Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Replace `'YOUR_API_KEY_HERE'` in the function files with your actual API key

**Note**: The API key is defined as a constant at the top of each server function for simplicity. In production, consider storing it in a secure configuration vertex or environment variable.

## Dependencies

The system dynamically imports the following npm packages in server functions:
- `googleapis`: Google's official Node.js client library for accessing Google APIs

### Installation (if not already installed)
```bash
npm install googleapis
```

## Future Enhancements

- Offline functionality with service workers
- Push notifications for new videos
- Advanced filtering and search
- Video playback integration
- Export/import functionality
- Social sharing features
- Watch history tracking
- Collaborative playlists
- Video recommendations

This documentation serves as the foundation for implementing the YouTube Organizer system and should be referenced for all development decisions and future enhancements.