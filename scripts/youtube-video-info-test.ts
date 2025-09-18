// npx tsx scripts/youtube-video-info-test.ts
import { google } from 'googleapis';

// YouTube Data API v3 Key
const API_KEY = 'AIzaSyC_CClo37bSKqLUFNKEsDaZgYzTxEQfuds';




// Initialize YouTube API with API key for public data access
const youtube = google.youtube({
  version: 'v3',
  auth: API_KEY  // Use API key for public data access
});

async function getVideoInfo(videoId: string) {
  try {
    console.log(`Fetching info for video ID: ${videoId}`);

    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails', 'status'],
      id: [videoId]
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];

    console.log('\n=== Video Information ===');
    console.log(`Title: ${video.snippet?.title}`);
    console.log(`Channel: ${video.snippet?.channelTitle}`);
    console.log(`Description: ${video.snippet?.description?.substring(0, 200)}...`);
    console.log(`Published: ${video.snippet?.publishedAt}`);
    console.log(`Duration: ${video.contentDetails?.duration}`);
    console.log(`View Count: ${video.statistics?.viewCount}`);
    console.log(`Like Count: ${video.statistics?.likeCount}`);
    console.log(`Comment Count: ${video.statistics?.commentCount}`);
    console.log(`Privacy Status: ${video.status?.privacyStatus}`);

    return video;
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw error;
  }
}

async function searchVideos(query: string, maxResults: number = 5) {
  try {
    console.log(`\nSearching for: "${query}"`);

    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults,
    });

    console.log('\n=== Search Results ===');
    response.data.items?.forEach((item, index) => {
      console.log(`${index + 1}. ${item.snippet?.title}`);
      console.log(`   Channel: ${item.snippet?.channelTitle}`);
      console.log(`   Video ID: ${item.id?.videoId}`);
      console.log(`   Published: ${item.snippet?.publishedAt}`);
      console.log('');
    });

    return response.data.items;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
}

async function getChannelInfo(channelId: string) {
  try {
    console.log(`\nFetching channel info for: ${channelId}`);

    const response = await youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [channelId],
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = response.data.items[0];

    console.log('\n=== Channel Information ===');
    console.log(`Name: ${channel.snippet?.title}`);
    console.log(`Description: ${channel.snippet?.description?.substring(0, 200)}...`);
    console.log(`Subscriber Count: ${channel.statistics?.subscriberCount}`);
    console.log(`Video Count: ${channel.statistics?.videoCount}`);
    console.log(`View Count: ${channel.statistics?.viewCount}`);
    console.log(`Created: ${channel.snippet?.publishedAt}`);

    return channel;
  } catch (error) {
    console.error('Error fetching channel info:', error);
    throw error;
  }
}

async function getPlaylistItems(playlistId: string, maxResults: number = 10) {
  try {
    console.log(`\nFetching playlist items for: ${playlistId}`);

    const response = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId,
      maxResults,
    });

    console.log('\n=== Playlist Items ===');
    response.data.items?.forEach((item, index) => {
      console.log(`${index + 1}. ${item.snippet?.title}`);
      console.log(`   Video ID: ${item.contentDetails?.videoId}`);
      console.log(`   Channel: ${item.snippet?.videoOwnerChannelTitle}`);
      console.log(`   Published: ${item.snippet?.publishedAt}`);
      console.log('');
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching playlist items:', error);
    throw error;
  }
}

// Main function to demonstrate various API calls
async function main() {
  console.log('YouTube API Test Script');
  console.log('=======================');
  console.log('');
  console.log('Using API Key for public data access');
  console.log('- API Key:', API_KEY.substring(0, 10) + '...');
  console.log('');

  try {
    // Test video info - using a popular video ID
    const videoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up
    await getVideoInfo(videoId);

    // Test search
    await searchVideos('SolidJS tutorial', 3);

    // Test channel info - using a popular tech channel
    const channelId = 'UC8butISFwT-Wl7EV0hUK0BQ'; // freeCodeCamp
    await getChannelInfo(channelId);

    // Test playlist - using a public playlist
    const playlistId = 'PLWKjhJtqVAbnZtkAI25WbnIIGKez7CCPX'; // React tutorials playlist
    await getPlaylistItems(playlistId, 5);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}


// Export functions for use in other modules
export {
  getVideoInfo,
  searchVideos,
  getChannelInfo,
  getPlaylistItems,
  API_KEY
};