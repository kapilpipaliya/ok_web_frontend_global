// Background service worker for YSaar extension

// Import config
importScripts('config.js');

// Get domain from config
const DOMAIN = EXTENSION_CONFIG.DOMAIN;
const DOMAIN_URL = new URL(DOMAIN);

// Background script now primarily handles badge updates
// Modal is handled directly in content script for better UX

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
      const quickAddUrl = EXTENSION_CONFIG.getQuickAddUrl(type, tab.url, id);
      chrome.tabs.create({ url: quickAddUrl });
    }
  }
});

// Update extension badge based on user state
async function updateBadge() {
  try {
    // Check if user is logged in by checking cookies from configured domain
    const cookies = await chrome.cookies.getAll({ url: DOMAIN });

    // Check for session cookies using patterns from config
    const sessionCookie = cookies.find(c =>
      EXTENSION_CONFIG.COOKIE_PATTERNS.some(pattern => c.name.includes(pattern))
    );

    if (sessionCookie) {
      // User is logged in
      chrome.action.setBadgeText({ text: EXTENSION_CONFIG.BADGE.LOGGED_IN.text });
      chrome.action.setBadgeBackgroundColor({ color: EXTENSION_CONFIG.BADGE.LOGGED_IN.color });
    } else {
      // User is not logged in
      chrome.action.setBadgeText({ text: EXTENSION_CONFIG.BADGE.LOGGED_OUT.text });
      chrome.action.setBadgeBackgroundColor({ color: EXTENSION_CONFIG.BADGE.LOGGED_OUT.color });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Update badge on install and periodically
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
  // Check at configured interval
  setInterval(updateBadge, EXTENSION_CONFIG.INTERVALS.BADGE_UPDATE);
});

// Update badge when cookies change
chrome.cookies.onChanged.addListener((changeInfo) => {
  // Check if cookie is from configured domain
  if (changeInfo.cookie.domain.includes(DOMAIN_URL.hostname)) {
    updateBadge();
  }
});
