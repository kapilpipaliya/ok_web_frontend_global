// Extension popup script
(function() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const iframe = document.getElementById('app');
  const openYsaarBtn = document.getElementById('openYsaar');

  // Get domain from config (with fallback for safety)
  const DOMAIN = (typeof EXTENSION_CONFIG !== 'undefined' && EXTENSION_CONFIG.DOMAIN)
    ? EXTENSION_CONFIG.DOMAIN
    : 'https://ysaar.com';

  // Extract origin from DOMAIN for message verification
  const DOMAIN_ORIGIN = new URL(DOMAIN).origin;

  // Set iframe source to content page with extension view
  iframe.src = EXTENSION_CONFIG.getUrl('/content?type=extension');

  // Check authentication by trying to load the iframe
  iframe.addEventListener('load', function() {
    // Hide loading
    loading.classList.add('hidden');
    // Show iframe
    iframe.classList.add('visible');
  });

  iframe.addEventListener('error', function() {
    // Hide loading
    loading.classList.add('hidden');
    // Show error
    error.classList.add('visible');
  });

  // Handle not signed in case
  openYsaarBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: `${DOMAIN}/auth/signin` });
  });

  // Listen for messages from iframe
  window.addEventListener('message', function(event) {
    // Only accept messages from configured domain
    if (event.origin !== DOMAIN_ORIGIN) return;

    if (event.data.type === 'AUTH_REQUIRED') {
      loading.classList.add('hidden');
      iframe.classList.remove('visible');
      error.classList.add('visible');
    } else if (event.data.type === 'OPEN_IN_SAME_TAB') {
      // Navigate current tab to the URL
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.update(tabs[0].id, { url: event.data.url });
        }
      });
    } else if (event.data.type === 'CLOSE_POPUP') {
      // Close the popup
      window.close();
    }
  });

  // Helper to extract YouTube info from URL
  function extractYouTubeInfoFromUrl(url, title) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;
      const pageTitle = title ? title.replace(' - YouTube', '').trim() : '';

      const result = {
        channels: [],
        playlists: [],
        videos: []
      };

      // Extract channel
      if (pathname.startsWith('/channel/') || pathname.startsWith('/@')) {
        const channelId = pathname.startsWith('/@')
          ? pathname.substring(2).split('/')[0]
          : pathname.split('/')[2];

        result.channels.push({
          id: channelId,
          url: url,
          title: pageTitle || null
        });
      }

      // Extract playlist
      const playlistId = searchParams.get('list');
      if (playlistId) {
        result.playlists.push({
          id: playlistId,
          url: `https://www.youtube.com/playlist?list=${playlistId}`,
          title: pageTitle || null
        });
      }

      // Extract video
      const videoId = searchParams.get('v');
      if (videoId) {
        result.videos.push({
          id: videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title: pageTitle || null
        });
      }

      return result;
    } catch (err) {
      console.error('Error extracting YouTube info from URL:', err);
      return { channels: [], playlists: [], videos: [] };
    }
  }

  // Helper to extract YouTube info from current tab
  function extractYouTubeInfoFromTab(tab, callback) {
    // Check if current tab is YouTube
    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
      callback({ channels: [], playlists: [], videos: [] });
      return;
    }

    let responded = false;

    // Set up one-time message listener for response from content script
    const messageListener = (message, sender) => {
      if (message.type === 'YOUTUBE_INFO_RESPONSE' && sender.tab && sender.tab.id === tab.id) {
        chrome.runtime.onMessage.removeListener(messageListener);
        if (!responded) {
          responded = true;
          callback(message.data || { channels: [], playlists: [], videos: [] });
        }
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Send message to content script to extract info
    chrome.tabs.sendMessage(tab.id, { type: 'GET_YOUTUBE_INFO' }, (response) => {
      // Handle case where content script is not ready
      if (chrome.runtime.lastError) {
        console.log('Content script not ready, using URL fallback');
        chrome.runtime.onMessage.removeListener(messageListener);
        if (!responded) {
          responded = true;
          // Fallback: extract from URL and tab title
          callback(extractYouTubeInfoFromUrl(tab.url, tab.title));
        }
      } else {
        console.log('Message sent to content script successfully');
      }
    });

    // Timeout after 3 seconds - use fallback
    setTimeout(() => {
      chrome.runtime.onMessage.removeListener(messageListener);
      if (!responded) {
        responded = true;
        console.log('Timeout waiting for content script, using URL fallback');
        callback(extractYouTubeInfoFromUrl(tab.url, tab.title));
      }
    }, 3000);
  }

  // Listen for messages from iframe requesting page content
  window.addEventListener('message', function(event) {
    if (event.origin !== DOMAIN_ORIGIN) return;

    if (event.data.type === 'REQUEST_PAGE_CONTENT') {
      // Get current tab
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentTab = tabs[0];
        extractYouTubeInfoFromTab(currentTab, (pageContent) => {
          // Send to iframe
          iframe.contentWindow.postMessage({
            type: 'PAGE_CONTENT',
            ...pageContent
          }, DOMAIN_ORIGIN);
        });
      });
    }
  });
})();
