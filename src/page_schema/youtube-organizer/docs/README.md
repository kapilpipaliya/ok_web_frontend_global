# YouTube Organizer

A mobile-friendly web application for organizing YouTube channels and playlists with accessibility features. Built using the Neo4j graph database to efficiently manage relationships between users, channels, playlists, and videos.

## Graph Schema

The application uses the following graph structure:

```
(User)-[UserChannel]->(Channel)
(User)-[UserPlaylist]->(Playlist)
(User)-[UserVideo]->(Video)
(Channel)-[ChannelVideo]->(Video)
(Playlist)-[PlaylistVideo]->(Video)
```

### Vertex Types

#### User (System Vertex)
The existing User vertex in the system is extended with YouTube Organizer relationships.

#### Channel
Properties:
- `key`: Unique channel ID
- `channelId`: YouTube channel ID
- `title`: Channel name
- `description`: Channel description
- `thumbnails`: Thumbnail URLs object
- `publishedAt`: Channel creation date
- `viewCount`: Total channel views
- `subscriberCount`: Subscriber count
- `videoCount`: Total videos
- `uploadsPlaylistId`: ID of uploads playlist

#### Playlist
Properties:
- `key`: Unique playlist ID
- `playlistId`: YouTube playlist ID
- `title`: Playlist title
- `description`: Playlist description
- `thumbnails`: Thumbnail URLs object
- `channelId`: Owner channel ID
- `channelTitle`: Owner channel name
- `publishedAt`: Playlist creation date
- `itemCount`: Number of videos
- `status`: Privacy status object

#### Video
Properties:
- `key`: Unique video ID
- `videoId`: YouTube video ID
- `title`: Video title
- `description`: Video description
- `thumbnails`: Thumbnail URLs object
- `publishedAt`: Video upload date
- `channelId`: Channel ID
- `channelTitle`: Channel name
- `viewCount`: View count
- `likeCount`: Like count
- `commentCount`: Comment count
- `duration`: Video duration (ISO 8601)

### Edge Types

#### UserChannel
Connects a user to their subscribed channels.
Properties:
- `key`: Composite key "{userId}-{channelId}"
- `addedAt`: Timestamp when channel was added

#### UserPlaylist
Connects a user to their saved playlists.
Properties:
- `key`: Composite key "{userId}-{playlistId}"
- `addedAt`: Timestamp when playlist was added

#### UserVideo
Connects a user to videos (for tracking).
Properties:
- `key`: Composite key "{userId}-{videoId}"
- `addedAt`: Timestamp when video was added

#### ChannelVideo
Connects a channel to its videos.
Properties:
- `key`: Composite key "{channelId}-{videoId}"

#### PlaylistVideo
Connects a playlist to its videos.
Properties:
- `key`: Composite key "{playlistId}-{videoId}"
- `position`: Video position in playlist
- `addedAt`: Timestamp when added to playlist

## Components

All components are prefixed with "YTO" (YouTube Organizer).

### YTOLayout
Main layout component with mobile-friendly bottom navigation.
- Features: Fixed bottom navigation bar, responsive design
- Navigation: Home, Channels, Playlists, Profile
- Accessibility: ARIA labels, keyboard navigation

### YTOFloatingButton
Floating action button for adding channels/playlists.
- Props: `icon`, `label`, `onClick`
- Features: Accessible, mobile-optimized sizing

### YTOVideoCard
Card component for displaying video information.
- Props: `video` (JSON object)
- Features: Thumbnail, duration, title, channel, view count, publish date
- Responsive: Different layouts for mobile/desktop

### YTOChannelCard
Card component for displaying channel information.
- Props: `channel` (JSON object), `onClick`
- Features: Profile image, name, subscriber count, video count
- Accessibility: Keyboard navigable

### YTOPlaylistCard
Card component for displaying playlist information.
- Props: `playlist` (JSON object), `onClick`
- Features: Thumbnail with video count overlay, privacy status badge
- Responsive: Grid layout on larger screens

### YTOTabBar
Tab bar component for switching between content sections.
- Props: `tabs`, `activeTab`, `onTabChange`
- Features: Icons, smooth transitions, accessible

