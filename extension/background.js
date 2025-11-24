// Background service worker for YSaar extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'save') {
    // Handle save request from content script
    handleSaveRequest(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, message: error.message }));

    // Return true to indicate we'll send response asynchronously
    return true;
  }
});

async function handleSaveRequest(data) {
  try {
    const { type, url, id } = data;

    // Open the extension popup with pre-filled data
    // The popup will handle the actual save operation
    const popupUrl = `https://ysaar.com/extension/quick-add?type=${type}&url=${encodeURIComponent(url)}&id=${id}`;

    // Open in a new tab instead of popup for better UX
    await chrome.tabs.create({ url: popupUrl });

    return { success: true, message: `Opening YSaar to save ${type}...` };
  } catch (error) {
    console.error('Error handling save request:', error);
    return { success: false, message: error.message };
  }
}

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Check if current tab is YouTube
  if (tab.url && tab.url.includes('youtube.com')) {
    // Extract YouTube info and open quick add page
    const urlParams = new URLSearchParams(new URL(tab.url).search);
    const videoId = urlParams.get('v');
    const playlistId = urlParams.get('list');
    const pathname = new URL(tab.url).pathname;

    let type, id;
    if (pathname.startsWith('/channel/') || pathname.startsWith('/@')) {
      type = 'channel';
      id = pathname.startsWith('/@') ? pathname.substring(2) : pathname.split('/')[2];
    } else if (playlistId) {
      type = 'playlist';
      id = playlistId;
    } else if (videoId) {
      type = 'video';
      id = videoId;
    }

    if (type && id) {
      const quickAddUrl = `https://ysaar.com/extension/quick-add?type=${type}&url=${encodeURIComponent(tab.url)}&id=${id}`;
      chrome.tabs.create({ url: quickAddUrl });
    }
  }
});

// Update extension badge based on user state
async function updateBadge() {
  try {
    // Check if user is logged in by checking cookies
    const cookies = await chrome.cookies.getAll({ url: 'https://ysaar.com' });
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('auth'));

    if (sessionCookie) {
      // User is logged in
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
    } else {
      // User is not logged in
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Update badge on install and periodically
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
  // Check every 5 minutes
  setInterval(updateBadge, 5 * 60 * 1000);
});

// Update badge when cookies change
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie.domain.includes('ysaar.com')) {
    updateBadge();
  }
});
