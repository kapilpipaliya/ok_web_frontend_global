// Content script for YouTube pages
(function() {
  'use strict';

  // Extract YouTube information from current page
  function getYouTubeInfo() {
    const url = window.location.href;
    const pathname = window.location.pathname;

    // Channel page: /channel/UCxxx or /@handle
    if (pathname.startsWith('/channel/') || pathname.startsWith('/@')) {
      return {
        type: 'channel',
        url: url,
        id: pathname.startsWith('/@') ? pathname.substring(2) : pathname.split('/')[2]
      };
    }

    // Playlist page: has ?list= parameter
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get('list');
    if (playlistId) {
      return {
        type: 'playlist',
        url: url,
        id: playlistId
      };
    }

    // Video page: /watch?v=xxx
    const videoId = urlParams.get('v');
    if (videoId) {
      return {
        type: 'video',
        url: url,
        id: videoId
      };
    }

    return null;
  }

  // Create floating save button
  function createSaveButton() {
    const info = getYouTubeInfo();
    if (!info) return;

    // Check if button already exists
    if (document.getElementById('ysaar-save-button')) return;

    const button = document.createElement('button');
    button.id = 'ysaar-save-button';
    button.className = 'ysaar-floating-button';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H14L21 10V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 3V10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Save to YSaar</span>
    `;

    button.onclick = function() {
      // Send message to background script to save
      chrome.runtime.sendMessage({
        action: 'save',
        data: info
      }, function(response) {
        if (response && response.success) {
          showNotification('Saved to YSaar!', 'success');
        } else {
          showNotification(response?.message || 'Failed to save', 'error');
        }
      });
    };

    document.body.appendChild(button);
  }

  // Show notification
  function showNotification(message, type) {
    // Check if notification already exists
    let notification = document.getElementById('ysaar-notification');
    if (notification) {
      notification.remove();
    }

    notification = document.createElement('div');
    notification.id = 'ysaar-notification';
    notification.className = `ysaar-notification ysaar-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Hide and remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Initialize when page loads
  function init() {
    createSaveButton();
  }

  // Watch for URL changes (YouTube is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      // Remove old button and create new one
      const oldButton = document.getElementById('ysaar-save-button');
      if (oldButton) oldButton.remove();
      createSaveButton();
    }
  }).observe(document, { subtree: true, childList: true });

  // Initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
