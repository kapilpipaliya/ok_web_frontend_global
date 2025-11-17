# YSaar (YTO) - Test Cases

This document outlines comprehensive test cases for the YSaar YouTube organizer application. These tests should be performed manually to ensure all features work correctly.

## Prerequisites

Before testing:
- User must be logged in
- At least one YouTube account must be connected (for most tests)
- Test with different user roles (regular user, admin)
- Test on both desktop and mobile devices

---

## 1. Authentication & Account Management

### 1.1 YouTube Account Connection
- [ ] **Connect First Account**: Click "Connect YouTube Account" in settings, complete OAuth flow, verify account appears in ownership selector
- [ ] **Connect Second Account**: Connect another YouTube account, verify both accounts appear in dropdown
- [ ] **Primary Account Selection**: Verify primary account is selected by default on first load
- [ ] **Switch Accounts**: Use ownership selector to switch between accounts, verify page reloads with new account data
- [ ] **Disconnect Account**: Disconnect one account from settings, verify it's removed from ownership selector
- [ ] **Reconnect Account**: Reconnect a previously disconnected account, verify data is preserved

### 1.2 Session Management
- [ ] **Ownership Persistence**: Select an ownership, reload page, verify same ownership is still selected
- [ ] **Logout/Login**: Logout and login, verify ownership selection is cleared and needs re-selection

---

## 2. Channel Management

### 2.1 Add Channel
- [ ] **Add via Channel URL**: Add channel using `youtube.com/channel/UCxxxxx` format
- [ ] **Add via Handle**: Add channel using `youtube.com/@handle` format
- [ ] **Add via Custom URL**: Add channel using `youtube.com/c/customname` format
- [ ] **Add via User URL**: Add channel using `youtube.com/user/username` format
- [ ] **Custom Name**: Add channel with custom name, verify custom name is displayed
- [ ] **Duplicate Channel**: Try adding same channel twice, verify appropriate handling
- [ ] **Invalid URL**: Try adding invalid channel URL, verify error message
- [ ] **Private Channel**: Try adding private/restricted channel, verify error handling
- [ ] **All Playlists Fetched**: Verify all channel playlists are fetched and visible
- [ ] **Uploads Playlist**: Verify "All Uploads" playlist is created and accessible
- [ ] **Multi-Ownership**: Add same channel to two different ownerships, verify independent settings

### 2.2 View Channels
- [ ] **Channels List**: Navigate to Channels page, verify all added channels display
- [ ] **Channel Card Info**: Verify channel thumbnail, title, custom name, subscriber count display
- [ ] **Video Count**: Verify video count shows correct number from ownership
- [ ] **Channel Detail**: Click channel card, verify navigation to channel detail page
- [ ] **Empty State**: View channels page with no channels, verify empty state message

### 2.3 Channel Detail Page
- [ ] **Videos Tab**: View channel videos through uploads playlist
- [ ] **Playlists Tab**: View all channel playlists
- [ ] **Channel Info**: Verify channel metadata (subscribers, videos, description) displays
- [ ] **Tab Navigation**: Switch between Videos and Playlists tabs
- [ ] **Back Navigation**: Navigate back to channels list

### 2.4 Delete Channel
- [ ] **Delete Single Channel**: Delete a channel, verify it's removed from list
- [ ] **Delete with Playlists**: Delete channel that has playlists, verify playlists handling
- [ ] **Delete Confirmation**: Verify delete confirmation dialog appears
- [ ] **Multi-Ownership**: Delete channel from one ownership, verify it remains in other ownerships
- [ ] **Orphan Cleanup**: After deletion, verify orphaned data is cleaned up

---

## 3. Playlist Management

### 3.1 Add Playlist
- [ ] **Add via Playlist URL**: Add playlist using `youtube.com/playlist?list=PLxxxxx` format
- [ ] **Add via Watch URL**: Add playlist using `youtube.com/watch?v=xxx&list=PLxxxxx` format
- [ ] **Custom Name**: Add playlist with custom name, verify custom name is displayed
- [ ] **Duplicate Playlist**: Try adding same playlist twice, verify appropriate handling
- [ ] **Invalid URL**: Try adding invalid playlist URL, verify error message
- [ ] **Private Playlist**: Try adding private/unlisted playlist, verify error handling
- [ ] **All Videos Fetched**: Verify all playlist videos are fetched with pagination
- [ ] **Video Settings Created**: Verify VideoSetting created for each video
- [ ] **Multi-Ownership**: Add same playlist to two different ownerships, verify independent membership

