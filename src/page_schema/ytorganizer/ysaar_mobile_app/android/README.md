# Android Native Configuration

This document covers the native Android configurations for the Ysaar mobile app.

## Table of Contents

1. [Cookie Persistence](#cookie-persistence)
---

## Cookie Persistence

### Overview

Cookie persistence ensures that cookies survive app restarts and background/foreground transitions.

### Implementation

#### MainActivity.java

**Location**: `/android/app/src/main/java/com/ysaar/app/MainActivity.java`

```java
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge mode for safe area support
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    }

    @Override
    public void onStart() {
        super.onStart();

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);

            WebSettings webSettings = webView.getSettings();
            webSettings.setDomStorageEnabled(true);
            webSettings.setDatabaseEnabled(true);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    public void onStop() {
        super.onStop();
        CookieManager.getInstance().flush();
    }
}
```

**Key Points**:
- `onStart()`: Configures cookie acceptance and storage settings
- `onPause()` & `onStop()`: Flush cookies to persistent storage
- Requires server-side cookies to have `Max-Age` attribute

### Server-Side Requirements

```javascript
Set-Cookie: sessionId=abc123; Max-Age=2592000; Path=/; Secure; HttpOnly
```

Without `Max-Age`, cookies are treated as session cookies and deleted when app closes.

### Testing

1. Login to app (server sets cookies)
2. Close app completely (swipe from recent apps)
3. Reopen app
4. Verify still logged in