## Pages

### YTOHome (/yto)
Landing page with navigation to channels and playlists.
- Features: Quick access cards, getting started guide
- Accessibility: Large touch targets, clear hierarchy

### YTOChannels (/yto/channels)
List of user's subscribed channels with add functionality.
- Features: Channel list, floating add button, modal for adding
- Server function: Fetches user's channels from graph

### YTOPlaylists (/yto/playlists)
List of user's saved playlists with add functionality.
- Features: Playlist grid, floating add button, modal for adding
- Server function: Fetches user's playlists from graph

### YTOChannelDetail (/yto/channel/:channelId)
Detailed view of a channel with tabs.
- Tabs: Videos, Playlists, About
- Features: Channel header, video list, channel playlists
- Server functions: Fetch channel data, videos, and playlists

### YTOPlaylistDetail (/yto/playlist/:playlistId)
Detailed view of a playlist.
- Features: Playlist header, numbered video list, privacy badge
- Server function: Fetches playlist videos with position

## Functions

### fetchYouTubeChannel
Server function to fetch channel data from YouTube API.
- Parameters: `channelUrl`, `apiKey` (optional)
- Features: 
  - Supports multiple URL formats (@username, /channel/, /c/)
  - Creates/updates Channel, Video, and relationship vertices
  - Fetches up to 50 recent videos
- Returns: Channel data and videos added

### fetchYouTubePlaylist
Server function to fetch playlist data from YouTube API.
- Parameters: `playlistUrl`, `apiKey` (optional)
- Features:
  - Extracts playlist ID from URL
  - Creates/updates Playlist, Video, and relationship vertices
  - Maintains video position in playlist
- Returns: Playlist data and videos added

## Theme

### YTOTheme
Mobile-friendly theme with YouTube-inspired colors.
- Primary: YouTube red
- Features: High contrast for accessibility
- Dark mode support with automatic shade swapping

## Accessibility Features

1. **Screen Reader Support**
   - Semantic HTML with proper headings
   - ARIA labels and roles
   - Live regions for dynamic content

2. **Keyboard Navigation**
   - Tab order management
   - Focus indicators
   - Keyboard shortcuts for navigation

3. **Visual Accessibility**
   - High contrast ratios
   - Large touch targets (min 44x44px)
   - Clear focus states
   - Readable font sizes

4. **Mobile Optimization**
   - Responsive design
   - Touch-friendly controls
   - Reduced motion for animations
   - Optimized for one-handed use

## Setup Instructions

1. **Environment Variables**
   - Set `YOUTUBE_API_KEY` for default API access
   - Or users can provide their own API key when adding content

2. **Database Setup**
   - Ensure Neo4j is configured and running
   - The schema will be created automatically when adding content

3. **Permissions**
   - Users need to be authenticated to use the organizer
   - All content is user-specific

## Usage

1. **Adding a Channel**
   - Navigate to Channels page
   - Click the floating + button
   - Enter channel URL (supports @username, /channel/ID, /c/name)
   - Optionally provide API key
   - System fetches channel info and recent videos

2. **Adding a Playlist**
   - Navigate to Playlists page
   - Click the floating + button
   - Enter playlist URL
   - Optionally provide API key
   - System fetches playlist info and all videos

3. **Viewing Content**
   - Click on any channel/playlist card
   - Browse videos, playlists, and channel info
   - All content is organized and easily accessible

## API Key Management

The system supports two methods for API key usage:

1. **System Default**: Set `YOUTUBE_API_KEY` environment variable
2. **User Provided**: Enter API key when adding content

API keys are used for:
- Fetching channel information
- Retrieving video metadata
- Getting playlist contents
- Accessing video statistics

## Future Enhancements

Potential improvements for the YouTube Organizer:

1. **Search and Filtering**
   - Search videos across all channels
   - Filter by date, duration, views
   - Sort options

2. **Batch Operations**
   - Import multiple channels/playlists
   - Bulk refresh metadata
   - Export data

3. **Analytics**
   - View trends
   - Watch history
   - Favorite videos

4. **Social Features**
   - Share collections
   - Collaborative playlists
   - Recommendations