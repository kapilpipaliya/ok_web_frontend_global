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
(Playlist)-[:PlaylistVideo]->(Video)
```

### Vertex Types

- **User**: Existing system user vertex (extended with YTO properties)
- **LanguageSetting**: User's language preferences for translations
  - `language`: Language code ('en' for English, 'hi' for Hindi, 'gu' for Gujarati)
  - `isDefault`: Boolean indicating if this is the user's default language
- **ChannelSetting**: User-specific channel preferences and settings
- **Channel**: YouTube channel information (fetched via API)
- **PlaylistSetting**: User-specific playlist preferences and custom ordering
  - `customOrder`: Array of video IDs in user's preferred order
  - `sortBy`: Sort preference ('custom', 'date', 'title', 'index')
  - `displayPreferences`: User's display settings for the playlist
- **Playlist**: YouTube playlist information (fetched via API)
- **Video**: YouTube video information (fetched via API)
  - `playlistIndex`: Original position in YouTube playlist (stored per playlist relationship)
- **VideoSetting**: User-specific video preferences
  - `watched`: Boolean indicating if user has watched the video
  - `notes`: User's notes about the video
  - `customPosition`: User-defined position in custom ordering

## Architecture

### Component Structure

All components follow the YTO prefix naming convention:

#### Layout Components
- **YTOLayout**: Main layout with bottom navigation
- **YTOTabBar**: Tab navigation for channel/playlist detail views

#### UI Components  
- **YTOFloatingButton**: Floating action button for adding channels/playlists
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
const YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE'; // Define API key as constant
const { google } = await import('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY
});
```

##### Functions
- **fetchYouTubeChannel**: Retrieve channel information and videos via YouTube API
  - Dynamically imports googleapis library
  - Fetches channel metadata (title, description, thumbnail)
  - Retrieves latest videos from channel
  - Stores data in graph database
  
- **fetchYouTubePlaylist**: Retrieve playlist information and videos via YouTube API
  - Dynamically imports googleapis library
  - Fetches playlist metadata (title, description, thumbnail)
  - Retrieves all videos in playlist
  - Handles pagination for large playlists
  - Stores data in graph database

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
│   ├── YTOFloatingButton.hjson      # Floating action button
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
│   ├── fetchYouTubeChannel.hjson    # YouTube channel API integration
│   └── fetchYouTubePlaylist.hjson   # YouTube playlist API integration
└── docs/
    └── README.md                    # This documentation
```

## Usage Patterns

### Adding a Channel
1. Navigate to Channels page
2. Tap floating button
3. Enter YouTube channel URL or ID
4. System fetches channel info and videos via API
5. Creates ChannelSetting and Channel vertices with relationships

### Adding a Playlist
1. Navigate to Playlists page  
2. Tap floating button
3. Enter YouTube playlist URL or ID
4. System fetches playlist info and videos via API
5. Creates PlaylistSetting and Playlist vertices with relationships

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

#### Example Server Function Pattern
```javascript
// In fetchYouTubeChannel.hjson function body:
// Define API key at the top of the function
const YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual API key

