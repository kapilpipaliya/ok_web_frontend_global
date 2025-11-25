# YSaar Chrome Extension

A Chrome extension for saving and managing YouTube channels and playlists directly from YouTube.com using your YSaar account.

## Features

- 🎯 **One-Click Save**: Save channels and playlists directly from YouTube pages
- 📊 **Quick Stats**: View your YSaar stats in the extension popup
- 🔐 **Seamless Auth**: Uses your existing YSaar login (no separate authentication)
- 🎨 **Consistent UI**: Matches YSaar web app design perfectly
- ⚡ **Live Sync**: Changes sync instantly with your YSaar account

## Configuration

### Changing the Domain

The extension uses a centralized configuration file for easy customization:

**File**: `extension/config.js`

To change the domain (e.g., for local development or staging):

```javascript
// In config.js, change this line:
DOMAIN: "https://ysaar.com",

// To your desired domain:
DOMAIN: "http://localhost:3000",
// or
DOMAIN: "https://staging.ysaar.com",
```

**Other configurable settings**:
- Badge colors and text
- Update intervals
- Floating button position and colors
- Notification duration and position
- Cookie patterns for authentication
- Route paths

See `config.js` for full configuration options.

**Important**: After changing the domain, you must:
1. Update `host_permissions` in `manifest.json` to include your domain
2. Reload the extension in Chrome (`chrome://extensions/` → Reload button)

## Installation

### For Development

1. **Configure Domain** (optional, for local development)
   - Edit `config.js` and change `DOMAIN` to your local server
   - Update `manifest.json` host_permissions if needed

2. **Build Icons** (see `icons/README.md` for instructions)
   - Create icon16.png, icon32.png, icon48.png, icon128.png
   - Or use placeholders for testing

3. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension/` directory from this project
   - The extension should now appear in your extensions list

4. **Verify Installation**:
   - You should see the YSaar icon in your Chrome toolbar
   - Click it to open the popup (you'll need to be logged in to ysaar.com)

### For Production

_Production installation via Chrome Web Store will be available after publishing._

## Usage

### Method 1: Floating Save Button (Recommended)

1. Navigate to any YouTube channel or playlist page
2. Look for the blue "Save to YSaar" floating button in the bottom right
3. Click it to open a modal with the quick add form
4. Fill in optional custom name and select your YouTube account
5. Click "Save" to save the channel/playlist
6. A notification will confirm the save operation and the modal will close automatically

### Method 2: Extension Popup Dashboard

1. Click the YSaar extension icon anytime to open the full YSaar app
2. The popup shows the complete YSaar dashboard with:
   - Full navigation sidebar
   - Your channels, playlists, and videos
   - All YSaar features accessible directly in the popup
3. Navigate through the app just like the full website

## How It Works

### Architecture

This extension uses a unique architecture that maximizes code reuse:

```
Extension Popup (iframe)
    ↓
 ysaar.com/home
    ↓
Full YSaar Application with YTOLayout
    ↓
Complete App Features Available
```

**Key Benefits:**
- Extension popup loads the full YSaar application
- Zero duplication - uses the exact same code as the web app
- All features accessible: navigation, stats, content management
- Automatic updates when web app changes
- Consistent styling and behavior
- Users can navigate through the entire app in the popup

### Components

1. **Manifest (manifest.json)**
   - Defines extension permissions and resources
   - Requires access to ysaar.com and youtube.com

2. **Popup (popup.html + popup.js)**
   - Displays an iframe loading ysaar.com/home (full app)
   - Larger size (800x700px) for better usability
   - Handles authentication errors
   - Manages communication with iframe

3. **Content Script (content.js + content.css)**
   - Injects floating "Save to YSaar" button on YouTube pages
   - Detects current YouTube page type (channel/playlist/video)
   - Shows modal with quick add form in iframe
   - Handles iframe communication for save/close events
   - Shows success/error notifications

4. **Background Worker (background.js)**
   - Updates extension badge based on login status
   - Monitors cookie changes for authentication state

5. **Page Schemas**
   - `YTOExtensionQuickAdd.hjson` - Quick save form for modal
   - Leverages existing YSaar components and functions
   - Main popup uses the full YSaar home page

### Authentication

The extension uses **cookie-based authentication**:
- You must be logged in to ysaar.com in the same browser
- Extension reads session cookies via iframe
- No separate login required
- Works seamlessly across tabs

If you're not logged in:
- Extension popup shows "Not Signed In" message
- Click "Open YSaar" button to log in
- After login, refresh the extension popup

### Data Flow

**Saving from YouTube:**
```
User clicks "Save" button on YouTube
    ↓