### 3.2 View Playlists
- [ ] **Playlists List**: Navigate to Playlists page, verify all added playlists display
- [ ] **Playlist Card Info**: Verify playlist thumbnail, title, custom name, video count display
- [ ] **Parent Channel**: Verify parent channel name displays if channel is added
- [ ] **Playlist Detail**: Click playlist card, verify navigation to playlist detail page
- [ ] **Empty State**: View playlists page with no playlists, verify empty state message

### 3.3 Playlist Detail Page
- [ ] **Video List**: View all videos in playlist
- [ ] **Video Order**: Verify videos display in correct order (YouTube index)
- [ ] **Custom Ordering**: Drag and drop videos to reorder, verify custom order persists
- [ ] **Sort Options**: Switch between sort modes (custom, date, title, index)
- [ ] **Playlist Info**: Verify playlist metadata displays
- [ ] **Video Actions**: Verify play, favourite, watch status actions available

### 3.4 Add Video to Playlist
- [ ] **Add Existing Video**: Add video that exists in another playlist to current playlist
- [ ] **Add New Video**: Add video URL directly to playlist
- [ ] **Duplicate Detection**: Try adding video already in playlist, verify appropriate handling
- [ ] **Multiple Playlists**: Add same video to multiple playlists, verify independent membership
- [ ] **Position Assignment**: Verify video is added at correct position in playlist

### 3.5 Delete Playlist
- [ ] **Delete Single Playlist**: Delete a playlist, verify it's removed from list
- [ ] **Delete with Videos**: Delete playlist with videos, verify videos remain in other playlists
- [ ] **Delete Confirmation**: Verify delete confirmation dialog appears
- [ ] **Multi-Ownership**: Delete playlist from one ownership, verify it remains in other ownerships
- [ ] **Video Orphan Cleanup**: Verify videos not in any playlist are cleaned up

---

## 4. Video Management

### 4.1 View Videos
- [ ] **Video Cards**: Verify video thumbnail, title, channel name display
- [ ] **Watch Status Indicator**: Verify watched videos have visual indicator
- [ ] **Favourite Indicator**: Verify favourited videos have star/heart icon
- [ ] **Duration**: Verify video duration displays on thumbnail
- [ ] **Published Date**: Verify published date displays

### 4.2 Video Actions

#### 4.2.1 Toggle Favourite (Global - applies to all playlists)
- [ ] **Mark as Favourite**: Click favourite icon, verify video is marked as favourite
- [ ] **Unmark Favourite**: Click favourite icon again, verify video is unmarked
- [ ] **Favourite Persistence**: Reload page, verify favourite status persists
- [ ] **Global Application**: Mark video as favourite in one playlist, verify it shows as favourite in all playlists
- [ ] **Favourites View**: Navigate to Favourites page, verify favourited video appears
- [ ] **Multi-Ownership**: Mark video as favourite in one ownership, verify it doesn't affect other ownerships

#### 4.2.2 Toggle Watched (Global - applies to all playlists)
- [ ] **Mark as Watched**: Mark video as watched, verify visual indicator appears
- [ ] **Unmark Watched**: Unmark video as watched, verify indicator disappears
- [ ] **Watched Persistence**: Reload page, verify watched status persists
- [ ] **Global Application**: Mark video as watched in one playlist, verify it shows as watched in all playlists
- [ ] **Multi-Ownership**: Mark video as watched in one ownership, verify it doesn't affect other ownerships

#### 4.2.3 Video Notes (Global - applies to all playlists)
- [ ] **Add Note**: Add note to video, verify note is saved
- [ ] **Edit Note**: Edit existing note, verify changes are saved
- [ ] **Delete Note**: Delete note, verify it's removed
- [ ] **Note Persistence**: Reload page, verify note persists
- [ ] **Global Application**: Add note in one playlist, verify same note shows in all playlists
- [ ] **Multi-Ownership**: Add note in one ownership, verify it doesn't affect other ownerships

