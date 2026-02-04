package com.lostfinder;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "LostFinderWebView";

    private WebView webView;
    private WebViewAssetLoader assetLoader;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);

        // ✅ 디버깅(PC 크롬 chrome://inspect 로 확인 가능)
        WebView.setWebContentsDebuggingEnabled(true);

        // ✅ 캐시 때문에 이전 빈 화면이 남는 경우 방지
        webView.clearCache(true);
        webView.clearHistory();

        // ✅ React 실행 필수 옵션
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);

        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);

        // file:///android_asset 로 fallback 할 때 필요
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);

        s.setLoadsImagesAutomatically(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setMediaPlaybackRequiresUserGesture(false);

        // 혼합 콘텐츠(필요시)
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // ✅ appassets(https) 로 assets 서빙
        // index.html이 ./static/... 형태(상대경로)라서 /assets/static/...로 요청이 들어옵니다.
        assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d(TAG, "console: " + cm.message() + " @ " + cm.sourceId() + ":" + cm.lineNumber());
                return super.onConsoleMessage(cm);
            }
        });

        webView.setWebViewClient(new WebViewClient() {

            private boolean triedFallback = false;

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                Log.d(TAG, "onPageStarted: " + url);
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d(TAG, "onPageFinished: " + url);
                super.onPageFinished(view, url);

                // ✅ React가 실제로 붙었는지 최종 확인 (root 안에 뭔가 그려졌는지)
                view.evaluateJavascript(
                        "(function(){var r=document.getElementById('root'); return r ? r.innerText.length : -1;})()",
                        value -> Log.d(TAG, "root innerText length: " + value)
                );
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                Log.e(TAG, "onReceivedError: " + request.getUrl() + " / " + error);
                super.onReceivedError(view, request, error);

                // ✅ appassets 로딩이 실패하면 file:///android_asset 로 fallback
                if (!triedFallback && request.isForMainFrame()) {
                    triedFallback = true;
                    Log.e(TAG, "Fallback to file:///android_asset/index.html");
                    view.loadUrl("file:///android_asset/index.html");
                }
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                Log.e(TAG, "onReceivedHttpError: " + request.getUrl() + " / status=" + errorResponse.getStatusCode());
                super.onReceivedHttpError(view, request, errorResponse);
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                WebResourceResponse res = assetLoader.shouldInterceptRequest(url);
                if (res == null) {
                    // 어떤 요청이 빠지는지 확인용(너무 많으면 지저분할 수 있어 주석 처리 가능)
                    // Log.d(TAG, "MISS intercept: " + url);
                } else {
                    // Log.d(TAG, "HIT intercept: " + url);
                }
                return res;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                return assetLoader.shouldInterceptRequest(Uri.parse(url));
            }
        });

        // ✅ 1차: appassets(https) 방식
        // 이 URL은 app/src/main/assets/index.html 을 /assets/ 아래에 매핑합니다.
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