Content script extracts URL/ID and shows modal
    ↓
Modal loads quick-add page in iframe
    ↓
User fills form and clicks save
    ↓
Page calls saveChannel/savePlaylist function
    ↓
Data saved to YSaar database
    ↓
Success message posted to parent window
    ↓
Modal closes and notification shown
```

**Using Full App:**
```
User opens extension popup
    ↓
popup.html loads iframe from ysaar.com/home
    ↓
Full YSaar application loads with YTOLayout
    ↓
User can navigate entire app in popup
    ↓
All features work: channels, playlists, videos, settings, etc.
```

## Development

### Prerequisites

- Chrome browser (version 88+)
- YSaar development environment running
- YSaar account for testing

### Project Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup HTML
├── popup.js              # Popup logic
├── content.js            # YouTube page injection
├── content.css           # Injected styles
├── background.js         # Service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Testing

1. **Test Authentication**:
   - Log out of ysaar.com, try to use extension (should show error)
   - Log in, reload extension (should work)

2. **Test Content Script**:
   - Visit various YouTube pages (channel, playlist, video)
   - Verify floating button appears
   - Test save functionality

3. **Test Popup**:
   - Open popup from toolbar
   - Verify stats load correctly
   - Test all buttons and links

4. **Test Multi-Account**:
   - Connect multiple YouTube accounts to YSaar
   - Verify account selector works in quick-add

### Debugging

**Console Logs:**
- Extension popup: Right-click popup → Inspect
- Content script: F12 on YouTube page → Console tab
- Background worker: chrome://extensions → YSaar → "service worker"
- Page schemas: Check ysaar.com network tab for errors

**Common Issues:**

1. **"Not Signed In" error**:
   - Solution: Log in to ysaar.com first

2. **Save button not appearing**:
   - Solution: Reload YouTube page, check content.js is injected

3. **Stats not loading**:
   - Solution: Check if YSaar API is running, inspect iframe console

4. **Changes not reflecting**:
   - Solution: Click "Reload" on chrome://extensions for the extension

### Making Changes

**To modify the popup:**
- The popup loads the full YSaar home page
- Any changes to the home page or YTOLayout will reflect in the popup
- No separate extension-specific page needed

**To modify quick-add form:**
- Edit `src/page_schema/ytorganizer/pages/extension/YTOExtensionQuickAdd.hjson`
- Reload YSaar app
- Test by clicking save button on YouTube

**To modify floating button:**
- Edit `extension/content.js` or `extension/content.css`
- Reload extension on chrome://extensions
- Refresh YouTube page

## Security & Privacy

- Extension only requests necessary permissions
- Uses HTTPS for all communication with ysaar.com
- No data is collected or stored by the extension itself
- All data is saved to your YSaar account via API
- Cookie access is limited to ysaar.com domain

## Permissions Explained

- `cookies`: Read session cookies for authentication
- `activeTab`: Access current YouTube page URL for save feature
- `https://ysaar.com/*`: Load extension UI from YSaar
- `https://www.youtube.com/*`: Inject save button on YouTube pages

## Troubleshooting

### Extension won't install
- Make sure Developer mode is enabled
- Check that all required files exist
- Verify manifest.json is valid JSON

### Popup shows blank page
- Check if ysaar.com is accessible
- Verify you're logged in to YSaar
- Check browser console for CORS errors
- Ensure YSaar is running on https://ysaar.com

### Save button doesn't work
- Check network tab for failed API calls
- Verify you have a connected YouTube account in YSaar
- Check YSaar API quota hasn't been exceeded

### Stats not updating
- The extension caches stats for performance
- Reload the popup to fetch fresh data
- Check if YSaar backend is running

## Future Enhancements

Potential features for future versions:
- [ ] Save videos to playlists
- [ ] Quick search across saved content
- [ ] Keyboard shortcuts for save action
- [ ] Context menu options (right-click to save)
- [ ] Sync indicator showing when save is processing
- [ ] Notification settings
- [ ] Export/import saved content
- [ ] Firefox extension version

## Support

For issues, questions, or feature requests:
- Open an issue in the YSaar repository
- Contact YSaar support at https://ysaar.com/support
- Check YSaar documentation at https://ysaar.com/docs

## License

This extension is part of the YSaar project and follows the same license.

---

Built with ❤️ using YSaar's page schema system