#### 4.2.4 Custom Video Name (Global - applies to all playlists)
- [ ] **Set Custom Name**: Set custom name for video, verify it displays instead of original title
- [ ] **Clear Custom Name**: Clear custom name, verify original title displays
- [ ] **Global Application**: Set custom name in one playlist, verify it shows in all playlists
- [ ] **Multi-Ownership**: Set custom name in one ownership, verify it doesn't affect other ownerships

### 4.3 Remove Video from Playlist (Per-Playlist)
- [ ] **Remove from Playlist**: Remove video from one playlist, verify it remains in other playlists
- [ ] **Remove Confirmation**: Verify delete confirmation appears
- [ ] **Video Settings Preserved**: Remove video from playlist, verify notes/favourite/watched status remain if video exists in other playlists
- [ ] **Orphan Cleanup**: Remove video from last playlist, verify video and VideoSetting are cleaned up
- [ ] **Multi-Ownership**: Remove video from playlist in one ownership, verify it remains in other ownerships' playlists

### 4.4 Delete Video (Global - removes from all playlists)
- [ ] **Delete from All Playlists**: Delete video, verify it's removed from all playlists
- [ ] **Delete Confirmation**: Verify confirmation dialog appears
- [ ] **Settings Cleanup**: Verify VideoSetting is deleted
- [ ] **Multi-Ownership**: Delete video in one ownership, verify it remains in other ownerships

---

## 5. Video Player

### 5.1 Player Controls
- [ ] **Play Video**: Click play on video card, verify player opens in minimized mode
- [ ] **Toggle Minimize/Maximize**: Click expand/collapse button, verify player resizes
- [ ] **Close Player**: Click close button, verify player closes
- [ ] **Draggable Player**: Drag player to different position, verify position persists
- [ ] **Resizable Player**: Resize player, verify size persists

### 5.2 Queue Management
- [ ] **Add to Queue**: Add video to queue, verify it appears in queue
- [ ] **Play Next**: Player automatically plays next video from queue when current ends
- [ ] **Queue Modal**: Open queue modal, verify all queued videos display
- [ ] **Remove from Queue**: Remove video from queue, verify it's removed
- [ ] **Clear Queue**: Clear entire queue, verify all videos removed
- [ ] **Play Playlist**: Play playlist, verify first video plays and rest added to queue
- [ ] **Add Playlist to Queue**: Add playlist to queue without playing, verify all videos added

---

## 6. Search & Filters

### 6.1 Search
- [ ] **Search Channels**: Search for channels by name
- [ ] **Search Playlists**: Search for playlists by name
- [ ] **Search Videos**: Search for videos by title
- [ ] **Search Results**: Verify search results are accurate
- [ ] **Clear Search**: Clear search, verify all items return

### 6.2 Favourites View
- [ ] **View All Favourites**: Navigate to favourites page, verify all favourited items display
- [ ] **Favourite Videos**: Verify favourited videos appear
- [ ] **Favourite Channels**: Verify channels with favourite videos appear
- [ ] **Favourite Playlists**: Verify playlists with favourite videos appear
- [ ] **Empty Favourites**: Verify empty state when no favourites exist

---

## 7. Settings

### 7.1 Account Settings
- [ ] **View Connected Accounts**: View all connected YouTube accounts in settings
- [ ] **Account Information**: Verify channel name, subscriber count for each account
- [ ] **Set Primary Account**: Set an account as primary, verify it becomes default
- [ ] **Account Custom Name**: Set custom name for ownership, verify it displays in selector

### 7.2 Display Settings
- [ ] **Theme Selection**: Switch between light/dark theme (if applicable)
- [ ] **Card Field Settings**: Customize visible fields on video/channel/playlist cards
- [ ] **Language Settings**: Switch between English, Hindi, Gujarati (if applicable)

### 7.3 Data Management
- [ ] **Clear All Data**: Clear all data for current ownership, verify all content removed
- [ ] **Export Data**: Export user data (if implemented)
- [ ] **Import Data**: Import user data (if implemented)

---

## 8. Quota Management

