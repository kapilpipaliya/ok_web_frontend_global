# YouTube Organizer (YTO)

A YouTube channel and playlist management system built using the Rulebook pattern with a modern, accessible UI.

## Overview

YouTube Organizer uses the Rulebook component pattern with a graph-based page schema system. All pages, components, and themes follow the Rulebook conventions with YTO prefix for namespacing.

## Graph Schema

YouTube Organizer uses Neo4j graph database with the following schema:

### Core Vertices

**Channel**
- Properties: `youtubeId`, `title`, `description`, `thumbnail`, `customUrl`, `country`, `videoCount`, `viewCount`, `subscriberCount`, `uploadsPlaylistId`, `publishedAt`, `createdAt`, `updatedAt`
- The `uploadsPlaylistId` stores the YouTube playlist ID containing all channel uploads

**Playlist**
- Properties: `youtubeId`, `title`, `description`, `thumbnail`, `videoCount`, `publishedAt`, `createdAt`, `updatedAt`

**Video**
- Properties: `youtubeId`, `title`, `description`, `thumbnail`, `channelTitle`, `channelId`, `publishedAt`, `createdAt`, `updatedAt`

**User**
- Properties: `uuid`, `email`, `name`, etc.

**ChannelSetting** (User-specific channel preferences)
- Properties: `key`, `customName`, `notifications`, `autoDownload`, `priority`, `createdAt`, `updatedAt`

**PlaylistSetting** (User-specific playlist preferences)
- Properties: `key`, `customName`, `notifications`, `autoDownload`, `sortBy`, `showThumbnails`, `viewMode`, `createdAt`, `updatedAt`

**VideoSettings** (User-specific video data)
- Properties: `key`, `watched`, `note`, `isFavourite`, `customPosition`, `addedToPlaylistAt`, `createdAt`, `updatedAt`

**Feedback** (User feedback)
- Properties: `feedback`, `category`, `createdAt`, `status`

### Relationships

**Channel Relationships:**
```
(User)-[:UserChannelSetting]->(ChannelSetting)-[:ChannelSettingChannel]->(Channel)
(Channel)-[:ChannelPlaylist]->(Playlist)
```

**Playlist Relationships:**
```
(User)-[:UserPlaylistSetting]->(PlaylistSetting)-[:PlaylistSettingPlaylist]->(Playlist)
(Playlist)-[:PlaylistVideo]->(Video)
```

**Video Relationships:**
```
(User)-[:UserVideoSettings]->(VideoSettings)-[:VideoSettingsVideo]->(Video)
```

**Feedback Relationships:**
```
(User)-[:UserFeedback]->(Feedback)
```

### Key Design Decisions

1. **No Direct Channel-Video Relationship**: Videos are only accessible through playlists. Each channel has an `uploadsPlaylistId` that references the playlist containing all channel uploads.

2. **User-Specific Settings**: Each user has their own settings nodes (ChannelSetting, PlaylistSetting, VideoSettings) that store user-specific data like custom names, notes, and favorites. This allows multiple users to have the same channel/playlist/video with different preferences.

3. **Shared Content Nodes**: Channel, Playlist, and Video nodes are shared across users. When deleting, the system only removes the user's settings and relationships. The actual content nodes are only deleted if no other users reference them.

4. **Multi-User Safety**: All delete operations check for other users before removing shared nodes, ensuring one user's deletion doesn't affect other users' data.

## URL Structure

All YouTube Organizer URLs start with `/yto/`:

- **Home/Dashboard**: `/yto/` - Overview with stats and quick actions
- **Content Pages**: `/yto/content?type=channels` or `/yto/content?type=playlists` - Unified content listing
- **Settings**: `/yto/settings` - Application settings and data management

### Query Parameters

The content page uses query parameters instead of separate URLs:
- `type`: Content type (`channels` | `playlists`)
- `id`: Optional detail view ID (future implementation)

