import { CapacitorCookies } from '@capacitor/core';
import { isServer } from 'solid-js/web';

/**
 * Syncs cookies between the browser and Capacitor native storage.
 * In Capacitor apps, cookies from fetch requests need to be manually synced
 * to ensure they persist across app sessions.
 */
export async function syncCookiesFromResponse(
  response: Response,
  requestUrl: string
): Promise<void> {
  if (isServer) return;

  // Check if running in Capacitor
  const userAgent = navigator.userAgent || '';
  const isCapacitor = userAgent.toLowerCase().includes('capacitor');

  if (!isCapacitor) return;

  try {
    // Get Set-Cookie headers from response
    const setCookieHeaders = response.headers.get('set-cookie');
    if (!setCookieHeaders) return;

    // Parse the URL to get the base domain
    const url = new URL(requestUrl);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Parse and set each cookie in Capacitor storage
    const cookies = setCookieHeaders.split(',').map(c => c.trim());

    for (const cookieString of cookies) {
      const [nameValue, ...attributes] = cookieString.split(';').map(s => s.trim());
      const [key, value] = nameValue.split('=');

      if (key && value) {
        // Parse cookie attributes
        const cookieOptions: {
          url: string;
          key: string;
          value: string;
          path?: string;
          expires?: string;
        } = {
          url: baseUrl,
          key: key.trim(),
          value: value.trim(),
        };

        // Parse additional attributes
        for (const attr of attributes) {
          const [attrName, attrValue] = attr.split('=').map(s => s.trim());
          const attrNameLower = attrName.toLowerCase();

          if (attrNameLower === 'path' && attrValue) {
            cookieOptions.path = attrValue;
          } else if (attrNameLower === 'expires' && attrValue) {
            cookieOptions.expires = attrValue;
          }
        }

        // Set cookie in Capacitor
        await CapacitorCookies.setCookie(cookieOptions);
      }
    }
  } catch (err) {
    console.error('[Cookie Sync] Error syncing cookies:', err);
  }
}

/**
 * Gets all cookies for a URL and returns them as a Cookie header string
 */
export async function getCookiesForRequest(requestUrl: string): Promise<string> {
  if (isServer) return '';

  // Check if running in Capacitor
  const userAgent = navigator.userAgent || '';
  const isCapacitor = userAgent.toLowerCase().includes('capacitor');

  if (!isCapacitor) {
    // For web, use document.cookie
    return document.cookie;
  }

  try {
    const url = new URL(requestUrl);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Get cookies from Capacitor storage
    const result = await CapacitorCookies.getCookies({ url: baseUrl });

    // Convert to Cookie header format
    const cookieString = Object.entries(result)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    return cookieString;
  } catch (err) {
    console.error('[Cookie Sync] Error getting cookies:', err);
    return '';
  }
}