### 8.1 Quota Display
- [ ] **View Quota Usage**: View current quota usage in settings or admin panel
- [ ] **Quota Percentage**: Verify quota usage percentage displays correctly
- [ ] **Quota Reset Timer**: Verify countdown to quota reset (midnight UTC)
- [ ] **Quota Warning**: Verify warning appears at 80% quota usage
- [ ] **Quota Critical**: Verify critical alert appears at 95% quota usage

### 8.2 Quota Limits
- [ ] **At Quota Limit**: When at 95%+ quota, verify add channel/playlist is disabled
- [ ] **After Quota Reset**: After midnight UTC, verify quota resets to 0%
- [ ] **Shared Quota**: Add content from multiple ownerships, verify shared quota increases

### 8.3 Admin Quota Monitoring (Admin Only)
- [ ] **View Shared Quota**: Navigate to admin quota monitor, verify total usage displays
- [ ] **Usage by Ownership**: Verify breakdown by ownership shows correct data
- [ ] **Active Reservations**: Verify active quota reservations display
- [ ] **Usage History**: View historical quota usage trends
- [ ] **Alert Emails**: Verify alert emails sent at threshold levels

---

## 9. Admin Features (Admin Only)

### 9.1 User Management
- [ ] **View All Users**: View list of all users in system
- [ ] **User Impersonation**: Impersonate a user, verify ability to view their data
- [ ] **Exit Impersonation**: Exit impersonation, verify return to admin view
- [ ] **User Statistics**: View user statistics (channels, playlists, videos)

### 9.2 System Monitoring
- [ ] **Worker Health**: View BullMQ worker health status
- [ ] **Worker Logs**: View worker execution logs
- [ ] **API Key Management**: Manage YouTube API keys
- [ ] **System Stats**: View overall system statistics

---

## 10. Mobile Responsiveness

### 10.1 Mobile Navigation
- [ ] **Bottom Navigation**: Verify bottom nav displays on mobile
- [ ] **Navigation Items**: Verify all nav items are accessible and functional
- [ ] **Tab Switching**: Switch between tabs, verify smooth transitions
- [ ] **Sidebar Toggle**: Toggle sidebar on mobile, verify collapse/expand works

### 10.2 Mobile Interactions
- [ ] **Touch Targets**: Verify all buttons have minimum 44px touch target
- [ ] **Swipe Gestures**: Test swipe gestures for navigation (if implemented)
- [ ] **Modal Dialogs**: Verify modals are mobile-friendly
- [ ] **Forms**: Test all forms on mobile (add channel, playlist, video)
- [ ] **Video Cards**: Verify cards are touch-friendly and display correctly

### 10.3 Mobile Player
- [ ] **Player on Mobile**: Verify video player works on mobile
- [ ] **Minimize/Maximize**: Verify player resize works on mobile
- [ ] **Queue on Mobile**: Verify queue modal is mobile-friendly

---

## 11. Accessibility

### 11.1 Keyboard Navigation
- [ ] **Tab Navigation**: Navigate entire app using Tab key
- [ ] **Focus Indicators**: Verify all interactive elements have visible focus indicators
- [ ] **Keyboard Shortcuts**: Test any keyboard shortcuts (if implemented)
- [ ] **Modal Focus Trap**: Verify focus stays within modal when open

### 11.2 Screen Reader Support
- [ ] **ARIA Labels**: Verify all interactive elements have proper ARIA labels
- [ ] **Alt Text**: Verify all images have descriptive alt text
- [ ] **Heading Hierarchy**: Verify proper heading structure (h1, h2, h3)
- [ ] **Announcements**: Verify screen reader announces actions (added, deleted, etc.)

### 11.3 Visual Accessibility
- [ ] **Color Contrast**: Verify sufficient color contrast for text
- [ ] **Text Sizing**: Verify text is readable and can be resized
- [ ] **Focus Visibility**: Verify focus indicators are clearly visible

---

## 12. Error Handling

### 12.1 Network Errors
- [ ] **Offline Mode**: Disconnect internet, verify graceful error messages
- [ ] **API Timeout**: Simulate slow network, verify timeout handling
- [ ] **API Error**: Simulate API error, verify error message displays