Example:
```
/yto/content?type=channels        # List all channels
/yto/content?type=playlists       # List all playlists
/yto/content?type=channels&id=123 # Channel detail view (future)
```

## Components

YouTube Organizer includes 13 components with YTO prefix:

### Form Components
- **YTOButton** - Styled button with variants (primary, secondary, success, danger)
- **YTOTextInput** - Text input field with icon support (left/right icons)
- **YTOTextArea** - Multi-line text input
- **YTOTomSelect** - Advanced select dropdown with search

### UI Components
- **YTOPageTitle** - Consistent page heading with icon support
- **YTOLoadingSpinner** - Loading indicator with size/color variants
- **YTOFloatingMenu** - Dropdown menu with auto-positioning
- **YTOMenuItem** - Menu item component for floating menus

### Modal Components
- **YTOConfirmProvider** - Confirmation dialog context provider
- **YTOConfirmDialog** - Modal confirmation dialog
- **YTONoteModal** - Modal for adding/editing notes on channels, playlists, and videos
- **YTOFeedbackModal** - Modal for submitting user feedback

### Utility Components
- **YTOLayout** - Main layout wrapper with navigation

## Icon Usage

All icons use the HTML component with `as: "icon"` property:

```javascript
// In component props:
return {
  as: "icon",
  icon: "mdi:youtube",      // Iconify icon name
  width: 24,
  height: 24
};

// Color icons via CSS:
css: '''
return `._id {
  color: ${args.theme.var.color.error};
}`;
'''
```

Common icons used:
- YouTube: `mdi:youtube`
- Playlists: `mdi:playlist-play`
- Settings: `mdi:cog`
- Search: `mdi:magnify`
- Warning: `carbon:warning`
- Progress: `mdi:progress-wrench`

## Pages

### YTOHome (`/yto/`)
Dashboard page with:
- Statistics cards (channel count, playlist count)
- Quick action buttons to navigate to content pages
- Uses `getUserChannels` and `getUserPlaylists` server functions on mount

### YTOContent (`/yto/content`)
Unified content page for channels and playlists with virtualization:
- Reads `args.searchParams.type` to determine content type
- Loads data from server functions (`getUserChannels` or `getUserPlaylists`)
- **Virtualized list rendering** for performance with large datasets
- Real-time search functionality filtering by title and description
- Responsive card layout with thumbnails
- **Context menu on each card** with actions:
  - Open in YouTube (new tab)
  - Edit custom name (coming soon)
  - Delete (coming soon)
- Loading state with spinner
- Empty state with contextual messages
- Displays subscriber count (channels) or video count (playlists)
- Adapts item height based on screen size (mobile vs desktop)

### YTOSettings (`/yto/settings`)
Settings page with:
- Navigation cards to channels and playlists
- Appearance section with theme toggle (light/dark mode)
- Feedback section with submit button
- Data management section with clear all data functionality
- Styled with theme colors and icons

## Server Functions

Server functions return consistent data format across all pages:

```javascript
// Success response
{
  success: true,
  data: {
    items: [...],        // Array of items (channels, playlists, etc.)
    totalCount: number,  // Total count for pagination
    userId: string       // Optional user context
  },
  message: "Success message"
}

// Error response
{
  success: false,
  error: "Error message"
}
```

### Available Functions

**getUserChannels**
- Returns user's YouTube channels with settings
- Data format: `{ channels: Array<{channel, channelSetting}>, totalCount, userId }`

**getUserPlaylists**
- Returns user's YouTube playlists with settings
- Data format: `{ playlists: Array<{playlist, playlistSetting}>, totalCount, userId }`

**saveFeedback**
- Saves user feedback to the database
- Parameters: `{ feedback: string, category: string }`
- Categories: `general`, `bug`, `feature`, `improvement`, `other`
- Creates relationship: `(User)-[:UserFeedback]->(Feedback)`
- Returns: `{ success: boolean, data: { feedback, user }, message: string }`

