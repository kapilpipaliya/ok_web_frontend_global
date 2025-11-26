// Background service worker for YSaar extension

// Import config
importScripts('config.js');

// Get domain from config
const DOMAIN = EXTENSION_CONFIG.DOMAIN;
const DOMAIN_URL = new URL(DOMAIN);

// Background script for extension initialization
chrome.runtime.onInstalled.addListener(() => {
  console.log('YSaar extension installed');
});
