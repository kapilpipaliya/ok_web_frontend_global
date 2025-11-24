// Extension popup script
(function() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const iframe = document.getElementById('app');
  const openYsaarBtn = document.getElementById('openYsaar');

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
    chrome.tabs.create({ url: 'https://ysaar.com/auth/signin' });
  });

  // Listen for messages from iframe
  window.addEventListener('message', function(event) {
    // Only accept messages from ysaar.com
    if (event.origin !== 'https://ysaar.com') return;

    if (event.data.type === 'AUTH_REQUIRED') {
      loading.classList.add('hidden');
      iframe.classList.remove('visible');
      error.classList.add('visible');
    } else if (event.data.type === 'OPEN_TAB') {
      // Open a new tab
      chrome.tabs.create({ url: event.data.url });
    } else if (event.data.type === 'CLOSE_POPUP') {
      // Close the popup
      window.close();
    }
  });

  // Send current YouTube URL to iframe if available
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url && currentTab.url.includes('youtube.com')) {
      // Wait for iframe to load
      iframe.addEventListener('load', function() {
        iframe.contentWindow.postMessage({
          type: 'YOUTUBE_URL',
          url: currentTab.url
        }, 'https://ysaar.com');
      }, { once: true });
    }
  });
})();
