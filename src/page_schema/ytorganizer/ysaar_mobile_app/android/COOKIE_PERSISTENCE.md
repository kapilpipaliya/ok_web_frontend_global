# Cookie Persistence in Capacitor Android App

## Overview

This document explains how cookie persistence is implemented in the Ysaar mobile app to ensure cookies survive app restarts and background/foreground transitions.

## Problem

By default, cookies in Android WebView may not persist across app restarts because:
1. Cookies need to be explicitly flushed from memory to disk
2. Server must set cookies with proper expiration (`Max-Age` attribute)

## Solution

The solution consists of two components:

### 1. MainActivity Cookie Management (`MainActivity.java`)

**Purpose**: Configure cookie settings and flush cookies to disk

**Location**: `/android/app/src/main/java/com/ysaar/app/MainActivity.java`

```java
public class MainActivity extends BridgeActivity {

    @Override
    public void onStart() {
        super.onStart();

        // Enable cookie acceptance
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Enable third-party cookies
            cookieManager.setAcceptThirdPartyCookies(webView, true);

            // Enable storage
            WebSettings webSettings = webView.getSettings();
            webSettings.setDomStorageEnabled(true);
            webSettings.setDatabaseEnabled(true);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Flush cookies when app goes to background
        CookieManager.getInstance().flush();
    }

    @Override
    public void onStop() {
        super.onStop();
        // Flush cookies when app is no longer visible
        CookieManager.getInstance().flush();
    }
}
```

**Activity Lifecycle**:
- `onStart()`: Configure cookie and storage settings when app starts
- `onPause()`: Flush cookies when app goes to background
- `onStop()`: Flush cookies when app is no longer visible


## Server-Side Requirements

**IMPORTANT**: Cookies must be set with `Max-Age` attribute on the server:

```javascript
// Example server-side cookie setting
Set-Cookie: sessionId=abc123; Max-Age=2592000; Path=/; Secure; HttpOnly
```

**Without `Max-Age`**:
- Cookies are treated as session cookies
- Session cookies are deleted when the app closes
- Even with perfect Android implementation, cookies won't persist

**With `Max-Age`**:
- Cookies are persistent cookies
- They survive app restarts up to the expiration time
- Example: `Max-Age=2592000` = 30 days

## How It Works Together

1. **App Installation/First Launch**:
   - `MainActivity.onStart()` configures cookie acceptance
   - Server sets cookies with `Max-Age`

2. **App Goes to Background**:
   - `MainActivity.onPause()` flushes cookies from memory to disk
   - `MainActivity.onStop()` flushes cookies again (backup)

3. **App Returns to Foreground**:
   - `MainActivity.onStart()` reconfigures settings (idempotent)
   - Cookies automatically loaded from persistent storage

4. **App Restart**:
   - Cookies loaded from disk automatically
   - Still available because they were flushed and have `Max-Age`

## Testing

### Test Cookie Persistence:

1. **Login to app** (server sets cookies)
2. **Close app completely** (swipe away from recent apps)
3. **Reopen app**
4. **Check if still logged in** (cookies should be present)

## References

- [Android CookieManager Documentation](https://developer.android.com/reference/android/webkit/CookieManager)
- [Android WebView Data Directory](https://developer.android.com/reference/android/webkit/WebView#setDataDirectorySuffix(java.lang.String))
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [HTTP Cookie Max-Age Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
