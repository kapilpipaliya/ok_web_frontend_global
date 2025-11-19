package com.ysaar.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

// https://github.com/ionic-team/capacitor/issues/3012
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
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