### 12.2 User Input Errors
- [ ] **Invalid URLs**: Test various invalid YouTube URLs, verify error messages
- [ ] **Empty Forms**: Submit empty forms, verify validation errors
- [ ] **Long Text**: Enter very long text in fields, verify character limits

### 12.3 Edge Cases
- [ ] **Deleted YouTube Content**: Add channel/playlist then delete it on YouTube, verify handling
- [ ] **Private Content**: Try accessing private/deleted videos, verify error handling
- [ ] **Concurrent Operations**: Perform multiple operations simultaneously, verify no race conditions

---

## 13. Performance

### 13.1 Load Times
- [ ] **Initial Load**: Verify app loads within acceptable time
- [ ] **Channel List**: Verify channel list loads quickly with many channels
- [ ] **Playlist List**: Verify playlist list loads quickly with many playlists
- [ ] **Video List**: Verify video list loads quickly with many videos

### 13.2 Pagination
- [ ] **Lazy Loading**: Scroll through long lists, verify lazy loading works
- [ ] **Infinite Scroll**: Verify infinite scroll loads more items
- [ ] **Load More**: Click "Load More" button, verify more items load

### 13.3 Caching
- [ ] **Image Caching**: Reload page, verify images load from cache
- [ ] **Data Caching**: Navigate back/forth, verify data loads from cache

---

## 14. Multi-Ownership Scenarios

### 14.1 Cross-Ownership Data Isolation
- [ ] **Independent Settings**: Verify settings in one ownership don't affect another
- [ ] **Independent Content**: Add channel to ownership A, verify it doesn't appear in ownership B
- [ ] **Switch Ownership**: Switch ownership mid-operation, verify data integrity

### 14.2 Shared vs Ownership-Specific
- [ ] **Shared Video Node**: Same video in multiple ownerships shares Video node
- [ ] **Separate VideoSettings**: Same video in multiple ownerships has separate VideoSettings
- [ ] **Separate PlaylistSettings**: Same playlist in multiple ownerships has separate PlaylistSettings

---

## 15. Feedback System

### 15.1 Submit Feedback
- [ ] **Open Feedback Modal**: Click feedback button, verify modal opens
- [ ] **Enter Feedback**: Enter feedback text, select category
- [ ] **Submit Feedback**: Submit feedback, verify success message
- [ ] **Feedback Validation**: Try submitting empty feedback, verify validation
- [ ] **Character Limit**: Enter 1000+ characters, verify character limit enforced

### 15.2 Admin Feedback Review (Admin Only)
- [ ] **View Feedback**: View all user feedback in admin panel
- [ ] **Feedback Status**: Update feedback status (pending, resolved, etc.)

---

## Testing Checklist Summary

### Critical Path (Must Pass)
- [ ] Connect YouTube account
- [ ] Add channel via any URL format
- [ ] Add playlist via URL
- [ ] View channels, playlists, videos
- [ ] Toggle favourite on video (global)
- [ ] Mark video as watched (global)
- [ ] Delete channel
- [ ] Delete playlist
- [ ] Remove video from playlist (per-playlist)
- [ ] Switch between ownerships
- [ ] Quota monitoring works

### High Priority
- [ ] All video actions work (notes, custom name)
- [ ] Video player functionality
- [ ] Queue management
- [ ] Search and filters
- [ ] Mobile responsiveness
- [ ] Settings management

### Medium Priority
- [ ] Keyboard navigation
- [ ] Error handling
- [ ] Performance optimization
- [ ] Admin features
- [ ] Feedback system

### Low Priority
- [ ] Edge cases
- [ ] Multi-language support
- [ ] Advanced admin features

---

## Test Environment Setup

### Desktop Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing
- iOS Safari (latest)
- Android Chrome (latest)
- Various screen sizes (phone, tablet)

### Test Data
- Multiple YouTube accounts with various content types
- Channels with different subscriber counts
- Playlists with different video counts
- Videos with various lengths and metadata

---

## Bug Reporting Template

When reporting bugs, include:

**Title**: Brief description of the issue

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happened

**Environment**:
- Browser/Device:
- Ownership:
- User Role:

**Screenshots**: Attach relevant screenshots

**Additional Context**: Any other relevant information
