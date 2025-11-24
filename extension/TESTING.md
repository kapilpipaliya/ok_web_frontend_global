# YSaar Extension Testing Guide

## Prerequisites

Before testing the extension, ensure:

1. **YSaar Development Server Running**
   ```bash
   npm run dev
   ```
   - Server should be running on https://ysaar.com (or your configured domain)
   - You must be logged into YSaar in your browser

2. **Extension Icons Created**
   - See `icons/README.md` for instructions
   - Or use placeholder icons for testing

## Installation Steps

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

2. **Load Extension**
   - Click "Load unpacked"
   - Select the `extension/` directory: `/Users/kapil/kapil/ok_web_frontend_global/extension`
   - Extension should appear in your extensions list

3. **Pin Extension** (Optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "YSaar - YouTube Organizer"
   - Click the pin icon to keep it visible

## Testing Checklist

### 1. Authentication Testing

- [ ] **Not Logged In**
  - Log out of ysaar.com
  - Click extension icon
  - Should show "Not Signed In" error state
  - Click "Open YSaar" button → should open YSaar login page

- [ ] **Logged In**
  - Log into ysaar.com
  - Click extension icon
  - Should load popup with your stats and username
  - Badge should be green (or no badge text)

### 2. Extension Popup Testing

- [ ] **Stats Display**
  - Open extension popup
  - Verify counts for: Channels, Playlists, Videos
  - Numbers should match your actual YSaar data

- [ ] **Quick Actions**
  - Click "Open YSaar" → opens https://ysaar.com/home in new tab
  - Click "View Favourites" → opens https://ysaar.com/content?type=favourites in new tab
  - Click channel/playlist stats → opens respective content pages

- [ ] **Loading States**
  - Refresh extension (close and reopen)
  - Should show loading spinner briefly
  - Then display stats

- [ ] **Error States**
  - Stop YSaar server
  - Open extension popup
  - Should show error message
  - Click "Try Again" → should retry loading

### 3. YouTube Page Integration

Navigate to different YouTube pages and test the floating save button:

- [ ] **Channel Page**
  - Go to any YouTube channel (e.g., https://www.youtube.com/@channelname)
  - Floating "Save to YSaar" button should appear bottom-right
  - Click button → opens YSaar quick-add page in new tab
  - Page should show: "Save Channel to YSaar"
  - URL and channel info should be pre-filled

- [ ] **Playlist Page**
  - Go to any YouTube playlist (URL with `?list=` parameter)
  - Click floating save button
  - Should open quick-add with "Save Playlist to YSaar"
  - Playlist URL should be pre-filled

- [ ] **Video Page**
  - Go to any YouTube video
  - Click floating save button
  - Should open quick-add page
  - Video URL should be pre-filled

### 4. Quick-Add Form Testing

After clicking save button on YouTube:

- [ ] **Loading State**
  - Quick-add page opens
  - Shows loading spinner while fetching YouTube accounts
  - Then displays form

- [ ] **No YouTube Accounts**
  - If no YouTube accounts connected:
  - Should show blue info box
  - "No YouTube accounts connected" message
  - Button to open YSaar settings

- [ ] **With YouTube Accounts**
  - Form should display with:
    - YouTube URL (read-only, pre-filled)
    - YouTube Account dropdown (populated with your accounts)
    - Custom Name field (optional)
    - Save button (primary)
    - Cancel button (secondary)

- [ ] **Account Selection**
  - Dropdown should show your connected YouTube accounts
  - Primary account should be auto-selected
  - Select different account → selection should update

- [ ] **Save Operation**
  - Fill in optional custom name
  - Click "Save" button
  - Button should show "Saving..." and be disabled
  - On success:
    - Green success message appears
    - "Saved successfully! This window will close automatically."
    - Page closes after 2 seconds
  - On error:
    - Red error message appears
    - Error details shown
    - Can retry or cancel

- [ ] **Cancel Operation**
  - Click "Cancel" button
  - Window should close immediately

### 5. Multiple Account Support

If you have multiple YouTube accounts:

- [ ] Primary account is auto-selected in dropdown
- [ ] Can switch between accounts in dropdown
- [ ] Saving with different accounts works correctly

### 6. Notification Testing

- [ ] **Success Notification**
  - After successful save
  - Toast notification should appear in YSaar
  - Success message displayed

- [ ] **Error Notification**
  - After failed save (e.g., network error)
  - Error toast should appear
  - Error details shown

### 7. Badge Status Testing

- [ ] **Logged In State**
  - Badge text should be empty or show green dot
  - Indicates active session

- [ ] **Logged Out State**
  - Badge should show "!" in red
  - Indicates authentication required

### 8. Cross-Tab Sync Testing

- [ ] Open YSaar in one tab
- [ ] Add/remove channels or playlists
- [ ] Open extension popup
- [ ] Stats should reflect changes
- [ ] Or refresh popup to see updates

### 9. Responsive Design

- [ ] Popup fits well in extension window (400x600px)
- [ ] Quick-add page looks good in full browser tab
- [ ] Floating button doesn't overlap YouTube controls
- [ ] All text is readable, buttons are clickable

### 10. Edge Cases

- [ ] **Slow Network**
  - Disable cache in DevTools
  - Throttle network to "Slow 3G"
  - Test loading states and timeouts

- [ ] **Invalid YouTube URLs**
  - Try saving from non-YouTube page
  - Button should not appear or function gracefully

- [ ] **YouTube URL Changes**
  - Navigate between YouTube pages
  - Button should update/reappear correctly

- [ ] **Session Expiry**
  - Let session expire (or clear cookies)
  - Try to use extension
  - Should show auth required state

## Debugging

### View Console Logs

1. **Extension Popup Logs**
   - Right-click popup → "Inspect"
   - Open Console tab

2. **Content Script Logs**
   - On YouTube page, press F12
   - Open Console tab
   - Look for "[YSaar Extension]" prefix

3. **Background Worker Logs**
   - Go to chrome://extensions
   - Find YSaar extension
   - Click "service worker" link
   - View console logs

4. **Page Schema Logs**
   - Open quick-add or popup page
   - Press F12 → Console tab
   - Check for errors from YSaar API

### Common Issues

**Issue**: Popup shows blank page
- **Check**: Is YSaar server running?
- **Check**: Are you logged in to ysaar.com?
- **Check**: Open browser console for CORS errors
- **Solution**: Ensure extension has host permissions for ysaar.com

**Issue**: Floating button not appearing on YouTube
- **Check**: Is content script injected? (Check chrome://extensions)
- **Check**: Reload YouTube page
- **Solution**: Reload extension, then refresh YouTube

**Issue**: Save button doesn't work
- **Check**: Are YouTube accounts connected in YSaar?
- **Check**: Check network tab for failed API calls
- **Solution**: Connect YouTube account at https://ysaar.com/accounts

**Issue**: Stats not loading
- **Check**: Is getUserYTODetails function working?
- **Check**: Check browser console for errors
- **Solution**: Verify YSaar API is responding

## Cleanup After Testing

After testing, you can:

1. **Keep Extension Installed**
   - Use it for daily YouTube management

2. **Disable Extension**
   - Go to chrome://extensions
   - Toggle off "YSaar - YouTube Organizer"

3. **Remove Extension**
   - Go to chrome://extensions
   - Click "Remove" on YSaar extension
   - Confirm removal

## Next Steps After Testing

Once testing is complete:

1. **Create Production Icons**
   - Design proper icons for all sizes
   - Replace placeholder icons

2. **Prepare for Chrome Web Store**
   - Update manifest with production URLs
   - Create promotional images
   - Write store description
   - Submit for review

3. **Monitor Usage**
   - Track extension installs
   - Collect user feedback
   - Fix any reported issues

## Reporting Issues

If you find bugs during testing:

1. Note the exact steps to reproduce
2. Check browser console for error messages
3. Take screenshots if applicable
4. Document:
   - Chrome version
   - YSaar version
   - YouTube page URL
   - Error messages
   - Expected vs actual behavior

---

Happy Testing! 🚀