try {
  // Dynamic import of googleapis
  const { google } = await import('googleapis');
  
  // Initialize YouTube API client
  const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY
  });
  
  // Extract channel ID from URL or use directly
  const channelId = args.params.channelUrl.includes('youtube.com') 
    ? extractChannelId(args.params.channelUrl)
    : args.params.channelUrl;
  
  // Fetch channel data
  const channelResponse = await youtube.channels.list({
    part: ['snippet', 'contentDetails', 'statistics'],
    id: [channelId]
  });
  
  // Fetch channel videos
  const videosResponse = await youtube.search.list({
    part: ['snippet'],
    channelId: channelId,
    order: 'date',
    maxResults: 50,
    type: 'video'
  });
  
  // Store in database using args.session
  const result = await args.session.run(
    `
    MERGE (c:Channel {id: $channelId})
    SET c.title = $title, 
        c.description = $description,
        c.thumbnail = $thumbnail,
        c.subscriberCount = $subscriberCount
    RETURN c
    `,
    {
      channelId,
      title: channelResponse.data.items[0].snippet.title,
      description: channelResponse.data.items[0].snippet.description,
      thumbnail: channelResponse.data.items[0].snippet.thumbnails.high.url,
      subscriberCount: channelResponse.data.items[0].statistics.subscriberCount
    }
  );
  
  // Process and store videos
  for (const video of videosResponse.data.items) {
    await args.session.run(
      `
      MERGE (v:Video {id: $videoId})
      SET v.title = $title,
          v.description = $description,
          v.thumbnail = $thumbnail,
          v.publishedAt = $publishedAt
      WITH v
      MATCH (c:Channel {id: $channelId})
      MERGE (c)-[:ChannelVideo]->(v)
      `,
      {
        videoId: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high.url,
        publishedAt: video.snippet.publishedAt,
        channelId
      }
    );
  }
  
  return {
    success: true,
    channel: result.records[0].get('c').properties,
    videoCount: videosResponse.data.items.length
  };
  
} catch (error) {
  console.error('YouTube API Error:', error);
  return {
    success: false,
    error: error.message
  };
}
```

#### Example Playlist Function with Index Storage
```javascript
// In fetchYouTubePlaylist.hjson function body:
const YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE';

try {
  const { google } = await import('googleapis');
  const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY
  });
  
  // Fetch playlist details
  const playlistResponse = await youtube.playlists.list({
    part: ['snippet', 'contentDetails'],
    id: [args.params.playlistId]
  });
  
  // Fetch playlist items with pagination
  let allVideos = [];
  let nextPageToken = null;
  
  do {
    const itemsResponse = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: args.params.playlistId,
      maxResults: 50,
      pageToken: nextPageToken
    });
    
    allVideos = allVideos.concat(itemsResponse.data.items);
    nextPageToken = itemsResponse.data.nextPageToken;
  } while (nextPageToken);
  
  // Store playlist
  await args.session.run(
    `
    MERGE (p:Playlist {id: $playlistId})
    SET p.title = $title,
        p.description = $description,
        p.thumbnail = $thumbnail,
        p.itemCount = $itemCount
    RETURN p
    `,
    {
      playlistId: args.params.playlistId,
      title: playlistResponse.data.items[0].snippet.title,
      description: playlistResponse.data.items[0].snippet.description,
      thumbnail: playlistResponse.data.items[0].snippet.thumbnails.high.url,
      itemCount: playlistResponse.data.items[0].contentDetails.itemCount
    }
  );
  
  // Store videos with playlist index
  for (const [index, item] of allVideos.entries()) {
    await args.session.run(
      `
      MERGE (v:Video {id: $videoId})
      SET v.title = $title,
          v.description = $description,
          v.thumbnail = $thumbnail,
          v.publishedAt = $publishedAt
      WITH v
      MATCH (p:Playlist {id: $playlistId})
      MERGE (p)-[r:PlaylistVideo]->(v)
      SET r.playlistIndex = $index,
          r.position = $position
      `,
      {
        videoId: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        playlistId: args.params.playlistId,
        index: index,
        position: item.snippet.position
      }
    );
  }
  
  // Initialize PlaylistSetting for user with default order
  const videoIds = allVideos.map(v => v.contentDetails.videoId);
  await args.session.run(
    `
    MATCH (u:User {id: $userId})
    MATCH (p:Playlist {id: $playlistId})
    MERGE (u)-[:UserPlaylist]->(ps:PlaylistSetting)
    MERGE (ps)-[:PlaylistSettingPlaylist]->(p)
    SET ps.customOrder = $videoIds,
        ps.sortBy = 'index',
        ps.lastUpdated = datetime()
    `,
    {
      userId: args.user.id,
      playlistId: args.params.playlistId,
      videoIds: videoIds
    }
  );
  
  return {
    success: true,
    playlist: playlistResponse.data.items[0].snippet,
    videoCount: allVideos.length
  };
  
} catch (error) {
  console.error('YouTube API Error:', error);
  return {
    success: false,
    error: error.message
  };
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