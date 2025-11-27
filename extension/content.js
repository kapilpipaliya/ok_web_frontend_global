// Content script for YouTube pages
(function() {
  'use strict';

  // Get config (with fallback for safety)
  const CONFIG = (typeof EXTENSION_CONFIG !== 'undefined')
    ? EXTENSION_CONFIG
    : {
        DOMAIN: "https://ysaar.com"
      };

  // Extract origin from DOMAIN for message verification
  const DOMAIN_ORIGIN = new URL(CONFIG.DOMAIN || "https://ysaar.com").origin;

  // Extract YouTube information from current page
  function getYouTubeInfo() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const pageTitle = document.querySelector('title')?.textContent || '';

    const result = {
      channels: [],
      playlists: [],
      videos: []
    };

    // Track unique IDs to avoid duplicates
    const channelIds = new Set();
    const playlistIds = new Set();
    const videoIds = new Set();

    // 1. Extract current page item FIRST (active tab URL)
    // Extract current channel
    if (pathname.startsWith('/channel/') || pathname.startsWith('/@')) {
      const channelId = pathname.startsWith('/@')
        ? pathname.substring(2).split('/')[0]
        : pathname.split('/')[2];

      const channelTitle = document.querySelector('ytd-channel-name yt-formatted-string')?.textContent?.trim() ||
                          document.querySelector('#channel-name')?.textContent?.trim() ||
                          pageTitle.replace(' - YouTube', '').trim();

      // Try to get channel thumbnail from the page
      const channelThumbnail = document.querySelector('ytd-c4-tabbed-header-renderer img')?.src ||
                              document.querySelector('yt-img-shadow#avatar img')?.src ||
                              document.querySelector('#channel-header img')?.src ||
                              document.querySelector('img[class*="avatar"]')?.src ||
                              null;

      if (channelId && !channelIds.has(channelId)) {
        channelIds.add(channelId);
        result.channels.push({
          id: channelId,
          url: url,
          title: channelTitle,
          thumbnail: channelThumbnail,
          isCurrentPage: true
        });
      }
    }

    // Extract current playlist
    const currentPlaylistId = urlParams.get('list');
    if (currentPlaylistId) {
      // Filter out auto-generated playlists (start with "RD") and short system playlists (exactly 2 chars)
      const shouldIncludePlaylist = !currentPlaylistId.startsWith('RD') && currentPlaylistId.length !== 2;

      if (shouldIncludePlaylist) {
        const playlistTitle = document.querySelector('yt-formatted-string.ytd-playlist-header-renderer')?.textContent?.trim() ||
                             document.querySelector('#title')?.textContent?.trim() ||
                             pageTitle.replace(' - YouTube', '').trim();

        // Try to get playlist thumbnail from the page
        const playlistThumbnail = document.querySelector('ytd-playlist-header-renderer img')?.src ||
                                 document.querySelector('ytd-playlist-thumbnail img')?.src ||
                                 document.querySelector('#thumbnail img')?.src ||
                                 null;

        if (!playlistIds.has(currentPlaylistId)) {
          playlistIds.add(currentPlaylistId);
          result.playlists.push({
            id: currentPlaylistId,
            url: `https://www.youtube.com/playlist?list=${currentPlaylistId}`,
            title: playlistTitle,
            thumbnail: playlistThumbnail,
            isCurrentPage: true
          });
        }
      }
    }

    // Extract current video
    const currentVideoId = urlParams.get('v');
    if (currentVideoId) {
      const videoTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent?.trim() ||
                        document.querySelector('h1.title')?.textContent?.trim() ||
                        pageTitle.replace(' - YouTube', '').trim();

      if (!videoIds.has(currentVideoId)) {
        videoIds.add(currentVideoId);
        result.videos.push({
          id: currentVideoId,
          url: `https://www.youtube.com/watch?v=${currentVideoId}`,
          title: videoTitle,
          isCurrentPage: true
        });
      }
    }

    // 2. Extract ALL channels found in the page
    const channelLinks = document.querySelectorAll('a[href*="/channel/"], a[href*="/@"]');
    channelLinks.forEach(link => {
      try {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkUrl = href.startsWith('http') ? new URL(href) : new URL(href, 'https://www.youtube.com');
        const linkPath = linkUrl.pathname;

        let channelId;
        if (linkPath.startsWith('/@')) {
          channelId = linkPath.substring(2).split('/')[0];
        } else if (linkPath.startsWith('/channel/')) {
          channelId = linkPath.split('/')[2];
        }

        if (channelId && !channelIds.has(channelId)) {
          channelIds.add(channelId);

          // Try to get channel name from link text or nearby elements
          const channelName = link.querySelector('#channel-name')?.textContent?.trim() ||
                            link.querySelector('yt-formatted-string')?.textContent?.trim() ||
                            link.textContent?.trim() ||
                            null;

          // Try to get channel thumbnail
          const channelThumbnail = link.querySelector('img')?.src ||
                                  link.closest('ytd-channel-renderer')?.querySelector('img')?.src ||
                                  link.closest('ytd-video-owner-renderer')?.querySelector('img')?.src ||
                                  null;

          result.channels.push({
            id: channelId,
            url: linkUrl.href,
            title: channelName,
            thumbnail: channelThumbnail,
            isCurrentPage: false
          });
        }
      } catch (err) {
        // Skip invalid links
      }
    });

    // 3. Extract ALL playlists found in the page
    const playlistLinks = document.querySelectorAll('a[href*="list="]');
    playlistLinks.forEach(link => {
      try {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkUrl = href.startsWith('http') ? new URL(href) : new URL(href, 'https://www.youtube.com');
        const playlistId = linkUrl.searchParams.get('list');

        // Filter out auto-generated playlists (start with "RD") and short system playlists (exactly 2 chars)
        const shouldIncludePlaylist = playlistId && !playlistId.startsWith('RD') && playlistId.length !== 2;

        if (shouldIncludePlaylist && !playlistIds.has(playlistId)) {
          playlistIds.add(playlistId);

          // Try to get playlist title
          const playlistTitle = link.querySelector('#video-title')?.textContent?.trim() ||
                               link.querySelector('yt-formatted-string')?.textContent?.trim() ||
                               link.textContent?.trim() ||
                               null;

          // Try to get playlist thumbnail
          const playlistThumbnail = link.querySelector('img')?.src ||
                                   link.closest('ytd-playlist-renderer')?.querySelector('img')?.src ||
                                   link.closest('ytd-grid-playlist-renderer')?.querySelector('img')?.src ||
                                   null;

          result.playlists.push({
            id: playlistId,
            url: `https://www.youtube.com/playlist?list=${playlistId}`,
            title: playlistTitle,
            thumbnail: playlistThumbnail,
            isCurrentPage: false
          });
        }
      } catch (err) {
        // Skip invalid links
      }
    });

    // 4. Extract ALL videos found in the page
    const videoLinks = document.querySelectorAll('a[href*="/watch?v="], a[href*="shorts/"]');
    videoLinks.forEach(link => {
      try {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkUrl = href.startsWith('http') ? new URL(href) : new URL(href, 'https://www.youtube.com');
        let videoId;

        if (linkUrl.pathname.startsWith('/shorts/')) {
          videoId = linkUrl.pathname.split('/')[2];
        } else {
          videoId = linkUrl.searchParams.get('v');
        }

        if (videoId && !videoIds.has(videoId)) {
          videoIds.add(videoId);

          // Try to get video title - prioritize different sources
          let videoTitle = null;

          // Check for title in h3 tag (new YouTube layout with yt-lockup-view-model)
          const h3Title = link.closest('yt-lockup-view-model')?.querySelector('h3[title]')?.getAttribute('title');
          if (h3Title) {
            videoTitle = h3Title.trim();
          }

          // Fallback to other methods
          if (!videoTitle) {
            videoTitle = link.getAttribute('title')?.trim() ||
                        link.getAttribute('aria-label')?.trim() ||
                        link.querySelector('#video-title')?.textContent?.trim() ||
                        link.querySelector('yt-formatted-string')?.textContent?.trim() ||
                        null;
          }

          // Clean up aria-label if it contains extra info (e.g., "by Channel Name")
          if (videoTitle && videoTitle.includes(' by ')) {
            videoTitle = videoTitle.split(' by ')[0].trim();
          }

          result.videos.push({
            id: videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            title: videoTitle,
            isCurrentPage: false
          });
        }
      } catch (err) {
        // Skip invalid links
      }
    });

    return result;
  }

  // Listen for messages from popup to extract YouTube info
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_YOUTUBE_INFO') {
      // Wait a moment for page to be fully loaded
      setTimeout(() => {
        const info = getYouTubeInfo();
        console.log('Extracted YouTube info:', info);

        // Send response back through runtime message
        chrome.runtime.sendMessage({
          type: 'YOUTUBE_INFO_RESPONSE',
          data: info
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending response:', chrome.runtime.lastError);
          } else {
            console.log('Response sent successfully');
          }
        });

        // Also send response directly
        sendResponse({ success: true, data: info });
      }, 500);

      return true; // Keep channel open for async response
    }
  });

})();