### Vertex Format

Server functions return raw Neo4j vertex format:
```javascript
{
  id: "4:uuid:123",
  L: ["Channel"],
  P: {
    youtubeId: "UC123",
    title: "Channel Name",
    // ... all properties
  },
  IN: {},
  OUT: {}
}
```

Access properties via `vertex.P.propertyName` in components.

## Theme

Uses **YTOTheme** (copied from RBTheme) with:
- Light/dark mode support
- Semantic colors (primary, success, error, warning, info)
- Automatic shade generation (`_light_100` to `_light_900`, `_dark_100` to `_dark_900`)
- Text color suffix (`_text`) for readable text on colored backgrounds
- Custom spacing, typography, and animation variables

### Theme Colors

Access theme colors in CSS:
```javascript
css: '''
return `._id {
  background: ${args.theme.var.color.primary};
  color: ${args.theme.var.color.primary_text};
  border: 1px solid ${args.theme.var.color.border};

  &:hover {
    background: ${args.theme.var.color.primary_light_200};
  }
}`;
'''
```

## Development Guidelines

### Creating New Components

Follow SYSTEM_PROMPT.md guidelines:

1. **Vertex Structure**:
```javascript
{
  id: "unique_id",
  L: "Attr",
  P: {
    displayOrder: 1,
    componentName: "Html",
    props: '''...''',
    css: '''...'''
  }
}
```

2. **CSS Rules**:
- Use `._id` selector for all styles
- Use kebab-case for CSS properties (`border-radius` not `borderRadius`)
- Use rem units for spacing and sizing
- Include responsive breakpoints with `@media`
- Use theme variables for colors

3. **Props Function**:
```javascript
props: '''
const text = args.contextData.props?.text || "Default";
const onClick = args.contextData.props?.onClick || (() => {});
return {
  as: "button",
  text,
  onClick
};
'''
```

4. **CSS Function**:
```javascript
css: '''
return `._id {
  padding: 0.5rem 1rem;
  background: ${args.theme.var.color.primary};
  border-radius: 0.375rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${args.theme.var.color.primary_dark_200};
  }

  @media (max-width: 768px) {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}`;
'''
```

### Adding New Pages

1. Create `.hjson` file in `src/page_schema/ytorganizer/pages/`
2. Define Page vertex with `key` and `url` properties
3. Add PageLayout edge to use YTOLayout
4. Build component tree with Attr vertices
5. Connect vertices with Attr edges (T: "Attr")

### Working with Data

**Always use raw vertex format**:
```javascript
// CORRECT - Access via P field
const title = channel.P.title;
const id = channel.P.youtubeId;

// WRONG - Don't transform to flat object
const channel = {
  title: vertex.P.title,
  id: vertex.P.youtubeId
};
```

## Features

### Current Implementation
- ✅ Dashboard with real-time statistics
- ✅ Unified content page for channels and playlists
- ✅ **Virtualized list rendering** for performance
- ✅ Real-time search functionality
- ✅ Responsive card layout with thumbnails
- ✅ **Context menus** on cards (open, edit, delete)
- ✅ **Notes system** for channels, playlists, and videos
- ✅ **Favorites system** for marking favorite content
- ✅ **Feedback system** for user feedback submission
- ✅ Loading and empty states
- ✅ Settings page with appearance, feedback, and data management
- ✅ Theme toggle (light/dark mode)
- ✅ Navigation with Search, Channels, Playlists, Settings links

### Future Enhancements
- Detailed channel/playlist view pages
- Edit custom names and settings inline
- Delete channels/playlists with confirmation
- Virtualized scrolling for large lists
- Bulk operations (select multiple, batch actions)
- Export functionality (CSV, JSON)
- Filter by categories or tags
- Sort by name, date added, subscriber count
- Analytics and insights dashboard
